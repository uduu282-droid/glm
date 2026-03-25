"""
Simple DuckDuckGo Search Test - Debug Version
"""

from duckduckgo_search import DDGS
import time

print("🔍 Testing DuckDuckGo Search")
print("=" * 70)

# Test 1: Basic search
print("\n✅ Test 1: Basic Search")
try:
    with DDGS() as ddgs:
        results = ddgs.text(
            keywords="Python programming",
            region="wt-wt",
            safesearch="off",
            timelimit=None,
            max_results=5
        )
        print(f"Found {len(results)} results")
        for i, result in enumerate(results, 1):
            print(f"\n{i}. {result.get('title', 'No title')}")
            print(f"   URL: {result.get('href', 'No URL')}")
            print(f"   {result.get('body', 'No description')[:100]}...")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

# Test 2: With retry logic
print("\n\n✅ Test 2: With Retry Logic")
def safe_search(query, max_results=5):
    for attempt in range(3):
        try:
            with DDGS() as ddgs:
                results = ddgs.text(
                    keywords=query,
                    region="wt-wt",
                    safesearch="off",
                    timelimit=None,
                    max_results=max_results
                )
                return results
        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            if attempt < 2:
                print(f"Waiting {2 ** attempt} seconds...")
                time.sleep(2 ** attempt)
    return []

results = safe_search("JavaScript tutorials", max_results=3)
print(f"\n✅ Got {len(results)} results")
for i, result in enumerate(results, 1):
    print(f"{i}. {result.get('title', 'No title')}")

# Test 3: Different query types
print("\n\n✅ Test 3: Different Query Types")
test_queries = [
    "What is AI?",
    "Best pizza recipes",
    "Weather today",
    "News 2024"
]

for query in test_queries:
    print(f"\n🔎 Searching: {query}")
    results = safe_search(query, max_results=2)
    if results:
        print(f"   ✅ Success: {len(results)} results")
        print(f"   First result: {results[0].get('title', 'No title')[:60]}...")
    else:
        print(f"   ❌ No results")
    time.sleep(1)

print("\n" + "=" * 70)
print("✅ Test Complete!")
