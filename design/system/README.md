# Design system reference — everyone

[`design-system.html`](design-system.html) is the **living style reference**: the brand + semantic
colors, the category palette, the Inter type scale, buttons, badges, form controls, and a sample
problem card.

You don't "build" this page — it mirrors what already exists in code:
- Tokens: [`packages/ui/src/styles/globals.css`](../../packages/ui/src/styles/globals.css)
- Components: [`packages/ui/src/components/`](../../packages/ui/src/components/)
- Category colors: [`packages/ui/src/lib/category-colors.ts`](../../packages/ui/src/lib/category-colors.ts)
- Full spec: [`docs/06-DESIGN-SYSTEM.md`](../../docs/06-DESIGN-SYSTEM.md)

Use it to sanity-check that a screen you built looks like it belongs to the same product. If you need
a component that isn't in `@repo/ui` yet, add it there (via shadcn) so everyone gets it — never
hand-roll a one-off.
