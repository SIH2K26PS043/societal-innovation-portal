# Government designs — M6

**You own:** `apps/web/app/gov/*` and `/api/analytics/*`.
**Requirements:** D1, D2, D3.

## Screens here
| File | Build as | What it is |
|------|----------|------------|
| [`dashboard.html`](dashboard.html) | `app/gov/page.tsx` | KPI cards, category chart, NEP-impact panel, district heatmap (D1, D3) |
| `map.html` *(coming)* | `app/gov/map/page.tsx` | Full Jharkhand district heatmap (D2, Leaflet) |
| `nep-impact.html` *(coming)* | `app/gov/impact/page.tsx` | Patents / startups / participation / completion detail (D3) |
| `review-proposals.html` *(coming)* | `app/gov/proposals/page.tsx` | Approve / reject queue |

## Tell your AI (one line)
> "Build `apps/web/app/gov/` to match `design/government/*.html`. Use `@repo/ui` + tokens, **Recharts**
> for charts and **Leaflet** for the map, fetch from `/api/analytics/*` (types `AnalyticsSummary`,
> `NepImpact`, `CategoryCount`, `DistrictCount` in `@repo/types`), follow `CLAUDE.md`."

## Watch for
- Every number is a **live DB count** — no hardcoded values in the real build.
- Chart + map + badge colors come from **one place**: `categoryColor()` / `CATEGORY_COLORS` in
  `@repo/ui`. Don't redefine category colors.
- The **NEP-impact panel** is the star (the sponsor measures it) — give it prominence.
