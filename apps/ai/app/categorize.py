"""Problem categorization (A1). Tries the configured LLM, falls back to keyword
rules — so it always returns something, even fully offline (X4 demo safety)."""
import httpx

from .config import (LLM_PROVIDER, GROQ_API_KEY, GEMINI_API_KEY, OLLAMA_BASE_URL, CATEGORIES)

KEYWORDS = {
    "WATER": ["water", "pipeline", "tap", "drinking", "borewell", "well", "drainage"],
    "HEALTH": ["hospital", "health", "clinic", "doctor", "medicine", "disease"],
    "AGRICULTURE": ["farm", "crop", "soil", "irrigation", "farmer", "harvest"],
    "ENERGY": ["electricity", "power", "solar", "energy", "grid", "voltage"],
    "SANITATION": ["toilet", "sanitation", "garbage", "waste", "sewage"],
    "EDUCATION": ["school", "teacher", "education", "student", "classroom"],
    "ENVIRONMENT": ["pollution", "forest", "tree", "river", "environment"],
    "URBAN": ["road", "traffic", "street", "footpath", "pothole"],
    "INFRASTRUCTURE": ["bridge", "building", "construction", "infrastructure"],
    "GOVERNANCE": ["corruption", "office", "document", "certificate"],
    "ACCESSIBILITY": ["disabled", "ramp", "accessibility", "wheelchair"],
    "RURAL_LIVELIHOOD": ["employment", "job", "livelihood", "wage", "income"],
}


def keyword_category(text: str) -> tuple[str, float]:
    t = text.lower()
    best, hits = "OTHER", 0
    for cat, kws in KEYWORDS.items():
        n = sum(1 for k in kws if k in t)
        if n > hits:
            best, hits = cat, n
    return best, (min(0.5 + 0.1 * hits, 0.85) if hits else 0.3)


async def categorize(title: str, description: str) -> tuple[str, float]:
    text = f"{title}. {description}"
    try:
        cat = await _llm_category(text)
        if cat in CATEGORIES:
            return cat, 0.9
    except Exception:
        pass
    return keyword_category(text)


async def _llm_category(text: str) -> str:
    prompt = (
        "Classify this civic problem into exactly ONE label from: "
        + ", ".join(CATEGORIES)
        + ". Reply with only the label, nothing else.\n\nProblem: " + text
    )
    async with httpx.AsyncClient(timeout=15) as client:
        if LLM_PROVIDER == "groq" and GROQ_API_KEY:
            r = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
                json={"model": "llama-3.1-8b-instant",
                      "messages": [{"role": "user", "content": prompt}],
                      "temperature": 0, "max_tokens": 10},
            )
            return r.json()["choices"][0]["message"]["content"].strip().upper()
        if LLM_PROVIDER == "ollama":
            r = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={"model": "llama3", "prompt": prompt, "stream": False},
            )
            return r.json()["response"].strip().upper()
    raise RuntimeError("no LLM configured")
