# University designs — M4

**You own:** `apps/web/app/university/*` and `/api/teams`, `/api/proposals`.
**Requirements:** U1, U2, U3, U4.

## Screens (being added in the next design wave)
| File | Build as | What it is |
|------|----------|------------|
| `queue.html` | `app/university/page.tsx` | Matched problem queue — cards with category, cluster size, match score (U1) |
| `problem-detail.html` | `app/university/problems/[id]/page.tsx` | Full problem + evidence + "why it matched" + actions |
| `create-team.html` | `app/university/teams/new/page.tsx` | Pick students + assign mentor (U2) |
| `proposal.html` | `app/university/proposals/new/page.tsx` | Title / description / approach (U3) |
| `board.html` | `app/university/projects/[id]/page.tsx` | Milestone board (U4) |

Until the HTML lands, build against the **University flow** in
[`docs/05-USER-FLOWS.md`](../../docs/05-USER-FLOWS.md) and `@repo/ui`.

## Tell your AI (one line)
> "Build `apps/web/app/university/` to match `design/university/*.html`. Use `@repo/ui` + tokens,
> `CreateTeamInput` / `CreateProposalInput` from `@repo/types`, the `/api/teams` + `/api/proposals`
> endpoints in `docs/03-API-CONTRACT.md`, follow `CLAUDE.md`."

## Watch for
- Your queue only shows problems whose `Assignment.universityId` is your university (M3 routes them).
- Always show the **match reason** ("matched on: water resources…") — it's the credibility of the demo.
