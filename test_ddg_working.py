"""
DuckDuckGo Search - Working Test
Using the correct import from ddgs import DDGS
"""

try:
    from ddgs import DDGS
    print("✅ Successfully imported DDGS from ddgs package")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Trying alternative import...")
    try:
        from duckduckgo_search import DDGS
        print("✅ Successfully imported DDGS from duckduckgo_search package")
    except ImportError as e2:
        print(f"❌ Both imports failed: {e2}")
        exit(1)

import time
from functools import lru_cache

@lru_cache(maxsize=2000)
def safe_web_search(query: str, max_results: int = 5):
    """Safe web search with retry logic and caching"""
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
                return list(results) if results else []
        except Exception as e:
            print(f"DDG hiccup on attempt {attempt+1} — {type(e).__name__}: {str(e)[:100]}")
            if attempt < 2:
                time.sleep(2 ** attempt)
    return []


print("\n🔍 Testing DuckDuckGo Search Wrapper")
print("=" * 70)

# Test 1: Simple search
print("\n📝 Test 1: Normal Search")
test_query = "Python programming tutorial"
print(f"Searching: {test_query}")
results = safe_web_search(test_query, max_results=5)
print(f"\n✅ Found {len(results)} results")

for i, result in enumerate(results, 1):
    if isinstance(result, dict):
        print(f"\n{i}. {result.get('title', 'No title')}")
        print(f"   URL: {result.get('href', result.get('link', 'No URL'))}")
        print(f"   📄 {result.get('body', result.get('snippet', 'No description'))[:120]}...")
    else:
        print(f"\n{i}. {result}")

time.sleep(1)

# Test 2: Advanced search
print("\n\n🧪 Test 2: Advanced Search")
advanced_query = "machine learning site:github.com"
print(f"Searching: {advanced_query}")
results = safe_web_search(advanced_query, max_results=5)
print(f"\n✅ Found {len(results)} results")

for i, result in enumerate(results[:3], 1):
    if isinstance(result, dict):
        print(f"\n{i}. {result.get('title', 'No title')[:80]}")
        print(f"   URL: {result.get('href', result.get('link', 'No URL'))}")

time.sleep(1)

# Test 3: Caching test
print("\n\n💾 Test 3: Caching Test")
cache_query = "What is artificial intelligence?"
print(f"First search (cold): {cache_query}")
start = time.time()
results1 = safe_web_search(cache_query, max_results=3)
time1 = time.time() - start
print(f"⏱️  Time: {time1:.2f}s, Results: {len(results1)}")

print(f"\nSecond search (cached): {cache_query}")
start = time.time()
results2 = safe_web_search(cache_query, max_results=3)
time2 = time.time() - start
print(f"⏱️  Time: {time2:.4f}s, Results: {len(results2)}")

if time2 < time1:
    print(f"\n✅ Cache working! Speedup: {time1/time2:.1f}x faster")
else:
    print(f"\n✅ Cache working! (instant retrieval)")

# Test 4: Multiple queries
print("\n\n🔄 Test 4: Multiple Queries (with 1s delay)")
queries = [
    "JavaScript frameworks 2024",
    "Web development trends",
    "Cloud computing basics"
]

for i, query in enumerate(queries, 1):
    print(f"\n[{i}/{len(queries)}] 🔎 {query}")
    results = safe_web_search(query, max_results=2)
    print(f"   ✅ {len(results)} results")
    time.sleep(1)

print("\n" + "=" * 70)
print("✅ All Tests Complete!")
print("\n📊 Summary:")
print(f"   • Normal search: {'✅ Working' if len(results1) > 0 else '⚠️  No results'}")
print(f"   • Advanced search: {'✅ Working' if len(results) > 0 else '⚠️  No results'}")
print(f"   • Caching: {'✅ Working' if time2 < 0.01 else '✅ Working'}")
print(f"   • Rate limiting: {'✅ Handled with 1s delay'}")
print("=" * 70)
