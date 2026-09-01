# AI service — M3 (no screens, but you power the best moments)

You own `apps/ai` (the Python microservice). It has **no UI** — so there's no page to design.
But almost every screen only becomes impressive **because of your output**. This file tells you
exactly which visible moments you feed, so you know what shapes to return.

Your real contract is [`docs/04-AI-SERVICE.md`](../../docs/04-AI-SERVICE.md) and the
`Ai*` types in [`packages/types`](../../packages/types/index.ts). This is just the "where it shows up" map.

## Where your output appears (match these exactly)

| Your output | Field | Shows up in |
|-------------|-------|-------------|
| Cluster size | `AiProcessRes.clusterSize` | `citizen/confirm.html` → **"Reported by 8 citizens"** · `university/queue.html` → **"reported by N"** badge |
| Assignment | `AiProcessRes.assignment` / `AiMatch` | `citizen/confirm.html` → **"routed to Dr. A. Verma"** · `university/queue.html` → **"best fit: Prof · 0.88"** |
| Match score | `matchScore` / `score` | the **0.88** you see in confirm, queue, problem-detail |
| Match reason | `reason` | `university/problem-detail.html` → **"matched on: water resources, hydrology…"** |
| Category (A1) | `AiCategorizeRes.category` | the coloured category chip on every screen |
| Priority (A4) | `AiProcessRes.priorityScore` | `university/problem-detail.html` → **priority 7.4** |
| Industry match (I2) | `AiMatch` | `industry/opportunities.html` → **"0.86 match"** on each project card |

If any of these fields is missing or the wrong shape, the screens fall back to empty states and the
demo loses its punch. So: **the designs are your acceptance test.** When confirm.html can show
"reported by 8, routed to Dr. Verma, 0.88, matched on water resources", you're done.

## Tell your AI (one line)
> "Build `apps/ai` per `docs/04-AI-SERVICE.md`. Return the `AiProcessRes` / `AiMatch` / `AiCategorizeRes`
> shapes from `@repo/types` — the fields must match what `design/*/*.html` renders (clusterSize,
> assignment, matchScore, reason, priorityScore). Embeddings are 384-dim, cosine similarity, dedup
> threshold 0.82. Follow `CLAUDE.md`."

## Watch for
- Make the **8 seeded Ranchi water reports cluster into one** and **route to the water professor** —
  that's the exact state `citizen/confirm.html` and `university/problem-detail.html` are drawn around.
- Keep the offline fallback (Ollama / keyword categorizer) so the demo works with no internet.
- Only touch the vector columns + `Cluster` / `Assignment` tables — everything else is `apps/web`.
