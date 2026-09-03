import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { route } from "@/lib/api";
import { env } from "@/lib/env";
import { ok } from "@repo/types";

export const dynamic = "force-dynamic";

// GET /api/admin/overview — platform health + users + moderation queue for the admin (M1).
export async function GET() {
  return route(async () => {
    await requireRole(["ADMIN"]);

    const [users, problems, clusters, projects, resolved, roleGroups, recentUsers, recentProblems] = await Promise.all([
      prisma.user.count(),
      prisma.problem.count(),
      prisma.cluster.count(),
      prisma.project.count(),
      prisma.problem.count({ where: { status: "RESOLVED" } }),
      prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" }, take: 15,
        select: { id: true, name: true, email: true, role: true, university: { select: { name: true } } },
      }),
      prisma.problem.findMany({
        orderBy: { createdAt: "desc" }, take: 10,
        select: { id: true, title: true, status: true, category: true, createdAt: true },
      }),
    ]);

    let aiHealthy = false, aiModelLoaded = false;
    try {
      const r = await fetch(`${env.AI_SERVICE_URL}/health`, { cache: "no-store" });
      const jj = await r.json();
      aiHealthy = jj?.data?.status === "ok";
      aiModelLoaded = !!jj?.data?.model_loaded;
    } catch {
      /* AI service unreachable — reported as down */
    }

    return Response.json(ok({
      counts: { users, problems, clusters, projects, resolved },
      roleBreakdown: roleGroups.map((g) => ({ role: g.role, count: g._count._all })),
      ai: { healthy: aiHealthy, modelLoaded: aiModelLoaded },
      recentUsers, recentProblems,
    }));
  });
}
