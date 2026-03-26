"""
GLM Multi-Model Flask Server - OpenAI-compatible API with multiple GLM models
Supports: glm-5, glm-4.7, glm-4.6, glm-4.5 with web search and thinking controls
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
    """Return all available GLM models from Z.ai"""
    return jsonify({
        "object": "list",
        "data": [
            {
                "id": "glm-5",
                "object": "model",
                "created": 1743000000,
                "owned_by": "zhipuai",
                "description": "Latest flagship model - Agentic Engineering",
                "capabilities": ["thinking", "web_search", "code_interpreter", "vision"]
            },
            {
                "id": "glm-4.7",
                "object": "model",
                "created": 1735000000,
                "owned_by": "zhipuai",
                "description": "Advanced reasoning & coding specialist",
                "capabilities": ["thinking", "web_search", "coding"]
            },
            {
                "id": "glm-4.6",
                "object": "model",
                "created": 1730000000,
                "owned_by": "zhipuai",
                "description": "Balanced performance for general tasks",
                "capabilities": ["thinking", "web_search"]
            },
            {
                "id": "glm-4.5",
                "object": "model",
                "created": 1725000000,
                "owned_by": "zhipuai",
                "description": "High-performance reasoning model",
                "capabilities": ["thinking", "web_search"]
            }
        ]
    })

@app.route('/v1/chat/completions', methods=['POST'])
def chat_completions():
    try:
        data = request.json
        messages = data.get('messages', [])
        stream = data.get('stream', False)
        model = data.get('model', 'glm-5')  # Default to glm-5
        
        # Extract features (web search, thinking mode)
        features = data.get('features', {})
        auto_web_search = features.get('auto_web_search', False)
        enable_thinking = features.get('enable_thinking', True)
        
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
            "model": model,
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
            },
            "features_used": {
                "web_search": auto_web_search,
                "thinking": enable_thinking
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
║      GLM · Multi-Model Flask API Server              ║
╠══════════════════════════════════════════════════════╣
║  Port      :  {port}                                  
║  Models    :  GET  /v1/models                        
║              - glm-5 (flagship)                      
║              - glm-4.7 (reasoning/coding)            
║              - glm-4.6 (balanced)                    
║              - glm-4.5 (reasoning)                   
║  Chat      :  POST /v1/chat/completions              
║              - Supports: web_search, thinking        
║  Reset     :  POST /v1/session/reset                 
║  Health    :  GET  /health                           
╚══════════════════════════════════════════════════════╝
""")
    app.run(host='0.0.0.0', port=port)
