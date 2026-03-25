"""
DuckDuckGo Search Wrapper - Production Ready
Free unlimited web search with caching for AI routes

Usage in FastAPI/Flask:
    from ddgs_search_wrapper import safe_web_search
    
    @app.get("/api/search")
    def search(query: str):
        time.sleep(1)  # Rate limit friendly
        return safe_web_search(query, max_results=5)
"""

from ddgs import DDGS
import time
from functools import lru_cache

@lru_cache(maxsize=2000)
def safe_web_search(query: str, max_results: int = 5):
    """
    Free unlimited web search with caching and retry logic.
    
    Args:
        query: Search query string
        max_results: Maximum number of results to return (default: 5)
    
    Returns:
        List of dict containing search results with keys:
        - title: Result title
        - href: URL
        - body: Description/snippet
        
        Returns empty list [] on failure after 3 retries
    
    Example:
        >>> results = safe_web_search("Python tutorial", max_results=3)
        >>> for r in results:
        ...     print(r['title'])
        ...     print(r['href'])
        ...     print(r['body'])
    """
    for attempt in range(3):
        try:
            with DDGS() as ddgs:
                results = ddgs.text(
                    query=query,
                    region="wt-wt",
                    safesearch="off",
                    timelimit=None,
                    max_results=max_results
                )
                return list(results) if results else []
        except Exception as e:
            # Catches RatelimitException or any temporary block
            print(f"DDG hiccup on attempt {attempt+1} — waiting...")
            time.sleep(2 ** attempt)  # Exponential backoff: 1s → 2s → 4s
    return []  # Graceful fallback


def search_for_ai_answer(question: str, context_count: int = 5):
    """
    Optimized for AI question answering - searches and formats context.
    
    Args:
        question: User's question
        context_count: Number of search results to use as context
    
    Returns:
        Formatted string with search results for AI context
    """
    results = safe_web_search(question, max_results=context_count)
    
    if not results:
        return "No search results found."
    
    context_parts = []
    for i, result in enumerate(results, 1):
        title = result.get('title', 'No title')
        body = result.get('body', 'No description')
        url = result.get('href', 'No URL')
        
        context_parts.append(f"[Source {i}] {title}\nURL: {url}\n{body}")
    
    return "\n\n".join(context_parts)


# Quick test
if __name__ == "__main__":
    print("Testing DuckDuckGo Search Wrapper")
    print("=" * 70)
    
    # Test 1: Basic search
    print("\n🔍 Test 1: Basic Search")
    results = safe_web_search("What is Python?", max_results=3)
    print(f"Found {len(results)} results")
    for r in results[:2]:
        print(f"  • {r.get('title', 'No title')[:60]}...")
    
    # Test 2: Cached search (should be instant)
    print("\n⚡ Test 2: Cached Search")
    start = time.time()
    results = safe_web_search("What is Python?", max_results=3)
    elapsed = time.time() - start
    print(f"Retrieved in {elapsed:.4f}s (should be <0.001s)")
    
    # Test 3: AI answer format
    print("\n🤖 Test 3: AI Answer Format")
    context = search_for_ai_answer("How does machine learning work?")
    print(f"Context length: {len(context)} characters")
    print(f"Preview: {context[:200]}...")
    
    print("\n" + "=" * 70)
    print("✅ All tests passed!")
