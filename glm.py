import base64
import datetime
import hashlib
import hmac as _hmac
import json
import math
import re
import sys
import time
import uuid
from urllib.parse import urlencode

from curl_cffi import requests

# ─────────────────────────────────────────────────────────────────────────────
# Secret extraction
# ─────────────────────────────────────────────────────────────────────────────

_OB = [
    "mSorW6/dR1/dVca","W6W0oN3dSW","zCksWP9c","mmk7WPZcUYJcRaODWPZcNCo0W6C",
    "cdO8BZOZWODyWOVdV17dLq","W4raWP9BW7LqDSkEW6tcISkmz8od","W67cPgJdLW",
    "lmk6uSojW5dcOxui","aCooWOpdRvygdsm/x0S","W7jBWOzNW5X8nmke","uY3cGxtcKmoZsq",
    "WOiZuCkCjfz6WQtdVxTgW4/dNCohkq","F8kkWOJdVSkjW6XyoG","WPxcHIBcNCoZeq",
    "v8oLz8ksW6/dJxafimkAW6iLW7ddQCoZW7RcRa","WQSgzXa","W6iYlCoGu8okBxpdM8kzWRub",
    "W75fpKtcJxjJWQtdPrxcHmk3ka","CmoMW4O","WR4CAu/cJNa","cv9fw09UWQ8",
    "DSoZabNdJmo+hSoszs4","WPJdGCoLCa5jEd0oF8ki","W4HMgSocFXHmWRddNw1LW4C",
    "WQ5REmk0pSkDugy","hehdPGq","FSkmWPZdVSkEW7a","pKSkW5RdNmkmW6vAWRO",
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
    for sh in range(len(_OB)):
        arr = _OB[sh:] + _OB[:sh]
        def K(n, k, a=arr):
            try:   return _ji(_rc4(a[n-321], k))
            except: return float("nan")
        try:
            v = (-K(382,"e0Pb")/1 + -K(384,"rNOY")/2*(-K(354,"j5ih")/3)
                 +-K(330,"$VZ*")/4*(K(368,"X3X9")/5) + K(373,"xFg0")/6
                 + K(343,"xSk8")/7*(K(337,"rNOY")/8) +-K(332,"MS8V")/9+K(344,"!l!0")/10)
            if int(v) == 251693:
                return _rc4(arr[380-321], "PPoK")
        except: pass
    raise RuntimeError("Secret extraction failed")

_SECRET = _get_secret()

# ─────────────────────────────────────────────────────────────────────────────
# Signature
# ─────────────────────────────────────────────────────────────────────────────

def sign(ts_ms: int, prompt: str, user_id: str, request_id: str) -> str:
    """HMAC-SHA256 rolling-window signature (verified against captured traffic)."""
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
def _utcs()-> str:  return datetime.datetime.now(_UTC).strftime("%a, %d %b %Y %H:%M:%S GMT")
def _iso() -> str:  return datetime.datetime.now(_UTC).strftime("%Y-%m-%dT%H:%M:%S.000Z")

FE  = "prod-fe-1.0.271"
UA  = "Mozilla/5.0 (X11; Linux x86_64; rv:148.0) Gecko/20100101 Firefox/148.0"
BH  = {
    "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br", "Connection": "keep-alive",
    "Sec-Fetch-Site": "same-origin", "Sec-Fetch-Mode": "cors", "Sec-Fetch-Dest": "empty",
}

# ─────────────────────────────────────────────────────────────────────────────
# Chat session
# ─────────────────────────────────────────────────────────────────────────────

class ChatSession:

    def __init__(self, session: requests.Session, auth: dict):
        self.http         = session
        self.auth         = auth                  # id, token, name
        self.chat_id: str | None  = None
        self.last_comp_id: str | None = None      # previous turn's comp_id → next parent
        self.history_messages: dict   = {}        # for /api/v1/chats/new history payload
        self.history_current_id: str | None = None
        self.turn: int = 0

    # ── initialise ────────────────────────────────────────────────────────────

    def start(self, first_message: str) -> None:
        """Create the chat on the server with the first user message seeded."""
        ts_s = _s(); ts_ms = _ms()
        first_msg_id = _uid()

        # seed history with the first user message node
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
        print(f"  chat_id = {self.chat_id}")

        # send the first message (comp_id becomes last_comp_id for turn 2)
        self._complete(first_message, first_msg_id, parent_comp_id=None)

    # ── subsequent turns ──────────────────────────────────────────────────────

    def send(self, message: str) -> str:
        """Send a follow-up message, using the previous turn's comp_id as parent."""
        if self.chat_id is None:
            raise RuntimeError("Call start() first")

        user_msg_id = _uid()
        ts_s = _s()

        # append user message node to local history
        prev_id = self.history_current_id
        self.history_messages[user_msg_id] = {
            "id": user_msg_id, "parentId": prev_id, "childrenIds": [],
            "role": "user", "content": message,
            "timestamp": ts_s, "models": ["glm-5"],
        }
        if prev_id:
            self.history_messages[prev_id]["childrenIds"].append(user_msg_id)
        self.history_current_id = user_msg_id

        return self._complete(message, user_msg_id, parent_comp_id=self.last_comp_id)

    # ── completion request ────────────────────────────────────────────────────

    def _complete(self, message: str, user_msg_id: str, parent_comp_id: str | None) -> str:
        self.turn += 1
        ts_ms      = _ms()
        request_id = _uid()
        comp_id    = _uid()   # this turn's ID; becomes next turn's parent

        sig = sign(ts_ms, message, self.auth["id"], request_id)

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

        ist = _ist()
        payload = {
            "stream": True, "model": "glm-5",
            "messages": [{"role": "user", "content": message}],  # only current message
            "signature_prompt": message,
            "params": {}, "extra": {},
            "features": {
                "image_generation": False, "web_search": False,
                "auto_web_search": False, "preview_mode": True,
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
            # ── history linkage ──────────────────────────────────────────────
            "chat_id":                        self.chat_id,
            "id":                             comp_id,           # (A) stored as next parent
            "current_user_message_id":        user_msg_id,       # (B) this user node
            "current_user_message_parent_id": parent_comp_id,    # (C) prev turn's (A)
            # ────────────────────────────────────────────────────────────────
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

        # ── streaming state ──────────────────────────────────────────────────
        buf        = [""]   # mutable line accumulator (list so closure can mutate)
        phase      = [None]
        answer     = []
        thinking   = []
        sse_error  = [None]

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
                    sse_error[0] = data["error"]
                    print(f"\n\033[31m[error]\033[0m {data['error']}", flush=True)
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
                        print()   # newline after last token
                    phase[0] = ph

                if delta:
                    print(delta, end="", flush=True)
                    (thinking if ph == "thinking" else answer).append(delta)

        resp = self.http.post(
            url, headers=headers, json=payload,
            timeout=120, content_callback=_cb,
        )

        # flush any tail without trailing newline
        if buf[0].strip():
            _cb(b"\n")

        if not resp.ok:
            raise RuntimeError(f"HTTP {resp.status_code}: {resp.text[:300]}")

        full_answer = "".join(answer)

        # ── persist answer node to local history ──────────────────────────────
        asst_id = _uid()
        self.history_messages[asst_id] = {
            "id": asst_id, "parentId": user_msg_id, "childrenIds": [],
            "role": "assistant", "content": full_answer,
            "timestamp": _s(), "models": ["glm-5"],
        }
        self.history_messages[user_msg_id]["childrenIds"].append(asst_id)
        self.history_current_id = asst_id

        # ── advance parent pointer for next turn ──────────────────────────────
        self.last_comp_id = comp_id

        return full_answer


# ─────────────────────────────────────────────────────────────────────────────
# Bootstrap
# ─────────────────────────────────────────────────────────────────────────────

def _boot() -> tuple[requests.Session, dict]:
    """Seed cookies and obtain guest JWT."""
    session = requests.Session(impersonate="chrome120")

    print("[1] Seeding cookies …")
    r = session.get(
        "https://chat.z.ai",
        headers={**BH, "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
                 "Sec-Fetch-Mode": "navigate", "Sec-Fetch-Dest": "document",
                 "Upgrade-Insecure-Requests": "1"},
        timeout=30,
    )
    print(f"    status={r.status_code}")

    print("[2] Authenticating …")
    r = session.get(
        "https://chat.z.ai/api/v1/auths",
        headers={**BH, "Accept": "application/json", "Referer": "https://chat.z.ai/"},
        timeout=30,
    )
    r.raise_for_status()
    auth = r.json()
    print(f"    guest={auth['email']}")
    return session, auth


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print(f"z.ai GLM-5 client  (secret: {_SECRET[:10]}…)\n")

    # single-shot mode
    single = " ".join(sys.argv[1:]).strip() if len(sys.argv) > 1 else ""

    session, auth = _boot()
    chat = ChatSession(session, auth)

    if single:
        # ── one-shot ──────────────────────────────────────────────────────────
        print(f"\n[3] Starting chat …")
        print(f"\n\033[96m  You ›\033[0m {single}")
        chat.start(single)
        return

    # ── interactive REPL ──────────────────────────────────────────────────────
    print("\n[3] Starting chat …  (type 'exit' or Ctrl-C to quit)\n")
    print("─" * 60)
    first = True
    while True:
        try:
            user_input = input("\n\033[96m  You › \033[0m").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye.")
            break

        if not user_input:
            continue
        if user_input.lower() in {"exit", "quit", "q"}:
            print("Goodbye.")
            break

        if first:
            chat.start(user_input)
            first = False
        else:
            chat.send(user_input)

        print("\n" + "─" * 60)


if __name__ == "__main__":
    main()