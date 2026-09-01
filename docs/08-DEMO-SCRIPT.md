# 08 · DEMO SCRIPT (crash-proof) **[MUST · X4]**

> 5–7 minutes. One continuous story that shows the **3 winning features**. Rehearse 3× on Day 7.
> Golden rule: **never type into a form live if seeded data can tell the story.** Live typing = live failure.

---

## 1. The story (one thread, all roles)
> *Water crisis in Ranchi.* 8 citizens report a burst pipeline. The platform merges them into one prioritized problem, routes it to the water-resources professor at BIT Mesra, a student team proposes a fix, a solar/agri MSME co-funds a pilot, and the government watches district impact + a filed patent on the NEP dashboard.

---

## 2. Beat sheet

| # | Beat | Screen | What you say | Feature |
|---|------|--------|--------------|---------|
| 1 | **Hook** | Gov dashboard | "Jharkhand has thousands of local problems and idle university talent. This platform connects them." | framing |
| 2 | **Citizen reports** | Citizen-Submit | Submit 1 fresh "no water, ward 4" report with a photo + map pin (the only live typing, kept short). | C1, C2 |
| 3 | **AI understands** | Confirmation | "Instantly categorized as WATER — and look: **reported by 8 citizens**. It merged 8 duplicate reports into one priority." | **A1, A2** |
| 4 | **Smart routing** | Confirmation / Uni-Queue | "It didn't go to 'a university' — it routed to **Prof X at BIT Mesra who researches water resources**, match 0.88, because we match by *expertise*, not a dropdown." | **A3** |
| 5 | **University solves** | Uni-CreateTeam → Proposal | Form a student+faculty team, open the pre-written proposal, submit. | U1, U2, U3 |
| 6 | **Industry joins** | Ind-Opportunities | "A solar MSME is auto-matched to this energy/water pilot and commits funding." | I1, I2, I3 |
| 7 | **Execution + outcome** | Project | Show milestones → DEPLOYED, and a recorded **patent** outcome. | P1, P2 |
| 8 | **Government impact** | Gov-NEP + Gov-Map | "Live: problems by district lighting the map, universities engaged, and NEP outcomes — patents, startups, completion rate. This is what the Department of Higher Education measures." | **D1, D2, D3** |
| 9 | **Close** | — | "Report → understand → route → solve → partner → deploy → measure. Built entirely on free, open tools, ready to scale statewide." | — |

---

## 3. Pre-flight checklist (run 10 min before)
- [ ] `apps/ai` running **locally**, `/health` → `model_loaded:true`.
- [ ] `LLM_PROVIDER=ollama` if venue Wi-Fi is unreliable (offline-safe).
- [ ] Supabase seeded: 5 universities, ~20 faculty, ~60 problems (incl. the 8 Ranchi water dupes), 5 industry, ≥1 patent + startup outcome.
- [ ] All 5 demo logins work; browser tabs pre-opened to each starting screen.
- [ ] `SEED_MODE=true` so matches are deterministic.
- [ ] **Backup video** of the full run on the desktop, ready to play.
- [ ] Phone ready to show the PWA install + responsive citizen flow (X2).

---

## 4. Failure playbook (say it calmly, keep going)
| If… | Do |
|-----|-----|
| Live submit hangs | "While that processes, here's the same flow on seeded data" → switch to seeded problem. |
| AI service errors | Already degraded gracefully (category=OTHER); switch to a pre-routed seeded problem. |
| Internet dies | Everything is local + Ollama; keep going. If total failure → play backup video. |
| A chart is empty | You seeded outcomes on Day 6 — reload; worst case narrate from the NEP panel that has data. |

---

## 5. Judge Q&A prep (have crisp answers)
- **"How is this different from a complaint portal?"** → dedup-clustering + expertise-matching + NEP outcomes; it's an innovation pipeline for the Dept. of Higher Education, not a grievance box.
- **"How does matching work?"** → 384-dim embeddings of faculty research areas vs the problem, cosine similarity in pgvector, top-K with human-readable reasons.
- **"Does it scale / cost?"** → all free-tier, one Postgres with pgvector, stateless services; scales per district.
- **"What's real vs mocked?"** → real DB, real embeddings/matching, real dashboards on seeded-but-realistic Jharkhand data (no dataset was provided by the PS).
