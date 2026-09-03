# apps/ai — Python AI Service (M3)

The differentiator: embeddings, deduplication/clustering (A2), expertise matching (A3),
categorization (A1), validation (A5), priority (A4). Contract: [`docs/04-AI-SERVICE.md`](../../docs/04-AI-SERVICE.md).

## Run locally
```bash
cd apps/ai
python -m venv .venv && . .venv/Scripts/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
`GET http://localhost:8000/health` → `{"data":{"status":"ok","model_loaded":true}}`
(the model is warmed once at startup, so the first real request isn't slow).

> Python **3.11** is recommended — torch wheels (pulled by sentence-transformers) are most
> reliable there. Uses the same `DATABASE_URL` as apps/web (set it in the repo-root `.env`).

## After seeding the DB
```bash
# from repo root: pnpm db:seed
cd apps/ai
python -m app.scripts.backfill_embeddings   # embeds faculty + clusters + routes seed problems
```

## Endpoints
| Route | Purpose |
|-------|---------|
| `GET /health` | liveness + model_loaded |
| `POST /embed` | generic embeddings (384-dim) |
| `POST /categorize` | A1 — LLM w/ keyword fallback |
| `POST /process` | A2 + A3 — embed, dedup/cluster, expertise-match, priority |
| `POST /match/university` | A3 on demand (top-5 faculty) |
| `POST /match/industry` | I2 on demand (top-3 partners) |
| `POST /priority` | A4 — transparent priority score |
| `POST /validate` | A5 — offline spam/quality check |

All routes except `/health` require header `x-ai-key: $AI_SERVICE_KEY`.

## Tests
```bash
pip install -r requirements-dev.txt
python -m pytest -q          # unit tests (no DB, no network)
```

## Offline demo
Set `LLM_PROVIDER=ollama` (with a local `ollama serve` running `llama3`) so categorization
works with no internet. Matching/dedup are fully local already (sentence-transformers + pgvector).
Set `SEED_MODE=true` for deterministic matches during a rehearsed demo.

## Boundary
This service only reads/writes the **vector** columns and the **Cluster** / **Assignment** tables.
All other business logic + RBAC belongs to apps/web. Keep it that way (see `CLAUDE.md`).
