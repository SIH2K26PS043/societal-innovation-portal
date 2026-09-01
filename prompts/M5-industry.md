# M5 — Industry + project lifecycle kickoff prompt

> Paste everything below the line as your FIRST message to your AI agent, from the repo root
> (after `pnpm install`). You build industry partnership + the project lifecycle + notifications.

---

You are the **Industry & Lifecycle owner (M5)** for the Societal Innovation Portal (SIH26043), a
Turborepo monorepo. You build where companies join projects and projects run to completion.

**First, read and follow these exactly (in order):**
1. `CLAUDE.md` — the rules. Obey them.
2. `docs/03-API-CONTRACT.md` (§6 industry/projects/outcomes/notifications), `docs/05-USER-FLOWS.md` (Industry), `docs/02-DATA-MODEL.md`
3. `packages/types/index.ts` — import `IndustryRegisterInput`, `CreatePartnershipInput`, `CreateOutcomeInput`, `AiMatch`, enums (NEVER redefine)
4. `packages/ui` — `Button`, `Card`, `Badge`, `StatusBadge`, `CategoryBadge`, tokens
5. `design/industry/*.html` + `design/industry/README.md` — match these designs
6. `apps/web/lib/ai-client.ts` (for `matchIndustry`) + the route pattern in `app/api/problems/route.ts`

**Your scope:** I1 (register), I2 (matched opportunities), I3 (funding/mentoring/pilot/tech-transfer),
P1 (project lifecycle + milestones), P2 (outcomes: patents/startups/IP), N1 (notifications), N2
(per-project comments). Pages in `apps/web/app/industry/` and `apps/web/app/project/`, API in
`apps/web/app/api/{industry,partnerships,projects,notifications}/`.

**Build in order, each fully (loading / empty / error) before the next:**
1. **Register (I1)** → match `design/industry/register.html`. `app/industry/register/page.tsx` using
   `IndustryRegisterInput`; `POST /api/industry/register` (creates `IndustryProfile`).
2. **Opportunities (I2)** → match `design/industry/opportunities.html`. `app/industry/page.tsx` fetches
   `GET /api/industry/opportunities` (server calls `ai.matchIndustry`); show sector match score. Mock
   with `AiMatch`-shaped data until M3 is live.
3. **Project detail (P1)** → match `design/industry/project-detail.html`. `app/project/[id]/page.tsx`:
   project + team + milestones + partners; `GET /api/projects/:id`.
4. **Contribute (I3)** → match `design/industry/contribute.html`. `app/project/[id]/partner/page.tsx`
   using `CreatePartnershipInput`; `POST /api/partnerships` (role, fundingCommitted, pilot status).
5. **Outcomes (P2)** → `POST /api/projects/:id/outcomes` using `CreateOutcomeInput` (PATENT/STARTUP/…);
   these feed M6's NEP dashboard, so store them correctly.
6. **Notifications (N1)** → use M1's notification helper; create notifications on partner-joined,
   milestone-updated, outcome-recorded. Optional per-project comments (N2).

**Hard rules:** import shapes from `@repo/types`; API routes Zod-validate + `requireRole` (INDUSTRY /
FACULTY / ADMIN as appropriate) + return `ok()/fail()` inside `route()`; UI uses `@repo/ui` + tokens
only (match the HTML); reuse M3's matcher via `lib/ai-client.ts` — don't build a second one; only your
module transitions a `Problem`/`Project` to RESOLVED/DEPLOYED; never edit `schema.prisma` without M1.

**Definition of done (per feature):** matches its design HTML; uses `@repo/types`; handles loading/empty/
error; outcomes show up on M6's dashboard when seeded; typechecks + builds.

Start by confirming you've read `CLAUDE.md` and the industry docs/designs, then propose your file plan
and how you'll mock `GET /api/industry/opportunities` before M3 is live.
