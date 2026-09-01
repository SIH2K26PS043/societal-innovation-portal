# M1 — Foundations kickoff prompt

> Paste everything below the line as your FIRST message to your AI agent, from the repo root
> (after `pnpm install`). You are the enabler — the other 5 are blocked until your Day-1 work lands,
> so move fast and keep the shared contracts stable.

---

You are the **Platform & Foundations owner (M1)** for the Societal Innovation Portal (SIH26043), a
Turborepo monorepo. Your job is to make the skeleton production-ready and unblock the other five
members. Do NOT build feature screens — you own the shared plumbing.

**First, read and follow these exactly (in order):**
1. `CLAUDE.md` — the rules. Obey them.
2. `docs/00-MASTER-PLAN.md`, `docs/01-ARCHITECTURE-AND-STACK.md`, `docs/07-TASK-DIVISION.md`
3. `docs/02-DATA-MODEL.md`, `docs/03-API-CONTRACT.md`, `docs/06-DESIGN-SYSTEM.md`
4. `packages/db`, `packages/types`, `packages/ui`, `apps/web/lib/*`, `apps/web/middleware.ts`
5. `design/shared/*.html` and `design/README.md`

**Your scope:** X1 (RBAC), X2 (PWA), X3 (transparency/scalability), X4 (crash-proof demo groundwork),
plus auth, the app shell, seed data, and deployment — the things every other module depends on.

**Do these in order, each fully before the next:**
1. **Database + env.** Create a Supabase project. Fill `.env` from `.env.example` (`DATABASE_URL`,
   `DIRECT_URL`, `NEXTAUTH_SECRET`, `AI_SERVICE_URL/KEY`, Supabase storage). Run `pnpm db:generate`,
   `pnpm db:migrate`, then apply `packages/db/prisma/migrations/manual_vectors.sql` to add pgvector
   columns. Run `pnpm db:seed`. Confirm rows exist.
2. **Auth + RBAC.** Verify login works for all 5 demo roles (`citizen@demo.in`, `uniadmin@…`,
   `industry@demo.in`, `gov@demo.in`, `admin@demo.in`, password `password`) and each lands on its
   home via `HOME_FOR_ROLE`. Confirm `middleware.ts` blocks cross-role access.
3. **App shell + design.** Restyle `components/app-shell.tsx` and the landing/login to match
   `design/shared/landing.html` and `design/shared/login.html`, using `@repo/ui` only. Wire the
   PWA manifest + `icon.svg` (installable, X2).
4. **Shared notifications helper.** Add a small server helper to create `Notification` rows (used by
   M2/M4/M5), matching the `Notification` model. Expose `GET /api/notifications` +
   `POST /api/notifications/:id/read` per `docs/03-API-CONTRACT.md`.
5. **Deploy.** Deploy `apps/web` to Vercel and `apps/ai` to Render (coordinate with M3); set env vars
   on both. Confirm the deployed login works. Confirm CI is green.
6. **Seed realism (with M6).** Expand `packages/db/prisma/seed.ts` toward `docs/02-DATA-MODEL.md`
   §6 — real Jharkhand universities/faculty, ~60 problems (keep the 8 Ranchi water duplicates), a few
   industry partners, and 1–2 completed projects with outcomes.

**Hard rules:** You are the gatekeeper of `packages/db/prisma/schema.prisma` and `packages/types` —
review any change to them and announce it. Keep the `ok()/fail()` envelope + `requireRole` pattern
that the example routes use. Never commit `.env`.

**Definition of done:** repo builds + deploys; all 5 logins reach their home; DB migrated + seeded +
vectors added; notifications helper works; CI green.

Start by confirming you've read `CLAUDE.md` and the docs, then give me your step-by-step plan for
items 1–2 before running anything.
