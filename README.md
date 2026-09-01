# Societal Innovation Portal · SIH26043

[![CI](https://github.com/SIH2K26PS043/societal-innovation-portal/actions/workflows/ci.yml/badge.svg)](https://github.com/SIH2K26PS043/societal-innovation-portal/actions/workflows/ci.yml)

A digital platform that crowdsources societal challenges from citizens and turns them into
**university innovation projects** with **industry partnership** — built around **NEP 2020** for the
Government of Jharkhand, Department of Higher & Technical Education.

> This is **not** a complaint portal. Our edge is three deep features:
> **1)** AI deduplication/clustering of reports · **2)** expertise-matching a problem to the right professor ·
> **3)** an NEP-outcome government dashboard (patents, startups, participation).

---

## 📚 Start here (read in order)
0. [`docs/START-HERE.md`](docs/START-HERE.md) — **plain-words summary: task division, rules, how to proceed**
1. [`docs/00-MASTER-PLAN.md`](docs/00-MASTER-PLAN.md) — scope, MoSCoW feature list, 7-day plan
2. [`docs/01-ARCHITECTURE-AND-STACK.md`](docs/01-ARCHITECTURE-AND-STACK.md) — system design + locked stack + repo layout
3. [`docs/02-DATA-MODEL.md`](docs/02-DATA-MODEL.md) — schema, ER diagram, enums
4. [`docs/03-API-CONTRACT.md`](docs/03-API-CONTRACT.md) — every REST endpoint
5. [`docs/04-AI-SERVICE.md`](docs/04-AI-SERVICE.md) — Python AI service contract
6. [`docs/05-USER-FLOWS.md`](docs/05-USER-FLOWS.md) — per-role journeys + sequence diagrams
7. [`docs/06-DESIGN-SYSTEM.md`](docs/06-DESIGN-SYSTEM.md) — colors, type, components, Figma mapping
8. [`docs/07-TASK-DIVISION.md`](docs/07-TASK-DIVISION.md) — who owns what, day-by-day
9. [`docs/08-DEMO-SCRIPT.md`](docs/08-DEMO-SCRIPT.md) — crash-proof demo
10. [`CLAUDE.md`](CLAUDE.md) — **AI coding rules — every AI tool reads this**

## 🎨 Page designs
High-fidelity designs for every screen live in [`design/`](design/) — **one folder per module owner**,
each with the screen HTML + a plain-English "build this with your AI" guide. Open the `.html` in any
browser, or point your AI at it to build the matching React page with `@repo/ui`.

## 🚀 Starting your module?
Each member has a **paste-ready kickoff prompt** for their AI in [`prompts/`](prompts/) — open yours,
paste the whole file as your AI's first message, and it knows exactly what to read, build, and follow.

## 🧭 The "one hood" (why our code will connect)
All 6 members build against **shared contracts** so nobody's AI drifts:
`packages/db/prisma/schema.prisma` (data) · `packages/types` (API/AI shapes) · `packages/ui` (components) · `CLAUDE.md` (rules).

---

## 🛠 Tech stack (locked)
**Web (`apps/web`):** Next.js 14 · React 18 · Tailwind + shadcn/ui · TanStack Query · Zod · Prisma · NextAuth · Leaflet · Recharts
**AI (`apps/ai`):** Python · FastAPI · sentence-transformers (384-dim) · pgvector · scikit-learn · Groq/Gemini/Ollama
**Data/infra:** Postgres + pgvector (Supabase) · Supabase Storage · Vercel · Render — **all free tier**

## 🚀 Local dev (scaffold is in place — verified: installs, typechecks, builds)
```bash
pnpm install
cp .env.example .env                 # fill in DATABASE_URL, NEXTAUTH_SECRET, etc.
pnpm db:generate                     # prisma client
pnpm db:migrate                      # create tables
psql "$DIRECT_URL" -f packages/db/prisma/migrations/manual_vectors.sql   # pgvector columns
pnpm db:seed                         # Jharkhand universities/faculty + citizen problems (incl. dupes)
pnpm dev                             # apps/web on http://localhost:3000
```
AI service (separate terminal — Python 3.11 recommended):
```bash
cd apps/ai
python -m venv .venv && . .venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
python -m app.scripts.backfill_embeddings   # after db:seed — embeds faculty + clusters/routes seed problems
```
Demo logins (password `password`): `citizen@demo.in` · `gov@demo.in` · `industry@demo.in` · `admin@demo.in`.

## 👥 Team & modules
| M1 Foundations | M2 Citizen | M3 AI Service | M4 University | M5 Industry+Lifecycle | M6 Gov+DataViz |
|---|---|---|---|---|---|
| monorepo, auth, ui, seed, deploy | C1–C4 | A1–A5 | U1–U4 | I1–I3, P1–P2, N1–N2 | D1–D3 |

See [`docs/07-TASK-DIVISION.md`](docs/07-TASK-DIVISION.md).

## 📄 License
Built for SIH 2026. Free/open-source tools only.
