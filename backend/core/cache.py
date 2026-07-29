"""
Tier 1: Runtime Cache via diskcache.
Used for short-lived, ephemeral caching to avoid redundant LLM calls (e.g., repeated CS queries).
NOT for persistent artifacts (use ai_cache DB table for those).
"""
import hashlib
from diskcache import Cache
from backend.config.settings import settings

# Initialize diskcache
cache = Cache(settings.DISKCACHE_DIR)


def _generate_cache_key(session_type: str, query: str) -> str:
    """Generates a stable, hashed key for a given query."""
    key_string = f"{session_type}:{query.strip().lower()}"
    return hashlib.sha256(key_string.encode('utf-8')).hexdigest()


def get_cached(session_type: str, query: str) -> str | None:
    """Retrieve a cached response if it exists and is still valid."""
    key = _generate_cache_key(session_type, query)
    return cache.get(key)


def set_cached(session_type: str, query: str, response: str, ttl: int = None) -> None:
    """Store a response in the cache with a TTL (default from config)."""
    if ttl is None:
        ttl = settings.CACHE_TTL
    key = _generate_cache_key(session_type, query)
    cache.set(key, response, expire=ttl)


def clear_cache() -> None:
    """Clear all items in the runtime cache."""
    cache.clear()
