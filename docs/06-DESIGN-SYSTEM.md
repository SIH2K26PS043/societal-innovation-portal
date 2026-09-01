# 06 · DESIGN SYSTEM

> So six people's screens look like **one government product**, not six hackathon projects.
> Everyone uses **shadcn/ui** + these exact tokens. No custom colors, no random spacing.

---

## 1. Design principles
- **GovTech, trustworthy, calm.** Deep institutional blue + Jharkhand green, restrained saffron accent. Not flashy.
- **Data-forward.** The product's value is information density done clearly (dashboards, queues, maps).
- **Mobile-first.** Citizens are on phones; officials on desktop. Everything responsive.
- **Accessible.** WCAG AA contrast, keyboard nav, labels on inputs. (Accessibility is literally a problem category — practice it.)

---

## 2. Color tokens (CSS variables → Tailwind → Figma variables)

Paste into `apps/web/app/globals.css` and mirror as Figma variables (same names).

```css
:root {
  /* brand */
  --primary: 213 94% 24%;        /* #0B3D91 deep institutional blue */
  --primary-foreground: 0 0% 100%;
  --secondary: 152 55% 30%;      /* #217a4b Jharkhand green */
  --secondary-foreground: 0 0% 100%;
  --accent: 28 92% 52%;          /* #f57c1f restrained saffron — CTAs/highlights only */
  --accent-foreground: 0 0% 100%;

  /* semantic status (map to ProblemStatus / severity) */
  --success: 152 55% 35%;        /* resolved */
  --warning: 38 92% 50%;         /* in-progress */
  --danger:  0 72% 51%;          /* critical / rejected */
  --info:    213 94% 40%;        /* routed */

  /* neutrals */
  --background: 210 20% 98%;
  --foreground: 215 25% 15%;
  --muted: 210 16% 93%;
  --muted-foreground: 215 15% 40%;
  --border: 214 20% 88%;
  --card: 0 0% 100%;
  --radius: 0.625rem;
}
.dark {
  --background: 215 28% 9%;
  --foreground: 210 20% 96%;
  --card: 215 25% 13%;
  --muted: 215 20% 18%;
  --muted-foreground: 215 15% 65%;
  --border: 215 20% 24%;
  /* brand tokens stay, foregrounds already light */
}
```

**Category colors** (used in charts/map/badges — keep identical across dashboard, map, badges):
| Category | Hex | | Category | Hex |
|---|---|---|---|---|
| WATER | `#2b8ccc` | | ENERGY | `#f5a623` |
| HEALTH | `#e0524e` | | URBAN | `#7b61ff` |
| AGRICULTURE | `#5aa02c` | | ACCESSIBILITY | `#00a3a3` |
| EDUCATION | `#0b3d91` | | GOVERNANCE | `#8a6d3b` |
| ENVIRONMENT | `#2e7d5b` | | RURAL_LIVELIHOOD | `#b5651d` |
| SANITATION | `#6d9dc5` | | INFRASTRUCTURE | `#616161` |

Export this map as `packages/ui/category-colors.ts` so charts (M6), badges (all), and the map (M6) never disagree.

---

## 3. Typography
- **Font:** `Inter` (UI) via `next/font`; `Noto Sans Devanagari` for Hindi. Fallback `system-ui, sans-serif`.
- **Scale:** text-xs 12 · sm 14 · base 16 · lg 18 · xl 20 · 2xl 24 · 3xl 30 · 4xl 36. Line-height 1.5 body, 1.2 headings.
- **Weights:** 400 body · 500 labels · 600 headings · 700 KPI numbers.

## 4. Spacing & layout
- 4px base grid: `1=4 2=8 3=12 4=16 6=24 8=32`. Section padding `p-6`, card gap `gap-4`.
- Max content width `max-w-7xl` centered; dashboards use a 12-col grid.
- Radius `--radius` on cards/buttons/inputs. One shadow: `shadow-sm` for cards, `shadow-md` on hover.

---

## 5. Component inventory (build once in `packages/ui`, reuse everywhere) **[MUST]**

Install via shadcn/ui — do **not** hand-roll these:
`Button · Input · Textarea · Select · Checkbox · RadioGroup · Badge · Card · Table · Tabs · Dialog · Sheet · Toast(sonner) · Avatar · Skeleton · DropdownMenu · Progress · Tooltip`.

**App-specific composites** (build in `packages/ui` or `apps/web/components`, shared):
| Component | Used by | Notes |
|---|---|---|
| `<RoleBadge role/>` | all | colored per role |
| `<StatusBadge status/>` | all | maps ProblemStatus→semantic color |
| `<CategoryBadge category/>` | all | uses category-colors map |
| `<ProblemCard/>` | M2/M4 | title, category, cluster size, district |
| `<ClusterBadge size/>` | M2/M3/M6 | "👥 reported by N" |
| `<StatCard label value delta/>` | M6 | KPI tiles |
| `<Chart* />` (Recharts wrappers) | M6 | fixed palette |
| `<MapView districts/>` | M2/M6 | Leaflet wrapper |
| `<Timeline steps/>` | M2/M5 | status/milestone timeline |
| `<EmptyState/>`, `<LoadingState/>` | all | consistent empty/loading |

**Rule:** if two modules need the same widget, it goes in `packages/ui`. Never copy-paste a component between modules.

---

## 6. Figma ↔ code mapping **[SHOULD]**
- Figma page `00 Design System` mirrors this file: color styles/variables named exactly as the CSS vars, text styles matching the scale, and a component for each item above.
- Frame names in [05-USER-FLOWS](05-USER-FLOWS.md) (**Citizen-Submit**, **Gov-Dashboard**, …) are the shared vocabulary between design and code.
- Optional: use Figma **Code Connect** to map Figma components → `packages/ui` React components so the MCP can generate matching code. Nice-to-have, not Day-1.

---

## 7. Do / Don't (kills visual drift)
- ✅ Use tokens (`bg-primary`, `text-muted-foreground`). ❌ Never hardcode hex in components.
- ✅ Use shadcn components. ❌ No second UI library (no MUI/Chakra/AntD).
- ✅ One icon set (`lucide-react`). ❌ No mixed icon packs.
- ✅ Same page shell (`<AppShell>` with sidebar+topbar) for every logged-in role. ❌ No per-module bespoke layout.
