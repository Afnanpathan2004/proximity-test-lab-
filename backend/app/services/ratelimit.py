from time import time
from typing import Dict, Tuple

# naive in-memory rate limiter: key -> (window_start, count)
_buckets: Dict[str, Tuple[float, int]] = {}


def allow(key: str, limit: int = 5, window_seconds: int = 60) -> bool:
    now = time()
    start, cnt = _buckets.get(key, (now, 0))
    if now - start > window_seconds:
        start, cnt = now, 0
    cnt += 1
    _buckets[key] = (start, cnt)
    return cnt <= limit
