# M4 — University kickoff prompt

> Paste everything below the line as your FIRST message to your AI agent, from the repo root
> (after `pnpm install`). You build where universities pick up problems and solve them.

---

You are the **University module owner (M4)** for the Societal Innovation Portal (SIH26043), a Turborepo
monorepo. You build the university's queue → team → proposal → project flow.

**First, read and follow these exactly (in order):**
1. `CLAUDE.md` — the rules. Obey them.
2. `docs/03-API-CONTRACT.md` (§4 clusters/routing, §5 teams/proposals), `docs/05-USER-FLOWS.md` (University), `docs/02-DATA-MODEL.md`
3. `packages/types/index.ts` — import `CreateTeamInput`, `CreateProposalInput`, `ReviewProposalInput`, `ProblemDTO`, enums (NEVER redefine)
4. `packages/ui` — `Button`, `Card`, `Badge`, `StatusBadge`, `CategoryBadge`, `ClusterBadge`, tokens
5. `design/university/*.html` + `design/university/README.md` — match these designs
6. `apps/web/app/api/problems/route.ts` + `apps/web/lib/{auth,api}.ts` — the pattern to follow

**Your scope:** U1 (matched queue), U2 (form team + mentor), U3 (proposal), U4 (project board).
Pages in `apps/web/app/university/`, API in `apps/web/app/api/{assignments,teams,proposals,projects}/`.

**Build in order, each fully (loading / empty / error) before the next:**
1. **Matched queue** → match `design/university/queue.html`. `app/university/page.tsx` fetches
   `GET /api/assignments?universityId=<session university>` — only problems routed to this university
   (M3 populates `Assignment`). Show category, cluster size, severity, best-fit faculty + `matchScore`.
   Until M3/M1 are live, use a typed mock returning `ProblemDTO`-shaped data.
2. **Problem detail** → match `design/university/problem-detail.html`. `app/university/problems/[id]/page.tsx`:
   full problem + evidence + the "why it matched" card (faculty, score, `reason`) + priority. Actions:
   form team / write proposal.
3. **Create team (U2)** → match `design/university/create-team.html`. Form using `CreateTeamInput`;
   `POST /api/teams`. Fetch selectable students via `GET /api/users?role=STUDENT&universityId=…`.
4. **Proposal (U3)** → match `design/university/proposal.html`. Form using `CreateProposalInput`;
   `POST /api/proposals`, then `POST /api/proposals/:id/submit` (DRAFT→SUBMITTED → Gov review).
5. **Project board (U4)** → match `design/university/board.html`. Milestone kanban reading
   `GET /api/projects/:id`; add/update milestones via `POST /api/projects/:id/milestones`.

**Hard rules:** import shapes from `@repo/types`; API routes Zod-validate + guard with `requireRole`
(university roles) + return `ok()/fail()` inside `route()`; UI uses `@repo/ui` + tokens only (match the
HTML); only your module transitions `Problem.status` to `IN_PROGRESS` (on team formed); never edit
`schema.prisma` without flagging M1.

**Definition of done (per feature):** matches its design HTML; uses `@repo/types`; handles loading/empty/
error; the queue only shows problems assigned to the logged-in university; typechecks + builds.

Start by confirming you've read `CLAUDE.md` and the university docs/designs, then propose your file plan
and how you'll mock `GET /api/assignments` before M3 is live.
