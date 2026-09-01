# M3 — AI service kickoff prompt

> Paste everything below the line as your FIRST message to your AI agent, run from `apps/ai`
> (with a Python 3.11 venv active). You own the differentiator — the features that win this PS.

---

You are the **AI service owner (M3)** for the Societal Innovation Portal (SIH26043). You own the
Python FastAPI microservice `apps/ai`. It has no UI; it powers the smart moments in every screen.

**First, read and follow these exactly (in order):**
1. `CLAUDE.md` — the rules. Obey them.
2. `docs/04-AI-SERVICE.md` — YOUR contract (endpoints, shapes, constants). This is law.
3. `docs/02-DATA-MODEL.md` §3 (vector columns) and the state machine
4. `apps/ai/app/*` — the scaffold you extend (`main.py`, `matching.py`, `db.py`, `embeddings.py`,
   `categorize.py`, `schemas.py`, `scripts/backfill_embeddings.py`)
5. `packages/types/index.ts` — the `Ai*` shapes; your Pydantic models must mirror them field-for-field
6. `design/ai-service/README.md` — where your output shows up (your acceptance test)

**Your scope:** A1 categorize, A2 dedup/clustering, A3 expertise matching, A4 priority, A5 validate,
plus the I2 industry-match engine. Constants are fixed: embeddings `all-MiniLM-L6-v2` **384-dim**,
cosine similarity, dedup threshold 0.82.

**Build in order, each verified before the next:**
1. **Run the scaffold.** `pip install -r requirements.txt`, `uvicorn app.main:app --reload --port 8000`,
   confirm `GET /health`. Point `DATABASE_URL` at the same Supabase DB M1 created (vector columns must
   exist — `manual_vectors.sql`).
2. **Categorize (A1)** — make `/categorize` robust: LLM (Groq) with the keyword fallback already
   present, returning a valid `Category` enum string.
3. **Process (A2 + A3)** — make `/process` embed → store vector → dedup/cluster (the 8 seeded Ranchi
   water reports MUST collapse into one cluster) → expertise-match to the best faculty → write
   `Assignment` with a human-readable `reason`. Return exactly `AiProcessRes`.
4. **Match on demand (A3, I2)** — `/match/university` and `/match/industry` returning `AiMatch[]`.
5. **Validate + priority (A5, A4)** — `/validate` and the `priorityScore` in `/process`. Keep the
   priority formula transparent/explainable.
6. **Backfill** — after M1 seeds, run `python -m app.scripts.backfill_embeddings` so seeded data
   clusters + routes. Verify `citizen/confirm.html`'s numbers are reproducible (reported by 8, routed
   to the water professor, ~0.88).
7. **Demo safety (X4)** — confirm `LLM_PROVIDER=ollama` works fully offline; add `SEED_MODE`
   deterministic matches.

**Hard rules:** every endpoint returns the `{"data":…, "error":…}` envelope and never crashes the web
app; only touch the vector columns + `Cluster`/`Assignment` tables (all other business logic is
`apps/web`); keep the embedding dim at 384 forever; Pydantic models stay identical to the Zod in
`@repo/types` — if you must change a shape, change both and tell M1.

**Definition of done:** all endpoints match `docs/04-AI-SERVICE.md`; the seeded water cluster forms and
routes to the water professor; works offline via Ollama; `/health` reports `model_loaded`.

Start by confirming you've read `docs/04-AI-SERVICE.md`, then get `/health`, `/categorize`, and
`/process` working against the seeded DB and show me the `/process` output for a Ranchi water report.
