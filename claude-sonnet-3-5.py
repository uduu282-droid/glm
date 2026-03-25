import requests
import uuid
import json
import os
import sys
import time

# ----------------------------------------------------------------------
# Configuration
# ----------------------------------------------------------------------
BASE_URL = "https://api.overchat.ai/v1/chat/completions"
# The free tier gives Haiku; change to Opus if you have access
MODEL = "anthropic/claude-opus-4-6"      # other model claude-haiku-4-5-20251001
PERSONA_ID = "claude-opus-4-6-landing"   # keep as is, it's just a UI identifier
MAX_TOKENS = 4000
TEMPERATURE = 0.5
FRESH_UUID_EACH_RUN = True               # True = new guest each run

# ----------------------------------------------------------------------
# Persistent session (keep-alive)
# ----------------------------------------------------------------------
session = requests.Session()
session.headers.update({
    "accept": "*/*",
    "content-type": "application/json",
    "x-device-platform": "web",
    "x-device-version": "1.0.44",
    "x-device-language": "en-US",
    "origin": "https://overchat.ai",
    "referer": "https://overchat.ai/",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36"
})

# ----------------------------------------------------------------------
# Device UUID handling
# ----------------------------------------------------------------------
def get_device_uuid():
    if FRESH_UUID_EACH_RUN:
        return str(uuid.uuid4())
    else:
        uuid_file = "device_uuid.txt"
        if os.path.exists(uuid_file):
            with open(uuid_file, "r") as f:
                return f.read().strip()
        else:
            new_uuid = str(uuid.uuid4())
            with open(uuid_file, "w") as f:
                f.write(new_uuid)
            return new_uuid

DEVICE_UUID = get_device_uuid()
session.headers["x-device-uuid"] = DEVICE_UUID

# ----------------------------------------------------------------------
# Helper: send a message (always streaming, but we collect full reply)
# ----------------------------------------------------------------------
def send_message(user_message, chat_id=None):
    if chat_id is None:
        chat_id = str(uuid.uuid4())

    messages = [
        {"id": str(uuid.uuid4()), "role": "user", "content": user_message},
        {"id": str(uuid.uuid4()), "role": "system", "content": ""}
    ]

    payload = {
        "chatId": chat_id,
        "model": MODEL,
        "messages": messages,
        "personaId": PERSONA_ID,
        "stream": True,                      # always use streaming (API requirement)
        "temperature": TEMPERATURE,
        "max_tokens": MAX_TOKENS,
        "frequency_penalty": 0,
        "presence_penalty": 0,
        "top_p": 0.95
    }

    start_time = time.time()
    response = session.post(BASE_URL, json=payload, stream=True)
    elapsed = time.time() - start_time
    print(f"[Request took {elapsed:.2f}s]")

    if response.status_code not in (200, 201):
        print(f"HTTP error {response.status_code}: {response.text[:200]}")
        return None, None

    full_reply = []
    # Process SSE lines
    for line in response.iter_lines(decode_unicode=True):
        if not line:
            continue
        if line.startswith("data:"):
            data = line[5:].strip()
            if data == "[DONE]":
                break
            try:
                event = json.loads(data)
                delta = event.get("choices", [{}])[0].get("delta", {}).get("content", "")
                if delta:
                    # Clean UTF‑8 (remove any invalid characters)
                    delta = delta.encode('utf-8', errors='ignore').decode('utf-8')
                    full_reply.append(delta)
            except json.JSONDecodeError:
                pass

    final_reply = "".join(full_reply)
    print("Assistant:", final_reply)
    return chat_id, final_reply

# ----------------------------------------------------------------------
# Main loop
# ----------------------------------------------------------------------
if __name__ == "__main__":
    print("Overchat.ai Claude (free tier) – using model:", MODEL)
    print(f"Device UUID: {DEVICE_UUID}  (fresh each run: {FRESH_UUID_EACH_RUN})")
    print("Type 'exit' to quit.\n")

    chat_id = None
    while True:
        try:
            user_input = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            break

        if not user_input:
            continue
        if user_input.lower() in ("exit", "quit"):
            break

        new_chat_id, _ = send_message(user_input, chat_id)
        if new_chat_id:
            chat_id = new_chat_id
        print()