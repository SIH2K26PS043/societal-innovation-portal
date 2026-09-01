# M6 — Government + data viz kickoff prompt

> Paste everything below the line as your FIRST message to your AI agent, from the repo root
> (after `pnpm install`). You build the dashboards the sponsor judges us on, and own the demo.

---

You are the **Government & Data Viz owner (M6)** for the Societal Innovation Portal (SIH26043), a
Turborepo monorepo. You build the analytics the Dept. of Higher Education watches — and own the demo.

**First, read and follow these exactly (in order):**
1. `CLAUDE.md` — the rules. Obey them.
2. `docs/03-API-CONTRACT.md` (§8 analytics), `docs/05-USER-FLOWS.md` (Government), `docs/08-DEMO-SCRIPT.md`
3. `packages/types/index.ts` — import `AnalyticsSummary`, `NepImpact`, `CategoryCount`, `DistrictCount`, enums (NEVER redefine)
4. `packages/ui` — `Card`, `Badge`, tokens, and `categoryColor` / `CATEGORY_COLORS` (use this for ALL chart/map colors)
5. `design/government/*.html` + `design/government/README.md` — match these designs
6. `apps/web/app/api/analytics/summary/route.ts` — the existing pattern to follow

**Your scope:** D1 (real-time numbers), D2 (district heatmap), D3 (NEP impact), plus X4 (demo). Use
**Recharts** for charts and **Leaflet + OSM** for the map. Pages in `apps/web/app/gov/`, API in
`apps/web/app/api/analytics/`.

**Build in order, each fully (loading / empty / error) before the next:**
1. **Dashboard (D1)** → match `design/government/dashboard.html`. `app/gov/page.tsx`: KPI cards from
   `GET /api/analytics/summary` (exists), category bar chart from `GET /api/analytics/by-category`,
   recent activity, and an embedded district heat preview. Every number is a live DB aggregation.
2. **NEP impact (D3)** → match `design/government/nep-impact.html`. `app/gov/impact/page.tsx` from
   `GET /api/analytics/nep-impact` (patents, startups, ipTransfers, publications, universities,
   students, completion rate) + a by-university table. Give this prominence — it's what the sponsor measures.
3. **District map (D2)** → match `design/government/map.html`. `app/gov/map/page.tsx`: Leaflet map of
   Jharkhand district boundaries (public GeoJSON in `apps/web/public/`), choropleth colored by
   `GET /api/analytics/by-district`, with a ranked side list.
4. **Review proposals** → match `design/government/review-proposals.html`. `app/gov/proposals/page.tsx`:
   queue of SUBMITTED proposals with approve/reject via `POST /api/proposals/:id/review`.
5. **Analytics API** → implement `/api/analytics/{summary(done),by-category,by-district,timeline,nep-impact}`
   as Prisma `groupBy`/`count` aggregations returning the `@repo/types` shapes.
6. **Demo (X4)** → own `docs/08-DEMO-SCRIPT.md`: rehearse, ensure seed data gives non-zero numbers,
   record a backup video.

**Hard rules:** import shapes from `@repo/types`; analytics routes `requireRole(["GOVERNMENT","ADMIN"])`
+ return `ok()/fail()` inside `route()` + `export const dynamic = "force-dynamic"`; UI uses `@repo/ui` +
tokens; chart/map colors come ONLY from `categoryColor`/`CATEGORY_COLORS` — never redefine them; never
edit `schema.prisma` without flagging M1.

**Definition of done (per feature):** matches its design HTML; uses `@repo/types`; live DB numbers (no
hardcoding); handles loading/empty/error; NEP panel prominent; typechecks + builds.

Start by confirming you've read `CLAUDE.md` and the government docs/designs, then propose your file plan
and the exact Prisma aggregations for each analytics endpoint before writing code.
