# Kickoff prompts — one per member

Each file here is a **paste-ready first message** for a member's AI coding agent (Claude Code, Cursor,
etc.). It tells the AI exactly what to read, what to build, and the rules that keep everyone's code
compatible. This is how six people build in parallel without drifting apart.

## How each member uses it (2 minutes)
1. Clone the repo and run `pnpm install`.
2. (Once, by M1) set up `.env` from `.env.example` and the database — see [M1's prompt](M1-foundations.md).
3. Open **your** prompt file below, copy the **whole thing**, and paste it as the **first message** to
   your AI agent, run from the repo root.
4. Let the AI read the files it lists, then approve its file plan before it writes code.

| You are | Your prompt |
|---------|-------------|
| M1 · Foundations (platform, auth, deploy, seed) | [M1-foundations.md](M1-foundations.md) |
| M2 · Citizen | [M2-citizen.md](M2-citizen.md) |
| M3 · AI service (Python) | [M3-ai-service.md](M3-ai-service.md) |
| M4 · University | [M4-university.md](M4-university.md) |
| M5 · Industry + project lifecycle | [M5-industry.md](M5-industry.md) |
| M6 · Government + data viz | [M6-government.md](M6-government.md) |

## Order of operations (important)
- **M1 goes first** on Day 1 (half a day): DB, `.env`, migrate + seed, deploy, confirm all 5 role logins.
  Until that's done, others build against **mock data** (their prompts tell them how).
- **M3 starts in parallel** with M1 (the AI service is independent).
- **M2, M4, M5, M6** build their screens against the design HTML + the frozen API contract, swapping
  mocks for real endpoints as they land.

## The rules everyone's AI must follow (baked into every prompt)
1. Import all shapes/enums from `@repo/types` — never invent them.
2. Use `@repo/ui` components + design tokens — never hardcode colors.
3. Match the designs in `design/<your-module>/`.
4. API routes: Zod-validate, `requireRole`, return the `ok()/fail()` envelope inside `route()`.
5. One feature = one branch (`m<n>/<slug>`) = one small PR. Keep CI green.
6. Never change `packages/db/prisma/schema.prisma` or `packages/types` without telling M1.

Full strategy for the meeting: [`docs/START-HERE.md`](../docs/START-HERE.md).
