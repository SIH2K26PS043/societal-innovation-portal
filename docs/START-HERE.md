# START HERE — how we divide the work and move forward (plain words)

> Read this first, on Day 1, before writing any code. It's the short version of everything
> else in `docs/`. If you only read one file in this repo, read this one.

---

## 1. The one-line idea

Six people, **six slices**. Each person owns one slice *top to bottom* (its screens + its
backend + its use of the database). Everyone builds on the **same shared contracts** — one
database schema, one set of types, one design system, one rulebook — so the six slices snap
together at the end instead of clashing.

---

## 2. Who does what

| Person | Slice | In plain words |
|---|---|---|
| **M1** | Foundations (the glue) | Sets up the skeleton everyone plugs into: login, database, shared code, deployment, seed data. **Everyone depends on M1 first.** |
| **M2** | Citizen | The screens where an ordinary person reports a problem (photo + location) and tracks its status. |
| **M3** | AI service | The Python "brain": removes duplicate reports and finds the right professor. **This is what wins the PS.** |
| **M4** | University | Screens where a university sees problems sent to them, forms a team, and writes a solution proposal. |
| **M5** | Industry + project | Companies join projects (money/mentoring); track a project to completion; record patents/startups; notifications. |
| **M6** | Government dashboard | Charts, the Jharkhand map, and the impact numbers (patents, startups, participation). Also owns the **demo**. |

Full detail, day-by-day: [07-TASK-DIVISION.md](07-TASK-DIVISION.md).

---

## 3. Rules for EVERYONE (pin these)

1. **Never invent — import.** Need a data shape? Import from `@repo/types`. A button/card?
   From `@repo/ui`. A table/field? It's in the Prisma schema. If it truly doesn't exist,
   **ask M1 before adding it.** This one rule is what prevents the "nothing connects at the
   end" disaster.
2. **Point your AI at the rules.** Every time you start an AI coding session (Claude Code,
   Cursor, etc.), make sure it reads `CLAUDE.md` and your module's doc. Tell it: *"follow
   CLAUDE.md, import shapes from @repo/types, don't invent new ones."*
3. **Stay in your own folder.** Work inside `app/<your-module>/` and your own API routes.
   Don't edit another module's folder.
4. **Same API shape always:** every endpoint returns `{ data, error }`, validates input with
   Zod, and checks the logged-in role (`requireRole`). Copy the pattern in
   `apps/web/app/api/problems/route.ts`.
5. **Use the design tokens, not random colors.** `bg-primary`, `text-muted-foreground`, the
   shared components in `@repo/ui`. So six people's screens look like one product.
6. **Small branches, daily merges, green CI.** One feature = one branch = one small PR.
   Merge every day so Day 7 isn't merge hell. If CI is red, fix it before merging.
7. **Shared stuff = tell the group.** Changing the schema or types affects everyone —
   announce it and let M1 review.
8. **Must first, then Should, then Could.** Build the 3 winning features deep (dedup,
   matching, NEP dashboard). Everything else can be simple. See [00-MASTER-PLAN](00-MASTER-PLAN.md).
9. **Test with the seed data.** If your feature isn't visible in the seeded demo, it doesn't
   count.

---

## 4. What each owner keeps in mind

- **M1 (Foundations):** Get login + database + deploy working on **Day 1** — others are
  blocked until then. Freeze the contracts (schema/types) early and guard changes. Keep the
  seed data realistic. You're the "does the whole flow connect?" owner on Day 5.
- **M2 (Citizen):** **Phone-first** — citizens are on mobiles. Big, simple form. After
  submit, show the AI result ("reported by N people", "routed to Prof X"). If the AI is
  slow, show *pending* — never freeze the screen.
- **M3 (AI):** Keep embeddings **384-dim, cosine**. Your job for the demo: make the **8
  duplicate water reports cluster into one** and **route to the water professor**. Keep the
  **offline fallback** (Ollama/keyword) so no internet can break it. Only touch the vector
  columns + Cluster/Assignment tables — nothing else.
- **M4 (University):** Your queue only shows problems **matched to your university** (so you
  depend on M3's routing). Always show the *"why it matched"* reason. Build team-forming +
  proposal.
- **M5 (Industry + project):** Reuse M3's matcher for company↔project matching. Track
  partnerships, milestones, and **outcomes (patents/startups)** — those feed M6's dashboard,
  so record them properly.
- **M6 (Government):** Every number is a **live database count**. Make the **NEP panel**
  (patents, startups, participation, completion) the star — that's exactly what the sponsor
  measures. You own the **demo script + backup video**, and make sure seed data gives
  non-zero numbers.

---

## 5. How you work day-to-day (the loop)

```bash
git checkout main && git pull        # start your day fresh
git checkout -b m2/citizen-form      # your slice + short name
# ...build with your AI, following CLAUDE.md...
git add -A && git commit -m "C1: citizen submission form"
git push -u origin m2/citizen-form   # open a PR on GitHub
# CI runs -> one teammate reviews -> merge to main
```

A 10-minute standup each morning: what you finished, what you're blocked on.

---

## 6. How to proceed, starting now

1. **Assign** a real person to M1–M6.
2. **Everyone:** clone the repo, run `pnpm install`, read `README.md` + `CLAUDE.md` + your
   module's doc.
3. **M1 goes first (~half a day):** create a Supabase project, fill `.env`, run
   `pnpm db:migrate` + the `manual_vectors.sql` + `pnpm db:seed`, deploy, and confirm you can
   log in as each of the 5 roles.
4. **Then everyone builds in parallel** in their own folder, against the frozen contracts.
   Where you depend on someone (e.g. M4 needs M3's matches), use fake/mock data until their
   part lands — it'll swap in cleanly because you both used `@repo/types`.
5. **Day 5:** integration day — run one story end-to-end (report → cluster → route → team →
   proposal → project → dashboard).
6. **Day 6:** load realistic Jharkhand seed, test offline + on a phone.
7. **Day 7:** freeze the code, rehearse the demo 3×, record a backup video.

---

## 7. Why it all connects at the end

You're not "integrating" much because the shared contracts already make the pieces speak one
language:

> M2 writes a **Problem** → M3 reads it, clusters it, adds an **Assignment** → M4 reads the
> assignment → M5 adds a **Partnership/Outcome** → M6 counts it.

Same schema, same types, same API shape = the pieces fit by design.
