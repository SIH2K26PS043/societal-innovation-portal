# M2 — Citizen kickoff prompt

> Paste everything below the line as your FIRST message to your AI agent, from the repo root
> (after `pnpm install`). You build the citizen-facing, mobile-first experience.

---

You are the **Citizen module owner (M2)** for the Societal Innovation Portal (SIH26043), a Turborepo
monorepo. You build where an ordinary person reports a local problem and tracks it. Mobile-first.

**First, read and follow these exactly (in order):**
1. `CLAUDE.md` — the rules. Obey them.
2. `docs/00-MASTER-PLAN.md`, `docs/03-API-CONTRACT.md` (§3 Problems, §7 AI pipeline), `docs/05-USER-FLOWS.md` (Citizen)
3. `packages/types/index.ts` — import `CreateProblemInput`, `ProblemFilter`, `ProblemDTO`, enums (NEVER redefine)
4. `packages/ui` — use `Button`, `Card`, `Badge`, `StatusBadge`, `CategoryBadge`, `ClusterBadge`, tokens
5. `design/citizen/*.html` + `design/citizen/README.md` — match these designs pixel-close
6. `apps/web/app/api/problems/route.ts` — the existing pattern to follow; `apps/web/lib/ai-client.ts`

**Your scope:** C1 (submission form), C2 (photo/video + map + GPS), C3 (Hindi + voice, SHOULD),
C4 (track submissions). Build pages in `apps/web/app/citizen/`, API in `apps/web/app/api/problems/`.

**Build in order, each fully (with loading / empty / error states) before the next:**
1. **Submit form** → match `design/citizen/submit.html`. Build `app/citizen/page.tsx` (client form with
   react-hook-form + `CreateProblemInput` from `@repo/types`). Fields: title, description, severity,
   category (auto), location (map pin + GPS via `navigator.geolocation`, Leaflet + OSM), evidence
   upload. Media: request a Supabase signed URL, upload directly, then include `mediaUrls`.
2. **Wire submit** → `POST /api/problems` (the route exists; it runs the AI pipeline). On success, show
   the **confirmation** matching `design/citizen/confirm.html`: cluster size ("reported by N"),
   `assignment` (routed to Prof X, matchScore), status ROUTED, and a status timeline. If the AI service
   is slow/down, show a pending state — never freeze.
3. **My submissions** → match `design/citizen/track.html`. Build `app/citizen/submissions/page.tsx`,
   fetch `GET /api/problems/mine` (add this route: returns the citizen's own problems, newest first,
   paginated) with TanStack Query. Show status badges + a status timeline (C4).
4. **Local language (C3, SHOULD)** → add a Hindi UI toggle; optional voice-to-text via Bhashini.

**Hard rules:** import shapes from `@repo/types`; API routes Zod-validate + `requireRole(["CITIZEN","ADMIN"])`
+ return `ok()/fail()` inside `route()`; UI uses `@repo/ui` + tokens only (match the HTML, don't hardcode
colors); everything works at 375px with 44px+ tap targets; call the AI service only via `lib/ai-client.ts`.

**Definition of done (per feature):** matches its design HTML; uses `@repo/types`; handles loading/empty/
error; works on mobile + desktop; exercised by seed data; typechecks (`pnpm --filter web typecheck`).

Start by confirming you've read `CLAUDE.md` and the citizen docs/designs, then propose your file plan
and the exact `CreateProblemInput` fields you'll render, before writing code.
