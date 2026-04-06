from typing import List, Dict, Any

def detect_volume_bursts(
    volumes: List[float],
    threshold_ratio: float = 1.5,
    min_interval: int = 1
) -> List[Dict[str, Any]]:
    """
    Identify indices where volume jumps by threshold_ratio over the previous point.
    Returns list of dicts: {index, previous, current, ratio, delta}.
    - threshold_ratio: multiple increase required to flag a burst.
    - min_interval: minimum spacing between two bursts (in indices).
    """
    events: List[Dict[str, Any]] = []
    last_idx = -min_interval

    for i in range(1, len(volumes)):
        prev, curr = volumes[i - 1], volumes[i]
        if prev <= 0:
            ratio = float("inf") if curr > 0 else 1.0
        else:
            ratio = curr / prev

        if ratio >= threshold_ratio and (i - last_idx) >= min_interval:
            events.append({
                "index": i,
                "previous": prev,
                "current": curr,
                "delta": round(curr - prev, 4),
                "ratio": round(ratio, 4)
            })
            last_idx = i

    return events


def strongest_burst(events: List[Dict[str, Any]]) -> Dict[str, Any] | None:
    """
    Return the burst event with the highest ratio.
    """
    if not events:
        return None
    return max(events, key=lambda e: e["ratio"])
