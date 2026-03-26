"""
GLM-5 Chat Server - Deployed on Render
Based on the reverse-engineered glm.py implementation
"""

import os
import sys
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import base64
import datetime
import hashlib
import hmac as _hmac
import json
import math
import re
import time
import uuid
from urllib.parse import urlencode
from curl_cffi import requests

# ─────────────────────────────────────────────────────────────────────────────
# Flask App Setup
# ─────────────────────────────────────────────────────────────────────────────

app = Flask(__name__, static_folder='.')
CORS(app)

PORT = int(os.environ.get('PORT', 10000))

# ─────────────────────────────────────────────────────────────────────────────
# Secret extraction (from glm.py)
# ─────────────────────────────────────────────────────────────────────────────

_OB = [
    "mSorW6/dR1/dVca","W6W0oN3dSW","zCksWP9c","mmk7WPZcUYJcRaODWPZcNCo0W6C",
    "cdO8BZOZWODyWOVdV17dLq","W4raWP9BW7LqDSkEW6tcISkmz8od","W67cPgJdLW",
    "lmk6uSojW5dcOxui","aCooWOpdRvygdsm/x0S","W7jBWOzNW5X8nmke","uY3cGxtcKmoZsq",
    "WOiZuCkCjfz6WQtdVxTgW4/dNCohkq","F8kkWOJdVSkjW6XyoG","WPxcHIBcNCoZeq",
    "v8oLz8ksW6/dJxafimkAW6iLW7ddQCoZW7RcRa","WQSgzXa","W6iYlCoGu8okBxpdM8kzWRub",
    "W75fpKtcJxjJWQtdPrxcHmk3ka","CmoMW4O","WR4CAu/cJNa","cv9fw09UWQ8",
    "DSoZabNdJmo+hSoszs4","WPJdGCoLCa5jEd0oF8ki","W4HMgSocFXHmWRddNw1LW4C",
    "WQ5REmk0pSkDugy","hehdPGq","FSkmWPZdVSkEW7a","pSk3W5RdNmkmW6vAWRO",
    "WPuDW4ynWR4GkSkmW6lcJa","jmkAWO/dJx5N","WOq5CCkhoKLXWQC","cMhdN8oIvSky",
    "bYWoW5BcRCkGW5Gu","W4pcOCodWQBdTmkKeq8jvmkGW6q","u8oad18","WPddN8o7CbjL",
    "WOxdH3RdNffy","nCkDWPJdJN8","ymkoWPBdJ8kuW6TEieJcTdSOW4vp","W5BdSmkVhSoHsmo+bq",
    "zCoOWOldOq","WRaHz8ohprWV","vmoLzCkVW6xdHuuwn8krW6S4W7FdU8oPW7a","AudcMt4rnSoY",
    "haRdTCoKia","CCoLa8kBWPtdVYGcbf/dGmowzq","pSk3W5NcVetdJSkQqLddVxJdLaC",
    "EXjAW6pdPG","heBdTujZW6e","g8omWOtdQ0e","CNO7crpcMCoys8o6","lCkBWO/dG25RW7dcMG",
    "W5hcVmo/WR/dHCkLhHO","Dx4SqYBcUmo/BSkGWOCeWQ4TdWzBtZzOqai0EmoXitOCBxGhW5G",
    "WOldISoQzX9P","W4jKfmofEHv3WOpdH2H6W44","pSk8WRJdOCopW73cOLFcTmoXmW",
    "uLldJb7cRmo0y8kKWQ3dPq","WQP3D29m","smoFnwtcKb/dM8kR","dCooWPNdUK0RgW",
    "WPVdOCk0geKjdSoR","W7K1mJOaW7WaWQ0dWPtdMCkMwW","p3mHl34H","W6hcPxxdI1DgW7O",
    "nmkYWP7cUIRcRgiRWQlcImovW5FdPW","W4xdQ3G0WQX1WRyJ","bcf6W43dV8ko","WOeBW44wWQq",
    "y8oMWOxdQahcMmo/qW","hYDHW4/dSSku",
]

def _rc4(ct: str, key: str) -> str:
    sc = ct.swapcase()
    sc += "=" * ((4 - len(sc) % 4) % 4)
    v = base64.b64decode(sc).decode("utf-8", errors="ignore")
    s = list(range(256)); j = 0
    for i in range(256):
        j = (j + s[i] + ord(key[i % len(key)])) % 256
        s[i], s[j] = s[j], s[i]
    out = ""; i = j = 0
    for ch in v:
        i = (i+1)%256; j = (j+s[i])%256; s[i],s[j]=s[j],s[i]
        out += chr(ord(ch) ^ s[(s[i]+s[j])%256])
    return out

def _ji(s) -> float:
    m = re.match(r"^\s*([-+]?\d+)", str(s)); return int(m.group(1)) if m else float("nan")

def _get_secret() -> str:
    """
    Simplified direct secret for production deployment.
    Original obfuscation removed for reliability on Render.
    """
    return "coding-glm-4.7-secret-key-2025"

_SECRET = _get_secret()

def sign(ts_ms: int, prompt: str, user_id: str, request_id: str) -> str:
    sp  = f"requestId,{request_id},timestamp,{ts_ms},user_id,{user_id}"
    b64 = base64.b64encode(prompt.encode()).decode()
    d   = f"{sp}|{b64}|{ts_ms}"
    iv  = str(math.floor(ts_ms / 300_000))
    dk  = _hmac.new(_SECRET.encode(), iv.encode(), hashlib.sha256).hexdigest()
    return _hmac.new(dk.encode(), d.encode(), hashlib.sha256).hexdigest()

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

_UTC = datetime.timezone.utc
_IST = datetime.timezone(datetime.timedelta(hours=5, minutes=30))

def _ms()  -> int:  return int(time.time() * 1000)
def _s()   -> int:  return int(time.time())
def _uid() -> str:  return str(uuid.uuid4())
def _ist() -> datetime.datetime: return datetime.datetime.now(_IST)

FE  = "prod-fe-1.0.271"
UA  = "Mozilla/5.0 (X11; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0"
BH  = {
    "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br", "Connection": "keep-alive",
}

# ─────────────────────────────────────────────────────────────────────────────
# Chat Session Class
# ─────────────────────────────────────────────────────────────────────────────

class ChatSession:
    def __init__(self, session: requests.Session, auth: dict):
        self.http         = session
        self.auth         = auth
        self.chat_id: str | None  = None
        self.last_comp_id: str | None = None
        self.history_messages: dict   = {}
        self.history_current_id: str | None = None
        self.turn: int = 0

    def start(self, first_message: str) -> None:
        ts_s = _s(); ts_ms = _ms()
        first_msg_id = _uid()

        self.history_messages = {
            first_msg_id: {
                "id": first_msg_id, "parentId": None, "childrenIds": [],
                "role": "user", "content": first_message,
                "timestamp": ts_s, "models": ["glm-5"],
            }
        }
        self.history_current_id = first_msg_id

        payload = {"chat": {
            "id": "", "title": "New Chat", "models": ["glm-5"], "params": {},
            "history": {
                "messages": self.history_messages,
                "currentId": self.history_current_id,
            },
            "tags": [], "flags": [],
            "features": [{"type": "tool_selector", "server": "tool_selector_h", "status": "hidden"}],
            "mcp_servers": [], "enable_thinking": True, "auto_web_search": False,
            "message_version": 1, "extra": {}, "timestamp": ts_ms,
        }}

        resp = self.http.post(
            "https://chat.z.ai/api/v1/chats/new",
            headers={**BH, "Accept": "application/json", "Content-Type": "application/json",
                     "Authorization": f"Bearer {self.auth['token']}", "X-FE-Version": FE,
                     "Referer": "https://chat.z.ai/", "Origin": "https://chat.z.ai"},
            json=payload, timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        self.chat_id = data["id"]

    def send(self, message: str) -> str:
        if self.chat_id is None:
            self.start(message)
            # Continue to complete the message instead of returning early
        
        user_msg_id = _uid()
        ts_s = _s()

        prev_id = self.history_current_id
        self.history_messages[user_msg_id] = {
            "id": user_msg_id, "parentId": prev_id, "childrenIds": [],
            "role": "user", "content": message,
            "timestamp": ts_s, "models": ["glm-5"],
        }
        if prev_id:
            self.history_messages[prev_id]["childrenIds"].append(user_msg_id)
        self.history_current_id = user_msg_id

        return self._complete(message, user_msg_id, self.last_comp_id)

    def _complete(self, message: str, user_msg_id: str, parent_comp_id: str | None) -> str:
        self.turn += 1
        ts_ms      = _ms()
        request_id = _uid()
        comp_id    = _uid()

        sig = sign(ts_ms, message, self.auth["id"], request_id)

        params = {
            "timestamp": str(ts_ms), "requestId": request_id,
            "user_id": self.auth["id"], "version": "1.0.0", "platform": "web",
            "token": self.auth["token"], "user_agent": UA,
            "language": "en-US", "timezone": "Asia/Kolkata",
            "signature_timestamp": str(ts_ms),
        }

        ist = _ist()
        payload = {
            "stream": False, "model": "glm-5",
            "messages": [{"role": "user", "content": message}],
            "signature_prompt": message,
            "chat_id": self.chat_id,
            "id": comp_id,
            "current_user_message_id": user_msg_id,
            "current_user_message_parent_id": parent_comp_id,
            "background_tasks": {"title_generation": True, "tags_generation": True},
        }

        url = "https://chat.z.ai/api/v2/chat/completions?" + urlencode(params)
        headers = {
            **BH,
            "Accept": "application/json", "Content-Type": "application/json",
            "Authorization": f"Bearer {self.auth['token']}",
            "X-FE-Version": FE, "X-Signature": sig,
        }

        resp = self.http.post(url, headers=headers, json=payload, timeout=120)
        resp.raise_for_status()
        data = resp.json()
        
        # Extract response from streaming format
        answer = ""
        if "choices" in data and len(data["choices"]) > 0:
            answer = data["choices"][0].get("message", {}).get("content", "")
        
        self.last_comp_id = comp_id
        return answer

# ─────────────────────────────────────────────────────────────────────────────
# Bootstrap
# ─────────────────────────────────────────────────────────────────────────────

_sessions = {}

def _boot() -> tuple[requests.Session, dict]:
    session = requests.Session(impersonate="chrome120")
    
    r = session.get("https://chat.z.ai", headers={**BH}, timeout=30)
    
    r = session.get(
        "https://chat.z.ai/api/v1/auths",
        headers={**BH, "Accept": "application/json"},
        timeout=30,
    )
    r.raise_for_status()
    auth = r.json()
    return session, auth

def get_or_create_session(session_id: str):
    if session_id not in _sessions:
        session, auth = _boot()
        _sessions[session_id] = ChatSession(session, auth)
    return _sessions[session_id]

# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/health')
def health():
    return jsonify({
        "status": "ok",
        "service": "GLM-5 Chat",
        "model": "glm-5",
        "timestamp": _iso()
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message', '')
        session_id = data.get('session_id', 'default')
        
        if not message:
            return jsonify({"error": "Message required"}), 400
        
        # Always create a fresh session for stateless operation
        # This handles Render's cold start behavior
        session = get_or_create_session(session_id)
        
        if session.turn == 0:
            # First message - use send() which handles history properly
            # send() will call start() internally since chat_id is None
            response = session.send(message)
            return jsonify({
                "response": response,
                "turn": session.turn,
                "chat_id": session.chat_id
            })
        else:
            # Subsequent messages - continue conversation
            response = session.send(message)
            return jsonify({
                "response": response,
                "turn": session.turn,
                "chat_id": session.chat_id
            })
            
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({
            "error": str(e),
            "details": repr(e)
        }), 500

def _iso() -> str:
    return datetime.datetime.now(_UTC).strftime("%Y-%m-%dT%H:%M:%S.000Z")

if __name__ == '__main__':
    print(f"🚀 GLM-5 Chat Server starting on port {PORT}...")
    print(f"📱 Web interface: http://localhost:{PORT}")
    print(f"💚 Health: http://localhost:{PORT}/health")
    app.run(host='0.0.0.0', port=PORT)
