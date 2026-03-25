from openai import OpenAI
import os
import sys

_USE_COLOR = sys.stdout.isatty() and os.getenv("NO_COLOR") is None
_REASONING_COLOR = "\033[90m" if _USE_COLOR else ""
_RESET_COLOR = "\033[0m" if _USE_COLOR else ""

# Test the NVIDIA API using OpenAI client
client = OpenAI(
  base_url = "https://integrate.api.nvidia.com/v1",
  api_key = "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"
)

print("Testing NVIDIA API with OpenAI client...")
print(f"Base URL: https://integrate.api.nvidia.com/v1")
print(f"Model: z-ai/glm4.7")
print(f"Message: 'hey'")
print("-" * 50)

try:
    completion = client.chat.completions.create(
      model="z-ai/glm4.7",
      messages=[{"content":"hey","role":"user"}],
      temperature=1,
      top_p=1,
      max_tokens=100,  # Reduced for testing
      extra_body={"chat_template_kwargs":{"enable_thinking":True,"clear_thinking":False}},
      stream=True
    )

    print("Response:")
    for chunk in completion:
        if not getattr(chunk, "choices", None):
            continue
        if len(chunk.choices) == 0 or getattr(chunk.choices[0], "delta", None) is None:
            continue
        delta = chunk.choices[0].delta
        reasoning = getattr(delta, "reasoning_content", None)
        if reasoning:
            print(f"{_REASONING_COLOR}{reasoning}{_RESET_COLOR}", end="")
        if getattr(delta, "content", None) is not None:
            print(delta.content, end="")
    
    print("\n\n✅ NVIDIA API test completed successfully!")

except Exception as e:
    print(f"\n❌ Error occurred: {str(e)}")
    print(f"Error type: {type(e).__name__}")