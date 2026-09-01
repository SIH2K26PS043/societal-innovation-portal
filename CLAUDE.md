# CLAUDE.md — AI coding rules for this repo

> **Read this before generating any code.** It lives at the repo root so every member's
> Claude Code / Cursor / Copilot reads the *same* rules. This is how 6 AI-assisted developers
> produce code that connects without errors. When in doubt, follow the contract, don't improvise.

Project: **Societal Innovation Portal** — SIH26043, Government of Jharkhand. See [`docs/00-MASTER-PLAN.md`](docs/00-MASTER-PLAN.md).

---

## 0. The prime directive
**Never invent a shape that already exists.** Before creating a type, endpoint, table, enum, color, or component:
1. Check [`packages/types`](packages/types) (API/AI shapes), [`packages/db/prisma/schema.prisma`](packages/db/prisma/schema.prisma) (data), [`packages/ui`](packages/ui) (components), `docs/06-DESIGN-SYSTEM.md` (tokens).
2. If it exists → **import it**. If it truly doesn't → add it to the contract, then announce in the team channel.
Inventing a parallel version is the #1 cause of end-of-project integration failure. Don't.

## 1. Locked stack (do not substitute)
pnpm · Turborepo · TypeScript strict · Next.js 14 App Router · React 18 · Tailwind + **shadcn/ui** · lucide-react · TanStack Query v5 · react-hook-form + **Zod** · Prisma 5 · Auth.js (NextAuth v4) · Leaflet + OSM · Recharts · Postgres+pgvector (Supabase). AI service: FastAPI + sentence-transformers (`all-MiniLM-L6-v2`, **384-dim**) + Groq/Gemini/Ollama. Full rationale: `docs/01-ARCHITECTURE-AND-STACK.md`.
**Do not add another UI kit, ORM, state library, or fetching library.**

## 2. Where code goes
- Your module's pages: `apps/web/app/<module>/…` · your API: `apps/web/app/api/<resource>/route.ts`.
- Shared types/schemas → `packages/types`. DB → `packages/db`. Reusable UI → `packages/ui`.
- Call the AI service **only** through `apps/web/lib/ai-client.ts`. Never scatter `fetch` to it.
- Never import across another module's `app/<module>` folder. Modules integrate via the DB + typed API, not by reaching in.

## 3. API rules (every route handler)
```ts
import { ok, fail, CreateProblemInput } from "@repo/types";
import { requireRole } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await requireRole(["CITIZEN","ADMIN"]);        // 401/403 handled inside
  const parsed = CreateProblemInput.safeParse(await req.json());
  if (!parsed.success) return Response.json(fail("VALIDATION", parsed.error.message), { status: 400 });
  // ...prisma work...
  return Response.json(ok(result), { status: 201 });
}
```
- **Always** return the `{ data, error }` envelope (`ok()` / `fail()`).
- **Always** Zod-validate input with the schema from `@repo/types`.
- **Always** guard with `requireRole([...])`. Roles per endpoint: `docs/03-API-CONTRACT.md`.
- List endpoints paginate: `{ items, total, page, limit }`.
- Dates over the wire are ISO strings. IDs are cuid strings.

## 4. Frontend rules
- Server Components by default; add `"use client"` only when interactive.
- Server state → **TanStack Query**, never raw `useEffect` fetch. Query keys: `["problems", filters]`.
- Forms → react-hook-form + the Zod schema from `@repo/types` (same schema as the API).
- UI → **shadcn/ui** components + `packages/ui` composites. **No hardcoded hex** — use tokens (`bg-primary`, `text-muted-foreground`, category-colors map).
- Every data view handles **loading / empty / error** (`<LoadingState/>`, `<EmptyState/>`).
- Mobile-first: must work at 375px. Use the shared `<AppShell>` for logged-in pages.

## 5. Database rules
- One schema: `packages/db/prisma/schema.prisma`. **Do not edit it without M1** — it ripples to everyone.
- Never write raw SQL from `apps/web`; use Prisma. Vector columns belong to `apps/ai` only.
- Only the owning module transitions a `Problem.status` (state machine in `docs/02-DATA-MODEL.md`).
- Use the exact enum strings from the schema; the Zod mirrors in `@repo/types` must stay identical.

## 6. AI service rules (`apps/ai`)
- Endpoints + shapes are frozen in `docs/04-AI-SERVICE.md`; Pydantic models mirror the Zod in `@repo/types` field-for-field.
- Embedding dim is **384** forever. Similarity is cosine. Dedup threshold via `DEDUP_THRESHOLD`.
- Reads/writes only vector columns + Cluster/Assignment (raw SQL). No web business logic.
- Every endpoint returns the `{ data, error }` envelope and never hard-crashes the web app.

## 7. Consistency conventions
- Files: kebab-case (`problem-card.tsx`). Components: PascalCase. Vars/functions: camelCase. Enum values: SCREAMING_SNAKE (match DB).
- One toast system (`sonner`). One icon set (`lucide-react`). One date lib if needed (`date-fns`).
- Env vars via `@/lib/env` (validated). Never read `process.env` ad hoc. Never commit `.env`.
- Keep functions small; colocate a component's types with it unless shared (then `@repo/types`).

## 8. Git & PRs
- Branch per feature: `m<n>/<slug>` (e.g. `m2/citizen-submit`). Never push to `main` directly.
- PR title names requirement IDs it satisfies (e.g. "C2, C4: media upload + tracking").
- Contract changes (schema/types/docs 02–04) → tag M1 + announce in channel.
- Commits are authored by each member under their own git identity. Do not add AI/co-author trailers or AI-branding to commits, PRs, comments, or docs.
- Meet the Definition of Done in `docs/07-TASK-DIVISION.md` before marking a task complete.

## 9. When you're unsure
Ask in the channel, or check the relevant `docs/*` file. **Do not guess a new contract shape** — a wrong guess compiles for you and breaks for everyone else at integration. The docs are the law.
