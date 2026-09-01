# Citizen designs — M2

**You own:** `apps/web/app/citizen/*` and the citizen API routes.
**Requirements:** C1, C2, C3, C4 (see [docs/00-MASTER-PLAN.md](../../docs/00-MASTER-PLAN.md)).

## Screens here
| File | Build as | What it is |
|------|----------|------------|
| [`submit.html`](submit.html) | `app/citizen/page.tsx` (or `app/citizen/report/page.tsx`) | The report form — title, description, auto-category, severity, map pin + GPS, photo/video (C1, C2, C3) |
| [`confirm.html`](confirm.html) | shown after a successful submit | "Reported by N" + "routed to Prof X" + status timeline |
| [`track.html`](track.html) | `app/citizen/submissions/page.tsx` | My submissions with status timeline (C4) |

These are **phone screens** — build mobile-first (works at 375px), 44px+ tap targets.

## Tell your AI (one line)
> "Build the Citizen screens in `apps/web/app/citizen/` to match `design/citizen/*.html`. Use
> `@repo/ui` + tokens, `CreateProblemInput` from `@repo/types`, POST to `/api/problems` per
> `docs/03-API-CONTRACT.md`, and follow `CLAUDE.md`. Mobile-first. Don't invent colors."

## Watch for
- After submit, show the AI result from the API response (`cluster size`, `assignment`) — that's the
  "reported by N / routed to Prof X" moment in `confirm.html`. If the AI service is slow, show a
  pending state; never freeze the screen.
- Use `<CategoryBadge>` and `<StatusBadge>` from `@repo/ui` for the chips.
