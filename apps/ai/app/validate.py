"""A5 — lightweight, fully offline spam/quality check. No LLM, no DB, never raises:
returns a result even for empty input so the web app can always render something."""
import re

_URL = re.compile(r"https?://", re.I)


def validate(title: str, description: str) -> dict:
    title = (title or "").strip()
    description = (description or "").strip()
    text = f"{title} {description}".strip()
    n = len(text)

    letters = sum(c.isalpha() for c in text)
    letter_ratio = letters / n if n else 0.0
    longest_token = max((len(t) for t in text.split()), default=0)
    links = len(_URL.findall(text))

    reasons = []
    if n < 15:
        reasons.append("too short to act on")
    if links >= 3:
        reasons.append("looks like link spam")
    if n >= 15 and letter_ratio < 0.5:
        reasons.append("mostly non-text characters")
    if longest_token > 30:
        reasons.append("contains gibberish (no word breaks)")

    is_spam = bool(reasons)
    if is_spam:
        quality = 0.15
    else:
        # reward reasonable length + having both a title and a description
        quality = min(1.0, 0.35 + min(n, 300) / 500 + (0.1 if description else 0.0))

    return {
        "isValid": not is_spam,
        "isSpam": is_spam,
        "quality": round(quality, 2),
        "reason": "; ".join(reasons),
    }
