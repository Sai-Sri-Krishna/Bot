"""
Local FAQ fuzzy-matching algorithm.
Ported from the original Node.js implementation in server.ts.

Priority order:
  1. Exact match on question or alias
  2. Substantial substring match (length > 8)
  3. Keyword overlap (Jaccard-like score >= 0.5)
"""
import re
from typing import Optional


def _clean(s: str) -> str:
    """Normalise string: lowercase and remove punctuation."""
    return re.sub(r"[^\w\s]", "", s.lower()).strip()


def find_local_answer(user_query: str, entries: list) -> Optional[dict]:
    """
    Returns the best-matching FAQ entry dict or None.
    Each entry is a dict with keys: id, question, answer, category, aliases (list of str).
    """
    target = _clean(user_query)
    if not target:
        return None

    # 1. Exact match
    for entry in entries:
        if _clean(entry["question"]) == target:
            return entry
        for alias in entry.get("aliases", []):
            if _clean(alias) == target:
                return entry

    # 2. Substantial contains match
    for entry in entries:
        q_clean = _clean(entry["question"])
        if len(q_clean) > 8 and (target in q_clean or q_clean in target):
            return entry
        for alias in entry.get("aliases", []):
            a_clean = _clean(alias)
            if len(a_clean) > 8 and (target in a_clean or a_clean in target):
                return entry

    # 3. Token overlap (Jaccard-like)
    target_tokens = {t for t in target.split() if len(t) > 2}
    if not target_tokens:
        return None

    best_entry = None
    highest_score = 0.0

    for entry in entries:
        texts = [entry["question"]] + entry.get("aliases", [])
        for text in texts:
            text_tokens = [t for t in _clean(text).split() if len(t) > 2]
            if not text_tokens:
                continue
            overlap = sum(1 for t in text_tokens if t in target_tokens)
            text_coverage = overlap / len(text_tokens)
            target_coverage = overlap / len(target_tokens)
            score = (text_coverage + target_coverage) / 2
            if score > highest_score:
                highest_score = score
                best_entry = entry

    if highest_score >= 0.5 and best_entry:
        return best_entry

    return None
