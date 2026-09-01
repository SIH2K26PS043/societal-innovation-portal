# Shared & auth designs — M1

**You own:** the public/landing pages, auth, and the `AppShell` every logged-in page sits in.
**Requirements:** X1, X2 + the shell everyone reuses.

## Screens here
| File | Build as | What it is |
|------|----------|------------|
| [`landing.html`](landing.html) | `app/page.tsx` | Marketing landing — hero, 3 winning features, lifecycle strip, footer |
| `login.html` *(coming)* | `app/(auth)/login/page.tsx` | Sign in (already scaffolded — restyle to match) |

## Tell your AI (one line)
> "Build the landing + auth pages to match `design/shared/*.html`. Use `@repo/ui` + tokens, wire auth
> with NextAuth per `lib/auth.ts`, follow `CLAUDE.md`. Keep the `AppShell` (top bar + nav) as the
> single frame every role's pages reuse."

## Watch for
- The landing is the first thing judges see — keep it crisp and load-fast.
- The dark "pipeline" strip uses the same tokens (just darker surfaces) — don't introduce new colors.
