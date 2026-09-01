# Designs — one folder per module owner

These are the **finished page designs** for the portal. Each module has its own folder, so the
person building that module opens **one place** and finds everything they need: the screen designs
+ a plain-English guide telling their AI how to build them.

> Live, editable version (Claude Design canvas):
> https://claude.ai/code/artifact/3529c25d-aef6-4d9b-bffc-901f9423bd3e
> (opens for teammates in the same Claude organization; export PNG/PDF from its toolbar to share
> outside it). These HTML files are the **offline copy** — anyone can open them in a browser
> (no login), and your AI can read them to build pixel-matching React.

---

## Which folder is mine?

| Folder | Module | Owner | Screens |
|--------|--------|-------|---------|
| [`shared/`](shared/) | Landing + auth | **M1** | landing, login* |
| [`citizen/`](citizen/) | Citizen | **M2** | submit, confirm, track* |
| [`university/`](university/) | University | **M4** | queue, problem-detail, create-team, proposal, board |
| [`industry/`](industry/) | Industry + project | **M5** | register*, opportunities*, project-detail*, contribute* |
| [`government/`](government/) | Gov dashboard | **M6** | dashboard, map*, nep-impact*, review-proposals* |
| [`system/`](system/) | Design system | everyone | design-system |

`*` = being added in the next wave. Each folder has a `README.md` with its build guide.

---

## How to use these (2 steps)

**1. Look at it.** Open the `.html` file in any browser. That's exactly how the screen should look.

**2. Build it with your AI.** In your module folder, tell your AI (Claude Code / Cursor) this one line:

> **"Build `apps/web/app/<my-module>/` to match the HTML in `design/<my-module>/`. Use `@repo/ui`
> components and the design tokens, use shapes from `@repo/types`, follow the API in
> `docs/03-API-CONTRACT.md`, and obey `CLAUDE.md`. Don't invent new colors — the HTML already uses
> our tokens."**

That's it. The design and the code are the **same system**, so the result matches automatically.

---

## Why this makes all 6 of us build the same UI

The designs already use the exact colors, fonts, and radii from **`packages/ui`** — the real
components your app is built from. So when your AI builds a screen with `@repo/ui`, it *is* the
design. Nobody eyeballs a picture and guesses; the AI reads the real HTML/CSS and the real
components. Same bricks → same building.

**Do:** use `@repo/ui` (`Button`, `Card`, `Badge`, `StatusBadge`, `CategoryBadge`…) and tokens
(`bg-primary`, `text-muted-foreground`).
**Don't:** copy the raw hex/hsl out of these HTML files into your React — use the token/component
that already carries it.
