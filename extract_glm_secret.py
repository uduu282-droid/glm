"""Extract and verify GLM secret for JavaScript worker"""
import sys
sys.path.insert(0, '.')

from glm import _SECRET, sign, _ms, _uid

print("=" * 60)
print("GLM Secret Extraction for Cloudflare Worker")
print("=" * 60)
print(f"\nExtracted Secret:\n{_SECRET!r}\n")
print(f"Secret length: {len(_SECRET)} characters")
print(f"Secret type: {type(_SECRET).__name__}")

# Test signature generation
ts_ms = _ms()
request_id = _uid()
test_signature = sign(ts_ms, "test prompt", "test-user-id", request_id)

print(f"\nTest Signature (for verification):")
print(f"Timestamp: {ts_ms}")
print(f"Request ID: {request_id}")
print(f"Signature: {test_signature}")
print(f"Signature length: {len(test_signature)}")
print(f"Signature format: hex ({len(test_signature)//2} bytes)")

print("\n" + "=" * 60)
print("Copy the secret above into src/index.js:")
print(f'const SECRET = "{_SECRET}";')
print("=" * 60)
