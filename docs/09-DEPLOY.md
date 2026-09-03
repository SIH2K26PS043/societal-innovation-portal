# 09 · DEPLOYMENT RUNBOOK

Three managed, free-tier services:

| Layer | Service | Config in repo |
|-------|---------|----------------|
| Web (Next.js) | **Vercel** | `apps/web/vercel.json` |
| AI (FastAPI) | **Render** (Docker) | `render.yaml`, `apps/ai/Dockerfile` |
| DB (Postgres + pgvector) | **Supabase** | `packages/db/prisma/schema.prisma` |

**Do the phases in order.** Finish Supabase (Phase 1) before deploying the apps.

---

## Supabase connection strings — which one goes where (this trips everyone up)

From Supabase → Project → **Connect**, you get three. Use them like this:

| Use | Which string | Port | Why |
|-----|--------------|------|-----|
| Render AI service (`asyncpg`) **and** the provision workflow | **Session pooler** | 5432 | IPv4, session mode → prepared statements work |
| Vercel web `DATABASE_URL` (Prisma, serverless) | **Transaction pooler** | 6543 | pgbouncer; add `?pgbouncer=true&connection_limit=1` |
| Vercel web `DIRECT_URL` (Prisma migrations) | **Session pooler** | 5432 | |

- Always keep `?sslmode=require` on the session-pooler URL (Supabase requires TLS).
- **Do not** give the AI service the 6543 transaction pooler — asyncpg breaks under transaction-mode pgbouncer.
- The host looks like `aws-0-ap-south-1.pooler.supabase.com`; the user is `postgres.<project-ref>`.

---

## Phase 0 — Prerequisites
1. Merge **PR #1** into `main` (deploys pull from `main`).
2. Have accounts: Render, Vercel (log in with GitHub).
3. Generate two secrets and keep them handy:
   - `AI_SERVICE_KEY` → `openssl rand -hex 32`
   - `NEXTAUTH_SECRET` → `openssl rand -base64 32`

---

## Phase 1 — Finish Supabase (from the cloud, no local network needed)
The dev network blocks Supabase's Postgres port, so provision via GitHub Actions instead.

1. GitHub → repo → **Settings → Secrets and variables → Actions → New repository secret**:
   - Name: `SUPABASE_DB_URL`
   - Value: the **Session pooler** URL (port **5432**) incl. `?sslmode=require`, e.g.
     `postgresql://postgres.<ref>:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require`
2. GitHub → **Actions → "Provision Supabase (schema + seed + embeddings)" → Run workflow** (branch `main`).
3. It runs: push schema → add `vector(384)` columns → seed demo data (46 problems incl. the 8 Ranchi duplicates) → backfill embeddings (clusters + routes). Watch the last step print `processed 46 problems`.
4. Verify in Supabase → **Table Editor**: `Problem` (46 rows), `Cluster` (a row of `size = 8`), `Assignment` (46 rows).

Supabase is now fully provisioned. Re-run the workflow anytime to reset demo data.

---

## Phase 2 — Deploy the AI service to Render
1. Render → **New → Blueprint** → connect the GitHub repo → it reads `render.yaml`.
2. When prompted, set the secret env vars:
   - `DATABASE_URL` = **Session pooler** URL (5432, `?sslmode=require`)
   - `AI_SERVICE_KEY` = the value from Phase 0
   - `GROQ_API_KEY` = your Groq key *(optional — keyword fallback works without it)*
3. Instance type: `starter`. ⚠️ If it crashes on boot with an out-of-memory / SIGKILL while loading the model, bump to `standard` (torch + the model can exceed 512 MB).
4. Deploy. When live, check:
   `curl https://<your-ai>.onrender.com/health` → `{"data":{"status":"ok","model_loaded":true}}`
   *(Free instances sleep after 15 min; the web app degrades gracefully, but for the demo keep it warm or use a paid instance.)*

---

## Phase 3 — Deploy the web app to Vercel
1. Vercel → **Add New → Project** → import the repo.
2. **Root Directory: `apps/web`** (Framework auto-detects Next.js; `vercel.json` sets the build).
3. **Environment Variables:**

| Key | Value |
|-----|-------|
| `DATABASE_URL` | **Transaction pooler** (6543) + `?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | **Session pooler** (5432, `?sslmode=require`) |
| `NEXTAUTH_SECRET` | from Phase 0 |
| `NEXTAUTH_URL` | `https://<your-app>.vercel.app` (fix after first deploy — see step 5) |
| `AI_SERVICE_URL` | `https://<your-ai>.onrender.com` (from Phase 2) |
| `AI_SERVICE_KEY` | **same value as Render** |
| `SUPABASE_URL` | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `STORAGE_BUCKET` | `evidence` |

4. Deploy.
5. Copy the real production domain Vercel assigns → update `NEXTAUTH_URL` to it → **redeploy** (auth callbacks break if this is wrong).

---

## Phase 4 — Supabase Storage (media uploads, C2)
Supabase → **Storage → New bucket** → name `evidence`. (Needed for citizen photo uploads; the rest of the app works without it.)

---

## Phase 5 — Verify end-to-end
1. Open the Vercel URL → log in with a demo account (`citizen@demo.in` / `password`, etc.) → you land on the role home.
2. Submit a problem as a citizen → it should categorize, cluster and route (Render logs show the `/process` call).
3. Log in as `gov@demo.in` → the dashboard shows the seeded numbers.

---

## Env var quick reference

**Render (AI):** `DATABASE_URL` (session pooler 5432) · `AI_SERVICE_KEY` · `GROQ_API_KEY?` · `LLM_PROVIDER=groq` · `DEDUP_THRESHOLD=0.82` · `SEED_MODE=false`

**Vercel (web):** `DATABASE_URL` (txn pooler 6543) · `DIRECT_URL` (session pooler 5432) · `NEXTAUTH_SECRET` · `NEXTAUTH_URL` · `AI_SERVICE_URL` · `AI_SERVICE_KEY` · `SUPABASE_URL` · `SUPABASE_SERVICE_ROLE_KEY` · `STORAGE_BUCKET=evidence`

**GitHub Actions secret:** `SUPABASE_DB_URL` (session pooler 5432)

## Common gotchas
- `AI_SERVICE_KEY` **must be identical** in Render and Vercel, or every AI call 401s (and the web app silently falls back).
- Wrong `NEXTAUTH_URL` → login redirect loops.
- AI service given the 6543 pooler → intermittent asyncpg prepared-statement errors. Use 5432 session pooler.
- Render free tier OOM on model load → bump the plan.
- To re-seed prod: re-run the Phase 1 workflow (it wipes + reloads).
