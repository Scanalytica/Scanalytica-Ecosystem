import math
from typing import List, Dict, Any

def compute_shannon_entropy(addresses: List[str]) -> float:
    """
    Compute Shannon entropy (bits) of an address sequence.
    """
    if not addresses:
        return 0.0
    freq: Dict[str, int] = {}
    for a in addresses:
        freq[a] = freq.get(a, 0) + 1
    total = len(addresses)
    entropy = 0.0
    for count in freq.values():
        p = count / total
        entropy -= p * math.log2(p)
    return round(entropy, 4)


def entropy_breakdown(addresses: List[str]) -> Dict[str, Any]:
    """
    Provide a breakdown of frequency distribution and contributions to entropy.
    """
    if not addresses:
        return {"entropy": 0.0, "distribution": {}}

    freq: Dict[str, int] = {}
    for a in addresses:
        freq[a] = freq.get(a, 0) + 1
    total = len(addresses)

    contributions: Dict[str, float] = {}
    entropy = 0.0
    for addr, count in freq.items():
        p = count / total
        c = -p * math.log2(p)
        contributions[addr] = round(c, 4)
        entropy += c

    return {
        "entropy": round(entropy, 4),
        "distribution": {k: v / total for k, v in freq.items()},
        "contributions": contributions,
        "unique_count": len(freq),
        "total_count": total,
    }
