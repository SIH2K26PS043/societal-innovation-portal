# 05 · USER FLOWS & JOURNEYS

> Diagrams render on GitHub and in the handbook artifact. Build screens to match these flows.
> These are also the blueprint for the **Figma** screens (frame names in **bold** below).

---

## 1. Roles → what they can do (RBAC map) **[MUST · X1]**

```mermaid
flowchart TB
    subgraph roles["5 ROLES"]
      CIT["CITIZEN"]
      UNI["UNIVERSITY<br/>(admin / faculty / student)"]
      IND["INDUSTRY"]
      GOV["GOVERNMENT"]
      ADM["ADMIN"]
    end
    CIT --> report["Report problem · track status"]
    UNI --> queue["See matched queue · form team · propose · run project"]
    IND --> browse["Browse matched projects · fund · mentor"]
    GOV --> dash["Dashboards · NEP impact · review proposals"]
    ADM --> all["Everything · moderation · overrides"]
```

Each role lands on its own home after login: `/citizen`, `/university`, `/industry`, `/gov`, `/admin`. `requireRole()` guards both pages and API.

---

## 2. Citizen journey (C1–C4) · Owner M2

```mermaid
flowchart LR
    L["Landing<br/>**Citizen-Landing**"] --> F["Submit form<br/>**Citizen-Submit**"]
    F --> M["Add photo/video<br/>pin on map (GPS)<br/>**Citizen-Media-Map**"]
    M --> S["Submitting…<br/>AI categorizes"]
    S --> R["Confirmation<br/>'Routed to Prof X · reported by N'<br/>**Citizen-Confirm**"]
    R --> T["My Submissions<br/>status timeline<br/>**Citizen-Track**"]
```

Key UX rules: big fields, minimal steps, works one-handed on mobile, Hindi toggle (C3), optional voice input (Bhashini). GPS auto-fills lat/long; map pin is adjustable.

---

## 3. The core AI pipeline (what happens after submit) · Owner M3

```mermaid
sequenceDiagram
    autonumber
    participant Cit as Citizen
    participant Web as apps/web API
    participant AI as apps/ai
    participant DB as Postgres+pgvector
    Cit->>Web: POST /api/problems
    Web->>DB: insert Problem (SUBMITTED)
    Web->>AI: /categorize
    AI-->>Web: {WATER, 0.94}
    Web->>AI: /process {problemId,...}
    AI->>DB: write embedding
    AI->>DB: cosine dedup → cluster (size=8)
    AI->>DB: cosine match faculty → Assignment(BIT Mesra, Prof X, 0.88)
    AI-->>Web: {clusterId, size:8, assignment, priority}
    Web->>DB: Problem→ROUTED, notify university
    Web-->>Cit: "Reported by 8 people · routed to Prof X, BIT Mesra"
```

This sequence is the money shot of the demo — dedup ("reported by 8") and expertise-match ("Prof X who researches water") happen visibly.

---

## 4. University journey (U1–U4) · Owner M4

```mermaid
flowchart LR
    Q["Matched queue<br/>**Uni-Queue**"] --> D["Problem detail<br/>+ match reason<br/>**Uni-ProblemDetail**"]
    D --> Tm["Form team<br/>pick students + mentor<br/>**Uni-CreateTeam**"]
    Tm --> Pr["Write proposal<br/>**Uni-Proposal**"]
    Pr --> Sub["Submit → Gov review"]
    Sub --> Bo["Project task board<br/>**Uni-Board**"]
```

The queue only shows problems whose `Assignment.universityId` = this university (that's why matching must run first).

---

## 5. Industry journey (I1–I3) · Owner M5

```mermaid
flowchart LR
    Reg["Register company<br/>sector + offerings<br/>**Ind-Register**"] --> Op["Matched opportunities<br/>**Ind-Opportunities**"]
    Op --> PD["Project detail<br/>**Ind-ProjectDetail**"]
    PD --> Join["Offer funding / mentoring<br/>**Ind-Partner**"]
    Join --> Track["Contribution + pilot status<br/>**Ind-Track**"]
```

Opportunities are matched with the **same engine as A3** (`/match/industry`), so a solar startup sees energy projects.

---

## 6. Government journey (D1–D3) · Owner M6

```mermaid
flowchart LR
    Home["Dashboard home<br/>KPI cards<br/>**Gov-Dashboard**"] --> Cat["By category / district charts"]
    Home --> Map["Jharkhand heatmap<br/>**Gov-Map**"]
    Home --> Nep["NEP impact<br/>patents · startups · completion<br/>**Gov-NEP**"]
    Home --> Rev["Review proposals<br/>**Gov-Review**"]
```

Every number is a live DB aggregation. NEP panel is what the sponsor cares about — give it prominence.

---

## 7. Full lifecycle swimlane (how all roles connect) **[MUST]**

```mermaid
sequenceDiagram
    participant Citizen
    participant System as Platform + AI
    participant University
    participant Industry
    participant Government
    Citizen->>System: report problem (+photo, +location)
    System->>System: categorize, dedup, cluster
    System->>University: route to best-fit professor
    University->>University: form team, submit proposal
    University->>Government: proposal for approval
    Government-->>University: approved
    Industry->>University: join (fund / mentor / pilot)
    University->>System: milestones → deployed solution
    University->>System: record outcome (patent / startup)
    System->>Government: dashboards update (NEP impact)
    System-->>Citizen: status → RESOLVED
```

If you can drive this one sequence end-to-end with seeded data on Day 5, the product is demo-complete.

---

## 8. Figma organization (so all screens match) **[SHOULD]**
- **Pages:** `00 Design System` · `01 Citizen` · `02 University` · `03 Industry` · `04 Government` · `05 Auth/Shared` · `06 Flows (FigJam)`.
- Frame names above (**bold**) are the canonical screen names — use them in Figma and as the React route/page name so design ↔ code map 1:1.
- Build the shared components (button, input, card, badge, table, chart shell) on the `00 Design System` page first; every other page composes them. This is the visual equivalent of `packages/ui`.
- Tokens (colors/type/spacing) come from [06-DESIGN-SYSTEM](06-DESIGN-SYSTEM.md) and must be defined as Figma variables so a color change propagates everywhere.
