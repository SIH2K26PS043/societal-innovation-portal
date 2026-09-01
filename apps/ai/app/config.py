import os
from dotenv import load_dotenv

# Load repo-root .env (two levels up) and any local one.
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", "..", ".env"))

DATABASE_URL = os.getenv("DATABASE_URL", "")
AI_SERVICE_KEY = os.getenv("AI_SERVICE_KEY", "dev")

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
EMBEDDING_DIM = 384  # all-MiniLM-L6-v2 — do NOT change; DB columns are vector(384)

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "groq")  # groq | gemini | ollama
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

DEDUP_THRESHOLD = float(os.getenv("DEDUP_THRESHOLD", "0.82"))
SEED_MODE = os.getenv("SEED_MODE", "false").lower() == "true"

CATEGORIES = [
    "EDUCATION", "HEALTH", "WATER", "AGRICULTURE", "ENVIRONMENT", "ENERGY",
    "URBAN", "ACCESSIBILITY", "GOVERNANCE", "RURAL_LIVELIHOOD", "SANITATION",
    "INFRASTRUCTURE", "OTHER",
]
