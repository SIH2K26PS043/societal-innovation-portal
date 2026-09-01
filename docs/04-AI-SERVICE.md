# 04 · AI SERVICE CONTRACT (`apps/ai` · Python FastAPI)

> Owner: **M3**. This is the differentiator. The boundary with `apps/web` is *only* this JSON contract —
> if these shapes don't change, M3 can build the whole ML core independently.

Base URL: `AI_SERVICE_URL` (local `http://localhost:8000`, deployed on Render). Auth: shared secret header `x-ai-key: $AI_SERVICE_KEY`.

---

## 1. Models & constants (locked)
| Thing | Value | Never change because… |
|-------|-------|------------------------|
| Embedding model | `sentence-transformers/all-MiniLM-L6-v2` | 384-dim vectors already stored in DB |
| Vector dim | **384** | pgvector columns are typed `vector(384)` |
| Similarity | **cosine** (`<=>` in pgvector; `1 - distance` = score) | matching + dedup both use it |
| Dedup threshold | cosine ≥ **0.82** = same cluster (tunable via env `DEDUP_THRESHOLD`) | consistency across runs |
| Category LLM | Groq `llama-3.1-8b-instant` → Gemini → Ollama `llama3` | free + offline fallback |
| Match top-K | 5 faculty, 3 universities | UI expects this |

---

## 2. Endpoints

### `GET /health` → `{ "status": "ok", "model_loaded": true }`
Used by the web app's startup check and the demo pre-flight.

### `POST /embed` **[MUST]**
Generic embedding (used by seed script + internal).
```jsonc
// req
{ "texts": ["broken water pipeline near Ranchi station", "..."] }
// res
{ "data": { "embeddings": [[0.01, -0.23, ...384 floats], ...] }, "error": null }
```

### `POST /categorize` (A1) **[MUST]**
```jsonc
// req
{ "title": "No water for 3 days", "description": "Pipeline burst in ward 4..." }
// res
{ "data": { "category": "WATER", "confidence": 0.94 }, "error": null }
```
`category` is one of the `Category` enum strings (see [02-DATA-MODEL](02-DATA-MODEL.md)). Implementation: LLM with a strict "return only one of these labels" prompt; fall back to keyword rules if the LLM is down.

### `POST /process` (A2 + A3, the main call) **[MUST]**
Does embed → store vector → dedup/cluster → expertise-match → create Assignment, in one round trip.
```jsonc
// req
{ "problemId": "clx123", "title": "...", "description": "...", "category": "WATER" }
// res
{ "data": {
    "clusterId": "clc88",
    "clusterSize": 8,               // "reported by 8 citizens"
    "isDuplicate": true,
    "similar": [{ "problemId": "clx900", "score": 0.91 }],
    "assignment": {
      "universityId": "clu_bitmesra",
      "facultyId": "clf_prof_water",
      "matchScore": 0.88,
      "reason": "matched on: water resources, hydrology"
    },
    "priorityScore": 7.4            // A4
  }, "error": null }
```
Side effects (raw SQL): writes `Problem.embedding`; creates/updates `Cluster` + `Cluster.centroid` + `size`; sets `Problem.clusterId`; inserts `Assignment`. The web app then flips `Problem.status` to `ROUTED`.

### `POST /match/university` (A3 on demand) **[MUST]**
```jsonc
// req  (either problemId or raw text)
{ "problemId": "clx123" }
// res
{ "data": { "matches": [
    { "universityId":"clu_bitmesra","facultyId":"clf1","score":0.88,"reason":"water resources" },
    { "universityId":"clu_nitjsr","facultyId":"clf2","score":0.71,"reason":"civil / hydraulics" }
]}, "error": null }
```

### `POST /match/industry` (I2) **[SHOULD]**
Same shape, returns `{ partnerId, score, reason }[]` for a given project/problem.

### `POST /validate` (A5) **[SHOULD]**
```jsonc
// req
{ "title": "...", "description": "..." }
// res
{ "data": { "isValid": true, "isSpam": false, "quality": 0.8, "reason": "" }, "error": null }
```

### `POST /priority` (A4) **[COULD]**
```jsonc
// req
{ "clusterSize": 8, "category": "WATER", "severityKeywords": ["burst","3 days","children"] }
// res
{ "data": { "score": 7.4 }, "error": null }
```
Simple transparent formula: `score = log(clusterSize+1)*w1 + severityHits*w2 + categoryWeight`. Keep it explainable to judges.

---

## 3. How the AI service reaches the database

`apps/ai` connects to the **same Postgres** (`DATABASE_URL`) with `asyncpg`. It only touches:
- **read/write** vector columns: `Problem.embedding`, `FacultyProfile.expertiseEmbedding`, `Cluster.centroid`, `IndustryProfile.expertiseEmbedding`
- **write** `Cluster` (id, title, size, centroid) + `Problem.clusterId`
- **write** `Assignment` (problemId, universityId, facultyId, matchScore, reason)
- **read** `FacultyProfile` + `University` rows to build match reasons

It does **not** implement web business rules (status transitions, notifications, RBAC) — that's `apps/web`. This clean split is why M3 can work in isolation.

---

## 4. Pydantic ↔ Zod parity
Every request/response model here exists as a **Pydantic v2** model in `apps/ai/app/schemas.py` **and** as a **Zod** schema in `packages/types` (used by `apps/web/lib/ai-client.ts`). They must match field-for-field. When one changes, change both in the same PR and post in the channel.

---

## 5. Demo safety (X4)
- Model loads once at startup (warm). `/health` reports `model_loaded`.
- `LLM_PROVIDER=ollama` env flips categorize/validate to a **local** model → works with no internet, no rate limits.
- Every endpoint returns the standard envelope; on internal error returns `error.code="SERVER"` so the web app degrades gracefully instead of crashing.
- Keep a `SEED_MODE=true` path that makes matching deterministic for rehearsed demos.
