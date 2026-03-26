"""
GLM-5 Flask Server - Simple OpenAI-compatible API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import time
import uuid
import threading
from glm import ChatSession, _boot

app = Flask(__name__)
CORS(app)

# Global session
_lock = threading.Lock()
_session = None

def get_session():
    global _session
    if _session is None:
        with _lock:
            if _session is None:
                print("[boot] Initializing GLM session...")
                http, auth = _boot()
                _session = ChatSession(http, auth)
                print(f"[boot] Ready! User: {auth.get('email', 'unknown')}")
    return _session

@app.route('/health')
def health():
    s = get_session()
    return jsonify({
        "status": "ok",
        "turns": s.turn if s else 0,
        "chat_id": s.chat_id if s else None
    })

@app.route('/v1/models')
def list_models():
    return jsonify({
        "object": "list",
        "data": [{
            "id": "glm-5",
            "object": "model",
            "created": 1700000000,
            "owned_by": "zhipuai"
        }]
    })

@app.route('/v1/chat/completions', methods=['POST'])
def chat_completions():
    try:
        data = request.json
        messages = data.get('messages', [])
        stream = data.get('stream', False)
        
        # Extract last user message
        last_user_msg = ""
        system_msg = ""
        for msg in messages:
            if msg.get('role') == 'system':
                system_msg = msg.get('content', '')
            elif msg.get('role') == 'user':
                last_user_msg = msg.get('content', '')
        
        if not last_user_msg:
            return jsonify({"error": "No user message found"}), 400
        
        # Prepare full message (system + user on first turn)
        session = get_session()
        is_first = session.turn == 0
        
        if is_first and system_msg:
            full_msg = f"{system_msg}\n\n{last_user_msg}"
        else:
            full_msg = last_user_msg
        
        # Send to GLM
        if is_first:
            session.start(full_msg)
            node = session.history_messages.get(session.history_current_id, {})
            answer = node.get('content', '')
        else:
            answer = session.send(full_msg)
        
        # Return OpenAI-compatible response
        chat_id = f"chatcmpl-{uuid.uuid4().hex}"
        return jsonify({
            "id": chat_id,
            "object": "chat.completion",
            "created": int(time.time()),
            "model": "glm-5",
            "choices": [{
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": answer
                },
                "finish_reason": "stop"
            }],
            "usage": {
                "prompt_tokens": 0,
                "completion_tokens": 0,
                "total_tokens": 0
            }
        })
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/v1/session/reset', methods=['POST'])
def reset_session():
    """Reset GLM session"""
    global _session
    with _lock:
        _session = None
    return jsonify({"status": "reset", "message": "Session cleared"})

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 8000))
    print(f"""
╔══════════════════════════════════════════════════════╗
║      GLM-5 · Flask API Server                        ║
╠══════════════════════════════════════════════════════╣
║  Port      :  {port}                                  
║  Models    :  GET  /v1/models                        
║  Chat      :  POST /v1/chat/completions              
║  Reset     :  POST /v1/session/reset                 
║  Health    :  GET  /health                           
╚══════════════════════════════════════════════════════╝
""")
    app.run(host='0.0.0.0', port=port)
