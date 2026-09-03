import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { route } from "@/lib/api";
import { ok, type AnalyticsSummary, type NepImpact, type CategoryCount, type Category } from "@repo/types";

export const dynamic = "force-dynamic"; // live dashboard

// GET /api/gov/overview — everything the government dashboard needs in one call (D1, D3).
export async function GET() {
  return route(async () => {
    await requireRole(["GOVERNMENT", "ADMIN"]);

    const [
      totalProblems, resolved, engaged, activeProjects,
      outcomes, projectsDone, projectsTotal, teamMembers,
      byCategory, topClusters, geo,
    ] = await Promise.all([
      prisma.problem.count(),
      prisma.problem.count({ where: { status: "RESOLVED" } }),
      prisma.assignment.findMany({ distinct: ["universityId"], select: { universityId: true } }),
      prisma.project.count({ where: { status: { in: ["PLANNING", "IN_EXECUTION", "PILOT"] } } }),
      prisma.outcome.groupBy({ by: ["type"], _count: { _all: true } }),
      prisma.project.count({ where: { status: { in: ["DEPLOYED", "CLOSED"] } } }),
      prisma.project.count(),
      prisma.teamMember.count(),
      prisma.problem.groupBy({ by: ["category"], _count: { _all: true } }),
      prisma.cluster.findMany({ orderBy: { size: "desc" }, take: 8, select: { id: true, title: true, category: true, size: true } }),
      prisma.problem.findMany({
        where: { latitude: { not: null }, longitude: { not: null } },
        orderBy: { priorityScore: "desc" }, take: 200,
        select: { id: true, title: true, category: true, priorityScore: true, latitude: true, longitude: true },
      }),
    ]);

    const points = geo.map((p) => ({
      id: p.id, title: p.title, category: p.category as string,
      priorityScore: p.priorityScore, lat: p.latitude as number, lng: p.longitude as number,
    }));

    const outCount = (t: string) => outcomes.find((o) => o.type === t)?._count._all ?? 0;

    const summary: AnalyticsSummary = {
      totalProblems, resolved, universitiesEngaged: engaged.length, activeProjects,
    };
    const nep: NepImpact = {
      patents: outCount("PATENT"),
      startups: outCount("STARTUP"),
      ipTransfers: outCount("IP_TRANSFER"),
      publications: outCount("PUBLICATION"),
      universitiesParticipating: engaged.length,
      studentsEngaged: teamMembers,
      projectsCompleted: projectsDone,
      completionRate: projectsTotal ? projectsDone / projectsTotal : 0,
    };
    const categories: CategoryCount[] = byCategory
      .map((c) => ({ category: c.category as Category, count: c._count._all }))
      .sort((a, b) => b.count - a.count);

    return Response.json(ok({ summary, nep, categories, topClusters, points }));
  });
}
