# Industry + project designs — M5

**You own:** `apps/web/app/industry/*`, `apps/web/app/project/*` and `/api/industry`,
`/api/partnerships`, `/api/projects`, `/api/notifications`.
**Requirements:** I1, I2, I3, P1, P2, N1, N2.

## Screens here
| File | Build as | What it is |
|------|----------|------------|
| [`register.html`](register.html) | `app/industry/register/page.tsx` | Company, sector, offerings (I1) |
| [`opportunities.html`](opportunities.html) | `app/industry/page.tsx` | Projects matched to your sector, with match score (I2) |
| [`project-detail.html`](project-detail.html) | `app/project/[id]/page.tsx` | Project + team + milestones + how to help (P1) |
| [`contribute.html`](contribute.html) | `app/project/[id]/partner/page.tsx` | Offer funding / mentoring, track pilot + outcomes (I3, P2) |

Reference the **Industry flow** in [`docs/05-USER-FLOWS.md`](../../docs/05-USER-FLOWS.md) for behaviour.

## Tell your AI (one line)
> "Build `apps/web/app/industry/` and `app/project/` to match `design/industry/*.html`. Use `@repo/ui`
> + tokens, `IndustryRegisterInput` / `CreatePartnershipInput` / `CreateOutcomeInput` from
> `@repo/types`, the endpoints in `docs/03-API-CONTRACT.md`, follow `CLAUDE.md`."

## Watch for
- Reuse M3's matcher for company↔project matching (`/match/industry`) — same engine as A3.
- Record **outcomes** (patents / startups) properly — they feed M6's NEP dashboard.
