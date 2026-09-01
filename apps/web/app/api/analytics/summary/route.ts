import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { route } from "@/lib/api";
import { ok, type AnalyticsSummary } from "@repo/types";

export const dynamic = "force-dynamic"; // reads session; always server-rendered

// GET /api/analytics/summary — live KPI numbers for the government dashboard (D1)
export async function GET() {
  return route(async () => {
    await requireRole(["GOVERNMENT", "ADMIN"]);

    const [totalProblems, resolved, engagedRows, activeProjects] = await Promise.all([
      prisma.problem.count(),
      prisma.problem.count({ where: { status: "RESOLVED" } }),
      prisma.assignment.findMany({ distinct: ["universityId"], select: { universityId: true } }),
      prisma.project.count({ where: { status: { in: ["PLANNING", "IN_EXECUTION", "PILOT"] } } }),
    ]);

    const summary: AnalyticsSummary = {
      totalProblems,
      resolved,
      universitiesEngaged: engagedRows.length,
      activeProjects,
    };
    return Response.json(ok(summary));
  });
}
