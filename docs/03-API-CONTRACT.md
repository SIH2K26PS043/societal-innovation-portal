# 03 · API CONTRACT (REST)

> Every endpoint `apps/web` exposes, as Next.js Route Handlers under `app/api/`.
> **Frontend codes against this before the backend exists**, using the same request/response shapes.
> All shapes are Zod schemas in [`packages/types`](../contracts/types.ts). Import them — never redeclare.

---

## 1. Universal rules (obey exactly)

**1.1 Response envelope** — every endpoint returns this shape, always:
```ts
// success
{ "data": <payload>, "error": null }
// failure
{ "data": null, "error": { "code": "VALIDATION|UNAUTHORIZED|FORBIDDEN|NOT_FOUND|CONFLICT|SERVER", "message": "human readable" } }
```

**1.2 Auth** — session via NextAuth JWT cookie. Every handler calls `requireRole([...])` helper (M1 provides in `apps/web/lib/auth.ts`). Roles per endpoint are listed below. `PUBLIC` = no auth.

**1.3 Validation** — parse every body/query with the Zod schema from `@repo/types`. On failure return `error.code = "VALIDATION"` (HTTP 400).

**1.4 Pagination** — list endpoints accept `?page=1&limit=20`; response payload is `{ items: [...], total, page, limit }`.

**1.5 IDs** — all IDs are `cuid` strings. **1.6 Dates** — ISO-8601 strings over the wire.

**1.7 HTTP status** — 200 ok · 201 created · 400 validation · 401 unauth · 403 forbidden · 404 not found · 409 conflict · 500 server. The envelope `error.code` mirrors it.

---

## 2. Auth & users — `/api/auth/*`, `/api/users/*` · **[MUST]** · Owner M1
| Method | Path | Role | Body → Response |
|--------|------|------|-----------------|
| POST | `/api/auth/register` | PUBLIC | `RegisterInput` → `{ user }` |
| POST | `/api/auth/[...nextauth]` | PUBLIC | NextAuth credentials login |
| GET | `/api/users/me` | any auth | → `{ user }` (from session) |
| GET | `/api/users?role=STUDENT&universityId=…` | UNIVERSITY_ADMIN, ADMIN | → paged `User[]` (for team-building) |

---

## 3. Problems — `/api/problems/*` · Owner M2 (create/track) + M3 (AI hooks)
| Method | Path | Role | Priority | Body → Response |
|--------|------|------|----------|-----------------|
| POST | `/api/problems` | CITIZEN (+any) | **MUST** | `CreateProblemInput` → `{ problem }`. Server then fires AI pipeline (§7). |
| GET | `/api/problems` | any | **MUST** | filters: `?category&district&status&clusterId&page` → paged `Problem[]` |
| GET | `/api/problems/:id` | any | **MUST** | → `{ problem, media, cluster, assignment }` |
| GET | `/api/problems/mine` | CITIZEN | **SHOULD** | citizen's own submissions + status timeline (C4) |
| POST | `/api/problems/:id/media` | owner | **MUST** | multipart upload → `{ media }` (C2) |
| PATCH | `/api/problems/:id/status` | ADMIN, GOVERNMENT | **SHOULD** | `{ status }` → `{ problem }` (manual override) |

**Media upload flow (C2):** client asks `POST /api/uploads/sign` → gets a Supabase signed URL → uploads directly → posts the returned URL to `/api/problems/:id/media`. Keeps large files off the API.

---

## 4. Clusters & routing — `/api/clusters/*`, `/api/assignments/*` · Owner M3↔M4 integration
| Method | Path | Role | Priority | Response |
|--------|------|------|----------|----------|
| GET | `/api/clusters` | GOVERNMENT, ADMIN | **MUST** | paged clusters with `size` ("reported by N") |
| GET | `/api/clusters/:id` | any | **MUST** | cluster + its problems |
| GET | `/api/assignments?universityId=…` | UNIVERSITY_ADMIN, FACULTY | **MUST** | the university's routed queue (U1) |
| POST | `/api/problems/:id/route` | ADMIN | **SHOULD** | force re-run matching (calls AI §7.3) |

---

## 5. University — teams, proposals · `/api/teams/*`, `/api/proposals/*` · Owner M4
| Method | Path | Role | Priority | Body → Response |
|--------|------|------|----------|-----------------|
| POST | `/api/teams` | UNIVERSITY_ADMIN, FACULTY | **MUST** | `CreateTeamInput{ problemId, name, mentorId, memberIds[] }` → `{ team }` (U2) |
| GET | `/api/teams/:id` | team members, uni | **MUST** | team + members + mentor |
| POST | `/api/proposals` | FACULTY, STUDENT | **MUST** | `CreateProposalInput{ problemId, title, description, approach }` → `{ proposal }` (U3) |
| PATCH | `/api/proposals/:id` | owner | **SHOULD** | edit draft |
| POST | `/api/proposals/:id/submit` | FACULTY | **MUST** | DRAFT→SUBMITTED |
| POST | `/api/proposals/:id/review` | GOVERNMENT, ADMIN | **SHOULD** | `{ decision: APPROVED\|REJECTED, note }` |

---

## 6. Industry, projects, outcomes, notifications · Owner M5
| Method | Path | Role | Priority | Notes |
|--------|------|------|----------|-------|
| POST | `/api/industry/register` | INDUSTRY | **SHOULD** | create `IndustryProfile` (I1) |
| GET | `/api/industry/opportunities` | INDUSTRY | **SHOULD** | matched open projects (I2, calls AI §7.4) |
| POST | `/api/partnerships` | INDUSTRY | **SHOULD** | join a project `{ projectId, role, fundingCommitted }` (I1/I3) |
| POST | `/api/projects` | FACULTY, ADMIN | **SHOULD** | create from approved proposal (P1) |
| GET | `/api/projects/:id` | stakeholders | **SHOULD** | project + milestones + partnerships + outcomes |
| POST | `/api/projects/:id/milestones` | team, mentor | **SHOULD** | add/update milestone (P1) |
| POST | `/api/projects/:id/outcomes` | FACULTY, ADMIN | **COULD** | record PATENT/STARTUP/… (P2) |
| GET | `/api/notifications` | any | **SHOULD** | current user's notifications (N1) |
| POST | `/api/notifications/:id/read` | owner | **SHOULD** | mark read |
| POST | `/api/projects/:id/comments` | stakeholders | **COULD** | per-project thread (N2) |

---

## 7. AI pipeline hooks (server → `apps/ai`) · Owner M3 · **[MUST]**

`apps/web` calls the Python service through one typed wrapper: `apps/web/lib/ai-client.ts`. Contract lives in [04-AI-SERVICE](04-AI-SERVICE.md). Orchestration:

```mermaid
sequenceDiagram
    participant C as Citizen (browser)
    participant W as apps/web (API)
    participant AI as apps/ai (FastAPI)
    participant DB as Postgres+pgvector

    C->>W: POST /api/problems (title, desc, media, geo)
    W->>DB: insert Problem (status=SUBMITTED)
    W->>AI: POST /categorize {title, description}
    AI-->>W: {category, confidence}
    W->>AI: POST /process {problemId, title, description}
    AI->>AI: embed → write Problem.embedding
    AI->>DB: cosine search similar problems
    AI->>DB: assign/create Cluster, update size
    AI->>DB: cosine search faculty expertise → best match
    AI->>DB: insert Assignment(universityId, facultyId, score)
    AI-->>W: {category, clusterId, clusterSize, assignment}
    W->>DB: update Problem(status=ROUTED, category, clusterId, priorityScore)
    W->>DB: insert Notification(PROBLEM_ROUTED) for university
    W-->>C: {problem} (201) — "routed to Prof X, BIT Mesra; reported by N"
```

- **7.1 Categorize** → `POST {ai}/categorize` (A1)
- **7.2 Process** (embed + dedup + match in one call, keeps latency low) → `POST {ai}/process` (A2+A3)
- **7.3 Re-match** → `POST {ai}/match/university` (A3 on demand)
- **7.4 Industry match** → `POST {ai}/match/industry` (I2)
- **7.5 Validate** → `POST {ai}/validate` (A5, spam/quality)

> If `apps/ai` is unreachable, the API still creates the Problem with `category=OTHER`, `status=SUBMITTED`, and queues it for retry. **The web app never hard-fails because the AI service is down** (demo safety, X4).

---

## 8. Analytics — `/api/analytics/*` · Owner M6 · **[MUST]**
| Method | Path | Role | Priority | Response |
|--------|------|------|----------|----------|
| GET | `/api/analytics/summary` | GOVERNMENT, ADMIN | **MUST** | `{ totalProblems, resolved, universitiesEngaged, activeProjects }` (D1) |
| GET | `/api/analytics/by-category` | GOV, ADMIN | **MUST** | `[{ category, count }]` |
| GET | `/api/analytics/by-district` | GOV, ADMIN | **MUST** | `[{ district, count, resolved }]` (feeds map D2) |
| GET | `/api/analytics/timeline` | GOV, ADMIN | **SHOULD** | `[{ date, submitted, resolved }]` |
| GET | `/api/analytics/nep-impact` | GOV, ADMIN | **MUST** | `{ patents, startups, ipTransfers, publications, universitiesParticipating, studentsEngaged, projectsCompleted, completionRate }` (D3) |

All analytics are **DB aggregations** (Prisma `groupBy`/`count`), computed live. No caching needed for the demo.

---

## 9. Contract-first workflow (how frontend & backend stay in sync)
1. This doc + `packages/types` define the shape. **Both are frozen on Day 1.**
2. Frontend builds UI against a **mock** returning the typed shape (MSW or a `lib/mock/*.ts`).
3. Backend implements the real handler returning the identical shape.
4. Swap mock → real by flipping one flag. Because both used `@repo/types`, it just compiles.
