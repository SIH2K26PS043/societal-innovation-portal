// ─────────────────────────────────────────────────────────────────────────────
// @repo/types · SHARED CONTRACT
// The ONE place request/response shapes and enums are declared.
// apps/web (client + API) and the ai-client all import from here.
// If your AI wants to write `interface X {}` for an API shape — STOP, import it here.
// Enums MUST stay identical to packages/db/prisma/schema.prisma.
// ─────────────────────────────────────────────────────────────────────────────
import { z } from "zod";

// ── ENUMS (mirror schema.prisma exactly) ─────────────────────────────────────
export const Role = z.enum([
  "CITIZEN", "STUDENT", "FACULTY", "UNIVERSITY_ADMIN", "INDUSTRY", "GOVERNMENT", "ADMIN",
]);
export const Category = z.enum([
  "EDUCATION","HEALTH","WATER","AGRICULTURE","ENVIRONMENT","ENERGY","URBAN",
  "ACCESSIBILITY","GOVERNANCE","RURAL_LIVELIHOOD","SANITATION","INFRASTRUCTURE","OTHER",
]);
export const ProblemStatus = z.enum([
  "SUBMITTED","VALIDATED","CLUSTERED","ROUTED","IN_PROGRESS","RESOLVED","REJECTED",
]);
export const Severity = z.enum(["LOW","MEDIUM","HIGH","CRITICAL"]);
export const ProposalStatus = z.enum(["DRAFT","SUBMITTED","APPROVED","REJECTED"]);
export const ProjectStatus = z.enum(["PLANNING","IN_EXECUTION","PILOT","DEPLOYED","CLOSED"]);
export const OutcomeType = z.enum(["PATENT","STARTUP","IP_TRANSFER","PUBLICATION","DEPLOYMENT"]);
export const PartnerOffering = z.enum(["FUNDING","MENTORING","PROTOTYPING","PILOT","TECH_TRANSFER"]);
export const NotificationType = z.enum([
  "PROBLEM_SUBMITTED","PROBLEM_ROUTED","TEAM_FORMED","PROPOSAL_SUBMITTED",
  "PROPOSAL_REVIEWED","PARTNER_JOINED","MILESTONE_UPDATED","OUTCOME_RECORDED","GENERIC",
]);

export type Role = z.infer<typeof Role>;
export type Category = z.infer<typeof Category>;
export type ProblemStatus = z.infer<typeof ProblemStatus>;
export type Severity = z.infer<typeof Severity>;

// ── UNIVERSAL API ENVELOPE ───────────────────────────────────────────────────
export type ApiError = {
  code: "VALIDATION" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "SERVER";
  message: string;
};
export type ApiResponse<T> = { data: T; error: null } | { data: null; error: ApiError };

export function ok<T>(data: T): ApiResponse<T> { return { data, error: null }; }
export function fail(code: ApiError["code"], message: string): ApiResponse<never> {
  return { data: null, error: { code, message } };
}

export type Paginated<T> = { items: T[]; total: number; page: number; limit: number };
export const PageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ── AUTH ─────────────────────────────────────────────────────────────────────
export const RegisterInput = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: Role.default("CITIZEN"),
  universityId: z.string().optional(),
  phone: z.string().optional(),
  language: z.string().default("en"),
});
export type RegisterInput = z.infer<typeof RegisterInput>;

// ── PROBLEMS (C1, C2) ────────────────────────────────────────────────────────
export const CreateProblemInput = z.object({
  title: z.string().min(4).max(140),
  description: z.string().min(10),
  category: Category.optional(),          // AI fills if omitted
  severity: Severity.default("MEDIUM"),
  district: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  language: z.string().default("en"),
  mediaUrls: z.array(z.object({
    type: z.enum(["IMAGE","VIDEO","DOC"]),
    url: z.string().url(),
  })).default([]),
});
export type CreateProblemInput = z.infer<typeof CreateProblemInput>;

export const ProblemFilter = PageQuery.extend({
  category: Category.optional(),
  district: z.string().optional(),
  status: ProblemStatus.optional(),
  clusterId: z.string().optional(),
});

export type ProblemDTO = {
  id: string; title: string; description: string;
  category: Category; status: ProblemStatus; severity: Severity;
  district: string | null; latitude: number | null; longitude: number | null; address: string | null;
  reporterId: string; clusterId: string | null; priorityScore: number;
  createdAt: string; updatedAt: string;
};

// ── TEAMS / PROPOSALS (U2, U3) ───────────────────────────────────────────────
export const CreateTeamInput = z.object({
  problemId: z.string(),
  name: z.string().min(2),
  mentorId: z.string().optional(),
  memberIds: z.array(z.string()).min(1),
});
export const CreateProposalInput = z.object({
  problemId: z.string(),
  title: z.string().min(4),
  description: z.string().min(10),
  approach: z.string().min(10),
});
export const ReviewProposalInput = z.object({
  decision: z.enum(["APPROVED","REJECTED"]),
  note: z.string().optional(),
});

// ── INDUSTRY / PARTNERSHIP / PROJECT / OUTCOME (I1–I3, P1, P2) ────────────────
export const IndustryRegisterInput = z.object({
  companyName: z.string().min(2),
  sector: z.string().min(2),
  offerings: z.array(PartnerOffering).min(1),
  description: z.string().optional(),
});
export const CreatePartnershipInput = z.object({
  projectId: z.string(),
  role: PartnerOffering,
  fundingCommitted: z.number().min(0).default(0),
});
export const CreateOutcomeInput = z.object({
  projectId: z.string(),
  type: OutcomeType,
  title: z.string().min(2),
  details: z.string().optional(),
});

// ── ANALYTICS (D1, D3) ───────────────────────────────────────────────────────
export type AnalyticsSummary = {
  totalProblems: number; resolved: number;
  universitiesEngaged: number; activeProjects: number;
};
export type NepImpact = {
  patents: number; startups: number; ipTransfers: number; publications: number;
  universitiesParticipating: number; studentsEngaged: number;
  projectsCompleted: number; completionRate: number; // 0..1
};
export type CategoryCount = { category: Category; count: number };
export type DistrictCount = { district: string; count: number; resolved: number };

// ── NOTIFICATIONS (N1) ───────────────────────────────────────────────────────
export type NotificationType = z.infer<typeof NotificationType>;
export type NotificationDTO = {
  id: string;
  type: NotificationType;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

// ── AI SERVICE SHAPES (mirror apps/ai Pydantic + docs/04-AI-SERVICE.md) ───────
export const AiCategorizeReq = z.object({ title: z.string(), description: z.string() });
export type AiCategorizeRes = { category: Category; confidence: number };

export const AiProcessReq = z.object({
  problemId: z.string(), title: z.string(), description: z.string(), category: Category.optional(),
});
export type AiAssignment = {
  universityId: string; facultyId: string | null; matchScore: number; reason: string;
};
export type AiProcessRes = {
  clusterId: string; clusterSize: number; isDuplicate: boolean;
  similar: { problemId: string; score: number }[];
  assignment: AiAssignment | null;
  priorityScore: number;
};
export type AiMatch = { universityId: string; facultyId: string | null; score: number; reason: string };
