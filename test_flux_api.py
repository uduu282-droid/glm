import requests

prompt = input(">>> ")
url = f"https://fast-flux-demo.replicate.workers.dev/api/generate-image?text={requests.utils.quote(prompt)}"
try:
    r = requests.get(url)
    r.raise_for_status()
    if r.headers.get("Content-Type", "").startswith("image/"):
        with open("generated_image.png", "wb") as f:
            f.write(r.content)
        print("Image saved as generated_image.png")
    else:
        print("Unexpected response:", r.text)
except Exception as e:
    print(f"Failed: {e}")