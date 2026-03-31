"""
glm_server.py  –  OpenAI-compatible local API server for z.ai / GLM-5
======================================================================
Exposes:
  GET  /v1/models
  POST /v1/chat/completions   (streaming & non-streaming)
  POST /v1/session/reset      (force-reset the GLM chat)
  GET  /health

Usage:
  pip install fastapi uvicorn curl_cffi
  python glm_server.py               # listens on http://localhost:8000
  python glm_server.py --port 11434  # custom port
  python glm_server.py --eager-boot  # pre-boot session on startup

Point any OpenAI client at:
  base_url = "http://localhost:8000/v1"
  api_key  = "glm-local"   # accepted but ignored

Design notes:
  - One ChatSession is booted once and reused for ALL requests.
    (No more [1] Seeding cookies … on every turn.)
  - Only the LAST user message is forwarded each turn; Cline/Cursor send
    the full history in messages[] but GLM already has session memory.
  - Streaming pushes every answer-phase token to the client in real-time
    via loop.call_soon_threadsafe → asyncio.Queue → SSE.
  - POST /v1/session/reset lets you start a fresh GLM chat without
    restarting the server.
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
from pydantic import BaseModel, validator

# ── GLM internals ─────────────────────────────────────────────────────────────
from glm import (  # type: ignore
    BH, FE, UA,
    ChatSession,
    _boot, _ms, _s, _uid, _ist, _utcs, _iso,
    sign,
)

# ─────────────────────────────────────────────────────────────────────────────
# StreamingChatSession
# ─────────────────────────────────────────────────────────────────────────────

class StreamingChatSession(ChatSession):
    """
    Subclass of ChatSession that calls self.on_token(delta) for every
    answer-phase token as it arrives from the GLM SSE stream.
    """

    on_token: Any = None  # callable(str) | None – set before start()/send()

    def _complete(self, message: str, user_msg_id: str, parent_comp_id) -> str:
        self.turn += 1
        ts_ms      = _ms()
        request_id = _uid()
        comp_id    = _uid()

        sig = sign(ts_ms, message, self.auth["id"], request_id)
        ist = _ist()

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

        payload = {
            "stream": True, "model": "glm-5",
            "messages": [{"role": "user", "content": message}],
            "signature_prompt": message,
            "params": {}, "extra": {},
            "features": {
                "image_generation": False, "web_search": False,
                "auto_web_search": True, "preview_mode": True,
                "flags": [], "enable_thinking": True,
            },
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
            "mcp_servers": ["advanced-search"],
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
        sse_err  = [None]
        _sink    = self.on_token  # capture once so closure is safe

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
                        print("\n\033[92m  GLM-5 ›\033[0m ", end="", flush=True)
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
                        pass   # don't stream thinking tokens to client
                    else:
                        answer.append(delta)
                        # ── real-time token push ──────────────────────────
                        if _sink is not None:
                            try:
                                _sink(delta)
                            except Exception:
                                pass

        resp = self.http.post(
            url, headers=headers, json=payload,
            timeout=120, content_callback=_cb,
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
            "timestamp": _s(), "models": ["glm-5"],
        }
        self.history_messages[user_msg_id]["childrenIds"].append(asst_id)
        self.history_current_id = asst_id
        self.last_comp_id       = comp_id

        return full_answer


# ─────────────────────────────────────────────────────────────────────────────
# Persistent session  –  one boot, reused forever
# ─────────────────────────────────────────────────────────────────────────────

_session_lock = threading.Lock()
_glm_chat: StreamingChatSession | None = None
_request_lock = threading.Lock()   # serialise concurrent requests


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
# FastAPI app
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(title="GLM-5 OpenAI-compatible proxy", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

# ─────────────────────────────────────────────────────────────────────────────
# Pydantic models
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
    role: str
    content: Any = ""

    class Config:
        extra = "ignore"

    @validator("content", pre=True)
    @classmethod
    def _norm(cls, v): return _coerce(v)


class ChatRequest(BaseModel):
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

    class Config:
        extra = "ignore"

# ─────────────────────────────────────────────────────────────────────────────
# Message extraction
# ─────────────────────────────────────────────────────────────────────────────

def _last_user_msg(messages: list[Message], is_first: bool) -> str:
    """
    GLM manages all history server-side via chat_id + parent-ID chain:

        Turn N payload carries:
          'id'                             = new UUID (becomes next turn's parent)
          'current_user_message_id'        = new UUID for this user node
          'current_user_message_parent_id' = previous turn's 'id'

    So we NEVER replay prior turns from messages[]. Cline/Cursor include the
    full conversation history on every request; we discard everything except
    the LAST user message. System prompt is injected once on turn 1 only.

    Turn 1 : system_prompt + last_user_message  ->  chat.start()
    Turn N : last_user_message only             ->  chat.send()
    """
    system    = ""
    last_user = ""

    for m in messages:
        if m.role == "system":
            system = m.content.strip()   # keep last system msg seen
        elif m.role == "user":
            last_user = m.content        # keep overwriting -> ends up as last

    # System prompt prepended on turn 1 only; silently dropped after
    if is_first and system and last_user:
        return f"{system}\n\n{last_user}"

    return last_user

# ─────────────────────────────────────────────────────────────────────────────
# OpenAI response helpers
# ─────────────────────────────────────────────────────────────────────────────

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

# ─────────────────────────────────────────────────────────────────────────────
# Core sync send  (always runs inside a thread)
# ─────────────────────────────────────────────────────────────────────────────

def _sync_send(messages: list[Message], token_sink=None) -> str:
    with _request_lock:          # one GLM request at a time
        chat     = _get_chat()
        is_first = chat.turn == 0
        text     = _last_user_msg(messages, is_first)

        if not text:
            raise ValueError("No user message found in messages[]")

        chat.on_token = token_sink
        try:
            if is_first:
                chat.start(text)
                node = chat.history_messages.get(chat.history_current_id, {})
                return node.get("content", "")
            else:
                return chat.send(text)
        except Exception:
            _reset_chat()   # start fresh after any error
            raise
        finally:
            chat.on_token = None

# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/v1/models")
async def list_models():
    return {"object": "list", "data": [{
        "id": "glm-5", "object": "model", "created": 1700000000,
        "owned_by": "zhipuai", "permission": [], "root": "glm-5", "parent": None,
    }]}


@app.post("/v1/chat/completions")
async def chat_completions(req: ChatRequest):
    if not req.messages:
        raise HTTPException(400, "messages array is empty")

    cid   = _cid()
    model = req.model or "glm-5"
    loop  = asyncio.get_event_loop()

    # ── streaming ─────────────────────────────────────────────────────────────
    if req.stream:
        queue: asyncio.Queue[str | None] = asyncio.Queue()

        def _sink(delta: str):
            loop.call_soon_threadsafe(queue.put_nowait, delta)

        def _worker():
            try:
                _sync_send(req.messages, token_sink=_sink)
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

    # ── non-streaming ─────────────────────────────────────────────────────────
    try:
        answer = await loop.run_in_executor(None, lambda: _sync_send(req.messages))
    except Exception as exc:
        raise HTTPException(500, str(exc))

    return JSONResponse(_response(cid, model, answer))


@app.get("/health")
async def health():
    c = _glm_chat
    return {"status": "ok",
            "service": "GLM-5 Chat",
            "session": "active" if c else "not_booted",
            "turns": c.turn if c else 0,
            "chat_id": c.chat_id if c else None,
            "timestamp": time.time()}


@app.post("/health")
async def health_post():
    """POST endpoint for uptime bots that use POST instead of GET"""
    c = _glm_chat
    return {"status": "ok",
            "service": "GLM-5 Chat",
            "session": "active" if c else "not_booted",
            "turns": c.turn if c else 0,
            "chat_id": c.chat_id if c else None,
            "timestamp": time.time()}


@app.post("/v1/session/reset")
async def reset_session():
    """Start a fresh GLM chat without restarting the server."""
    _reset_chat()
    return {"status": "reset",
            "message": "Session cleared – next request boots a fresh chat."}


@app.post("/v1/debug")
async def debug_echo(request: Request):
    """Echo the raw request body to diagnose 422 errors."""
    body = await request.body()
    try:    parsed = json.loads(body)
    except: parsed = body.decode(errors="replace")
    return {"raw": parsed}


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import os
    
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8000)))
    parser.add_argument("--eager-boot", action="store_true",
                        help="Boot GLM session immediately on startup")
    args = parser.parse_args()

    if args.eager_boot:
        print("[startup] Pre-booting GLM session …")
        _get_chat()

    print(f"""
╔══════════════════════════════════════════════════════╗
║      GLM-5  ·  OpenAI-compatible proxy  v2           ║
╠══════════════════════════════════════════════════════╣
║  Base URL  :  http://{args.host}:{args.port}/v1          ║
║  Models    :  GET  /v1/models                        ║
║  Chat      :  POST /v1/chat/completions              ║
║  Reset     :  POST /v1/session/reset                 ║
║  Health    :  GET/POST /health                       ║
╚══════════════════════════════════════════════════════╝

  OPENAI_API_BASE = http://{args.host}:{args.port}/v1
  OPENAI_API_KEY  = glm-local
""")

    uvicorn.run(app, host=args.host, port=args.port, log_level="info")