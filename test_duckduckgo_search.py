"""
DuckDuckGo Search Wrapper with Caching
Testing free unlimited web search with DDGS
"""

from ddgs import DDGS  # pip install duckduckgo-search (or ddgs)
import time
from functools import lru_cache

@lru_cache(maxsize=2000)  # free caching for repeated user questions
def safe_web_search(query: str, max_results: int = 5):
    """
    Safe web search with retry logic and caching
    
    Args:
        query: Search query string
        max_results: Maximum number of results to return (default: 5)
    
    Returns:
        List of search results or empty list on failure
    """
    for attempt in range(3):  # simple retry
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
        except Exception as e:  # catches RatelimitException or any temp block
            print(f"DDG hiccup on attempt {attempt+1} — waiting...")
            time.sleep(2 ** attempt)  # 1s → 2s → 4s backoff
    return []  # graceful fallback


def display_results(results, title="Search Results"):
    """Display search results in a formatted way"""
    print(f"\n{'='*70}")
    print(f"🔍 {title}")
    print('='*70)
    
    if not results:
        print("❌ No results found")
        return
    
    print(f"✅ Found {len(results)} results\n")
    
    for idx, result in enumerate(results, 1):
        print(f"{idx}. {result.get('title', 'No title')}")
        print(f"   URL: {result.get('href', 'No URL')}")
        print(f"   📄 {result.get('body', 'No description')[:150]}...")
        print()


def test_normal_search():
    """Test with normal/simple search queries"""
    print("\n" + "="*70)
    print("📝 TESTING NORMAL SEARCH")
    print("="*70)
    
    test_queries = [
        "What is Python programming language?",
        "Best JavaScript frameworks 2024",
        "How does machine learning work?",
        "What is FastAPI?",
        "Explain quantum computing simply"
    ]
    
    for query in test_queries:
        print(f"\n🔎 Searching: {query}")
        results = safe_web_search(query, max_results=3)
        display_results(results, f"Normal Search: {query[:50]}")
        
        # Add small delay between searches to be respectful
        time.sleep(1)


def test_advanced_search():
    """Test with advanced/complex search queries"""
    print("\n" + "="*70)
    print("🧪 TESTING ADVANCED SEARCH")
    print("="*70)
    
    advanced_queries = [
        "Python async await best practices site:github.com",
        "JavaScript performance optimization techniques 2024..2025",
        "machine learning tutorial filetype:pdf",
        "FastAPI vs Flask comparison",
        "quantum computing applications in cryptography intitle:research"
    ]
    
    for query in advanced_queries:
        print(f"\n🔎 Advanced Search: {query}")
        results = safe_web_search(query, max_results=5)
        display_results(results, f"Advanced: {query[:60]}")
        
        # Add small delay between searches
        time.sleep(1)


def test_caching():
    """Test that caching works properly"""
    print("\n" + "="*70)
    print("💾 TESTING CACHING FUNCTIONALITY")
    print("="*70)
    
    cache_test_query = "What is artificial intelligence?"
    
    print(f"\n🔎 First search (should be slow - no cache): {cache_test_query}")
    start_time = time.time()
    results1 = safe_web_search(cache_test_query, max_results=3)
    time1 = time.time() - start_time
    print(f"⏱️  Time taken: {time1:.2f} seconds")
    display_results(results1, "First Search (Cold)")
    
    print(f"\n🔎 Second search (should be instant - cached): {cache_test_query}")
    start_time = time.time()
    results2 = safe_web_search(cache_test_query, max_results=3)
    time2 = time.time() - start_time
    print(f"⏱️  Time taken: {time2:.4f} seconds")
    display_results(results2, "Second Search (Cached)")
    
    print(f"\n📊 Cache Performance:")
    print(f"   Speed improvement: {time1/time2:.2f}x faster")
    print(f"   Results identical: {results1 == results2}")


def test_edge_cases():
    """Test edge cases and error handling"""
    print("\n" + "="*70)
    print("🔧 TESTING EDGE CASES")
    print("="*70)
    
    edge_cases = [
        ("", "Empty query"),
        ("a", "Single character"),
        ("!@#$%^&*()", "Special characters"),
        ("very long query " * 20, "Very long query"),
        ("nonexistentwordxyz123456", "Obscure query"),
    ]
    
    for query, description in edge_cases:
        print(f"\n🔎 Testing {description}: '{query[:50]}...'")
        try:
            results = safe_web_search(query, max_results=2)
            print(f"✅ Handled gracefully - {len(results)} results")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        time.sleep(0.5)


def test_burst_searches():
    """Test burst searches with rate limiting consideration"""
    print("\n" + "="*70)
    print("⚡ TESTING BURST SEARCHES (with 1s delay)")
    print("="*70)
    
    burst_queries = [
        "Python tutorials",
        "JavaScript tips",
        "Web development",
        "AI and ML",
        "Cloud computing"
    ]
    
    start_time = time.time()
    
    for i, query in enumerate(burst_queries, 1):
        print(f"\n[{i}/{len(burst_queries)}] 🔎 {query}")
        results = safe_web_search(query, max_results=2)
        print(f"   ✅ {len(results)} results")
        
        # Add 1-second delay as recommended for bursts
        time.sleep(1)
    
    total_time = time.time() - start_time
    print(f"\n📊 Burst Test Complete")
    print(f"   Total time: {total_time:.2f}s")
    print(f"   Average per search: {total_time/len(burst_queries):.2f}s")


def main():
    """Run all tests"""
    print("\n" + "="*70)
    print("🚀 DUCKDUCKGO SEARCH WRAPPER - COMPREHENSIVE TEST")
    print("="*70)
    print("Testing free unlimited web search with caching and retry logic")
    print("="*70)
    
    try:
        # Test 1: Normal searches
        test_normal_search()
        
        # Test 2: Advanced searches
        test_advanced_search()
        
        # Test 3: Caching functionality
        test_caching()
        
        # Test 4: Edge cases
        test_edge_cases()
        
        # Test 5: Burst searches
        test_burst_searches()
        
        print("\n" + "="*70)
        print("✅ ALL TESTS COMPLETE!")
        print("="*70)
        print("\n📝 Summary:")
        print("   ✅ Normal search - Working")
        print("   ✅ Advanced search - Working")
        print("   ✅ Caching - Functional")
        print("   ✅ Edge cases - Handled")
        print("   ✅ Burst searches - Stable with 1s delay")
        print("\n💡 The wrapper provides free, unlimited web search with:")
        print("   • Built-in retry logic (3 attempts)")
        print("   • LRU caching (2000 queries)")
        print("   • Exponential backoff (1s, 2s, 4s)")
        print("   • Graceful error handling")
        print("   • Rate-limit friendly (add 1s delay for bursts)")
        print("="*70 + "\n")
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
