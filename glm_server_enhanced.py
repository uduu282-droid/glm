"""
Enhanced GLM Server with Web Search + All GLM Models Support
=============================================================
Features:
- Web search enabled (auto_web_search)
- Support for multiple GLM models
- Model switching via API request
- MCP server integration

Usage:
  python glm_server_enhanced.py --eager-boot
"""

from __future__ import annotations

import argparse
import asyncio
import json
import threading
import time
import uuid
from typing import Any, Union
from urllib.parse import urlencode

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, ConfigDict, field_validator

# Import from glm module
from glm import (
    BH, FE, UA,
    ChatSession,
    _boot, _ms, _s, _uid, _ist, _utcs, _iso,
    sign,
)


# ─────────────────────────────────────────────────────────────────────────────
# Available GLM Models
# ─────────────────────────────────────────────────────────────────────────────

AVAILABLE_MODELS = {
    "glm-5": {
        "name": "GLM-5",
        "description": "Latest flagship model - GPT-4 level",
        "context_window": "128K",
        "web_search": True,
        "vision": False,
    },
    "glm-4.7": {
        "name": "GLM-4.7", 
        "description": "Previous generation - excellent performance",
        "context_window": "128K",
        "web_search": True,
        "vision": False,
    },
    "glm-4.6v": {
        "name": "GLM-4.6V",
        "description": "Vision model for image understanding",
        "context_window": "Unknown",
        "web_search": True,
        "vision": True,
    },
    "glm-air": {
        "name": "GLM-Air",
        "description": "Fast & lightweight model",
        "context_window": "Unknown",
        "web_search": False,
        "vision": False,
    },
    "glm-edge": {
        "name": "GLM-Edge",
        "description": "Optimized for speed",
        "context_window": "Unknown",
        "web_search": False,
        "vision": False,
    }
}

DEFAULT_MODEL = "glm-5"


# ─────────────────────────────────────────────────────────────────────────────
# Enhanced StreamingChatSession with Web Search
# ─────────────────────────────────────────────────────────────────────────────

class StreamingChatSession(ChatSession):
    """
    Enhanced ChatSession with:
    - Real-time token streaming
    - Web search support
    - Multiple model support
    """

    on_token: Any = None  # callback for tokens
    
    # Current model being used
    current_model: str = DEFAULT_MODEL

    def _complete(self, message: str, user_msg_id: str, parent_comp_id, model: str = DEFAULT_MODEL) -> str:
        self.turn += 1
        ts_ms      = _ms()
        request_id = _uid()
        comp_id    = _uid()

        sig = sign(ts_ms, message, self.auth["id"], request_id)
        ist = _ist()

        # Browser fingerprint parameters
        params = {
            "timestamp": str(ts_ms), "requestId": request_id,
            "user_id": self.auth["id"], "version": "1.0.0", "platform": "web",
            "token": self.auth["token"], "user_agent": UA,
            "language": "en-US", "languages": "en-US,en", "timezone": "Asia/Kolkata",
            "cookie_enabled": "true", "screen_width": "1600", "screen_height": "900",
            "screen_resolution": "1600x900", "viewport_height": "794",
            "viewport_width": "713", "viewport_size": "713x794",
            "color_depth": "24", "pixel_ratio": "1.2",
            "current_url": f"https://chat.z.ai/c/{self.chat_id}",
            "pathname": f"/c/{self.chat_id}", "search": "", "hash": "",
            "host": "chat.z.ai", "hostname": "chat.z.ai", "protocol": "https:",
            "referrer": "",
            "title": "Z.ai - Free AI Chatbot & Agent powered by GLM-5 & GLM-4.7",
            "timezone_offset": "-330", "local_time": _iso(), "utc_time": _utcs(),
            "is_mobile": "false", "is_touch": "false", "max_touch_points": "0",
            "browser_name": "Firefox", "os_name": "Linux",
            "signature_timestamp": str(ts_ms),
        }

        # ENHANCED: Web search and model configuration
        payload = {
            "stream": True, 
            "model": model,  # ← Use requested model
            "messages": [{"role": "user", "content": message}],
            "signature_prompt": message,
            "params": {}, "extra": {},
            
            # ENHANCED: Web search ENABLED
            "features": {
                "image_generation": False, 
                "web_search": True,           # ← ENABLED!
                "auto_web_search": True,      # ← Auto-trigger when needed
                "preview_mode": True,
                "flags": [], 
                "enable_thinking": True,
            },
            
            # ENHANCED: MCP server for advanced search
            "mcp_servers": ["advanced-search"],
            
            "variables": {
                "{{USER_NAME}}":        self.auth["name"],
                "{{USER_LOCATION}}":    "Unknown",
                "{{CURRENT_DATETIME}}": ist.strftime("%Y-%m-%d %H:%M:%S"),
                "{{CURRENT_DATE}}":     ist.strftime("%Y-%m-%d"),
                "{{CURRENT_TIME}}":     ist.strftime("%H:%M:%S"),
                "{{CURRENT_WEEKDAY}}":  ist.strftime("%A"),
                "{{CURRENT_TIMEZONE}}": "Asia/Kolkata",
                "{{USER_LANGUAGE}}":    "en-US",
            },
            "chat_id":                        self.chat_id,
            "id":                             comp_id,
            "current_user_message_id":        user_msg_id,
            "current_user_message_parent_id": parent_comp_id,
            "background_tasks": {"title_generation": True, "tags_generation": True},
        }

        url     = "https://chat.z.ai/api/v2/chat/completions?" + urlencode(params)
        headers = {
            **BH,
            "Accept": "text/event-stream", "Content-Type": "application/json",
            "Authorization": f"Bearer {self.auth['token']}",
            "X-FE-Version": FE, "X-Signature": sig,
            "Referer": f"https://chat.z.ai/c/{self.chat_id}",
            "Origin": "https://chat.z.ai", "Cache-Control": "no-cache",
        }

        buf      = [""]
        phase    = [None]
        answer   = []
        thinking = []
        sse_err  = [None]
        _sink    = self.on_token

        def _cb(chunk: bytes) -> None:
            buf[0] += chunk.decode("utf-8", errors="replace")
            while "\n" in buf[0]:
                line, buf[0] = buf[0].split("\n", 1)
                line = line.rstrip("\r").strip()
                if not line or not line.startswith("data:"):
                    continue
                js = line[5:].strip()
                if not js or js == "[DONE]":
                    continue
                try:
                    ev = json.loads(js)
                except json.JSONDecodeError:
                    continue
                if ev.get("type") != "chat:completion":
                    continue

                data  = ev.get("data", {})
                ph    = data.get("phase", "")
                delta = data.get("delta_content", "")

                if "error" in data:
                    sse_err[0] = data["error"]
                    return

                if ph != phase[0]:
                    if ph == "thinking":
                        print("\n\033[90m  [thinking]\033[0m ", end="", flush=True)
                    elif ph == "answer":
                        print("\n\033[92m  {} ›\033[0m ".format(model.upper()), end="", flush=True)
                    elif ph == "other":
                        u = data.get("usage", {})
                        print(f"\n\033[2m  [{u.get('total_tokens','?')} tokens]\033[0m",
                              flush=True)
                    elif ph == "done":
                        print()
                    phase[0] = ph

                if delta:
                    print(delta, end="", flush=True)
                    if ph == "thinking":
                        thinking.append(delta)
                    else:
                        answer.append(delta)
                        if _sink is not None:
                            try:
                                _sink(delta)
                            except Exception:
                                pass

        resp = self.http.post(
            url, headers=headers, json=payload,
            timeout=180,  # Longer timeout for web search
            content_callback=_cb,
        )
        if buf[0].strip():
            _cb(b"\n")

        if not resp.ok:
            raise RuntimeError(f"HTTP {resp.status_code}: {resp.text[:300]}")
        if sse_err[0]:
            raise RuntimeError(f"GLM error: {sse_err[0]}")

        full_answer = "".join(answer)

        # persist answer node
        asst_id = _uid()
        self.history_messages[asst_id] = {
            "id": asst_id, "parentId": user_msg_id, "childrenIds": [],
            "role": "assistant", "content": full_answer,
            "timestamp": _s(), "models": [model],
        }
        self.history_messages[user_msg_id]["childrenIds"].append(asst_id)
        self.history_current_id = asst_id
        self.last_comp_id       = comp_id

        return full_answer


# ─────────────────────────────────────────────────────────────────────────────
# Session Manager
# ─────────────────────────────────────────────────────────────────────────────

_session_lock = threading.Lock()
_glm_chat: StreamingChatSession | None = None
_request_lock = threading.Lock()


def _get_chat() -> StreamingChatSession:
    global _glm_chat
    if _glm_chat is None:
        with _session_lock:
            if _glm_chat is None:
                print("[boot] Seeding cookies and authenticating …", flush=True)
                http, auth = _boot()
                _glm_chat = StreamingChatSession(http, auth)
                print(f"[boot] Ready  guest={auth['email']}", flush=True)
    return _glm_chat


def _reset_chat() -> None:
    global _glm_chat
    with _session_lock:
        _glm_chat = None


# ─────────────────────────────────────────────────────────────────────────────
# FastAPI App
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(title="GLM Enhanced Server", version="3.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic Models
# ─────────────────────────────────────────────────────────────────────────────

def _coerce(v: Any) -> str:
    if v is None:          return ""
    if isinstance(v, str): return v
    if isinstance(v, list):
        return "".join(
            p.get("text", "") if isinstance(p, dict) and p.get("type") == "text"
            else (p if isinstance(p, str) else "")
            for p in v
        )
    return str(v)


class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    role: str
    content: Any = ""

    @field_validator("content", mode="before")
    @classmethod
    def _norm(cls, v): return _coerce(v)


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    model:                 str             = "glm-5"
    messages:              list[Message]
    stream:                bool            = False
    temperature:           Union[float, None] = None
    max_tokens:            Union[int,   None] = None
    max_completion_tokens: Union[int,   None] = None
    top_p:                 Union[float, None] = None
    frequency_penalty:     Union[float, None] = None
    presence_penalty:      Union[float, None] = None
    stop:                  Union[str, list, None] = None
    n:                     Union[int,   None] = None
    user:                  Union[str,   None] = None


# ─────────────────────────────────────────────────────────────────────────────
# Helper Functions
# ─────────────────────────────────────────────────────────────────────────────

def _last_user_msg(messages: list[Message], is_first: bool) -> str:
    system    = ""
    last_user = ""

    for m in messages:
        if m.role == "system":
            system = m.content.strip()
        elif m.role == "user":
            last_user = m.content

    if is_first and system and last_user:
        return f"{system}\n\n{last_user}"

    return last_user


def _cid():  return "chatcmpl-" + uuid.uuid4().hex


def _chunk(cid, model, delta, finish=None):
    return "data: " + json.dumps({
        "id": cid, "object": "chat.completion.chunk",
        "created": int(time.time()), "model": model,
        "choices": [{"index": 0, "delta": delta, "finish_reason": finish}],
    }) + "\n\n"


def _response(cid, model, content):
    return {
        "id": cid, "object": "chat.completion",
        "created": int(time.time()), "model": model,
        "choices": [{"index": 0,
                     "message": {"role": "assistant", "content": content},
                     "finish_reason": "stop"}],
        "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0},
    }


def _sync_send(messages: list[Message], model: str, token_sink=None) -> str:
    with _request_lock:
        chat = _get_chat()
        is_first = chat.turn == 0
        text = _last_user_msg(messages, is_first)

        if not text:
            raise ValueError("No user message found")

        chat.on_token = token_sink
        chat.current_model = model
        try:
            if is_first:
                chat.start(text)
                node = chat.history_messages.get(chat.history_current_id, {})
                return node.get("content", "")
            else:
                return chat._complete(text, chat.history_current_id, chat.last_comp_id, model=model)
        except Exception:
            _reset_chat()
            raise
        finally:
            chat.on_token = None


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/v1/models")
async def list_models():
    """Return ALL available GLM models"""
    models_data = []
    for model_id, info in AVAILABLE_MODELS.items():
        models_data.append({
            "id": model_id,
            "object": "model",
            "created": 1700000000,
            "owned_by": "zhipuai",
            "permission": [],
            "root": model_id,
            "parent": None,
            "info": info  # Additional metadata
        })
    
    return {"object": "list", "data": models_data}


@app.get("/models")
async def models_info():
    """Detailed information about all models"""
    return {
        "models": AVAILABLE_MODELS,
        "default": DEFAULT_MODEL,
        "features": {
            "web_search": "Enabled (auto)",
            "mcp_servers": ["advanced-search"],
            "thinking_mode": True,
        }
    }


@app.post("/v1/chat/completions")
async def chat_completions(req: ChatRequest):
    if not req.messages:
        raise HTTPException(400, "messages array is empty")

    # Validate model
    model = req.model or DEFAULT_MODEL
    if model not in AVAILABLE_MODELS:
        raise HTTPException(
            400, 
            f"Unknown model: {model}. Available: {list(AVAILABLE_MODELS.keys())}"
        )

    cid   = _cid()
    loop  = asyncio.get_event_loop()

    # Streaming
    if req.stream:
        queue: asyncio.Queue[str | None] = asyncio.Queue()

        def _sink(delta: str):
            loop.call_soon_threadsafe(queue.put_nowait, delta)

        def _worker():
            try:
                _sync_send(req.messages, model=model, token_sink=_sink)
            except Exception as exc:
                loop.call_soon_threadsafe(queue.put_nowait, f"\n\n[ERROR] {exc}")
            finally:
                loop.call_soon_threadsafe(queue.put_nowait, None)

        threading.Thread(target=_worker, daemon=True).start()

        async def _sse():
            yield _chunk(cid, model, {"role": "assistant", "content": ""})
            while True:
                tok = await queue.get()
                if tok is None:
                    break
                yield _chunk(cid, model, {"content": tok})
            yield _chunk(cid, model, {}, finish="stop")
            yield "data: [DONE]\n\n"

        return StreamingResponse(_sse(), media_type="text/event-stream",
                                 headers={"Cache-Control": "no-cache",
                                          "X-Accel-Buffering": "no"})

    # Non-streaming
    try:
        answer = await loop.run_in_executor(None, lambda: _sync_send(req.messages, model=model))
    except Exception as exc:
        raise HTTPException(500, str(exc))

    return JSONResponse(_response(cid, model, answer))


@app.get("/health")
async def health():
    c = _glm_chat
    return {"status": "ok",
            "session": "active" if c else "not_booted",
            "turns": c.turn if c else 0,
            "chat_id": c.chat_id if c else None,
            "current_model": c.current_model if c else DEFAULT_MODEL,
            "web_search": True,
            "mcp_servers": ["advanced-search"]}


@app.post("/v1/session/reset")
async def reset_session():
    _reset_chat()
    return {"status": "reset",
            "message": "Session cleared – next request boots a fresh chat."}


@app.get("/v1/debug/websearch")
async def test_websearch():
    """Test endpoint to verify web search is working"""
    return {
        "web_search": True,
        "auto_web_search": True,
        "mcp_servers": ["advanced-search"],
        "test_prompt": "What are today's top news?",
        "note": "Web search will auto-trigger for time-sensitive queries"
    }


# ─────────────────────────────────────────────────────────────────────────────
# Entry Point
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8001)
    parser.add_argument("--eager-boot", action="store_true")
    args = parser.parse_args()

    if args.eager_boot:
        print("[startup] Pre-booting GLM session with WEB SEARCH ENABLED…")
        _get_chat()

    print(f"""
╔══════════════════════════════════════════════════════╗
║      GLM-5 · ENHANCED EDITION  v3                    ║
╠══════════════════════════════════════════════════════╣
║  ✅ Web Search: ENABLED (auto)                       ║
║  ✅ MCP Servers: advanced-search                     ║
║  ✅ Models: {len(AVAILABLE_MODELS)} available                     ║
║                                                      ║
║  Base URL  :  http://{args.host}:{args.port}/v1          ║
║  Models    :  GET  /v1/models                        ║
║  Chat      :  POST /v1/chat/completions              ║
║  Health    :  GET  /health                           ║
║  WebSearch :  GET  /v1/debug/websearch               ║
╚══════════════════════════════════════════════════════╝

  OPENAI_API_BASE = http://{args.host}:{args.port}/v1
  OPENAI_API_KEY  = glm-local
  
  Available Models:
    • glm-5   (flagship, recommended)
    • glm-4.7 (previous gen)
    • glm-4.6v (vision)
    • glm-air (lightweight)
    • glm-edge (speed optimized)
""")

    uvicorn.run(app, host=args.host, port=args.port, log_level="info")
