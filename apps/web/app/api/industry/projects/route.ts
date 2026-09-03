import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { route } from "@/lib/api";
import { ok } from "@repo/types";

export const dynamic = "force-dynamic";

// GET /api/industry/projects — active projects a partner can fund/mentor/pilot (I1),
// with the source problem's category + priority and whether this partner already joined.
export async function GET() {
  return route(async () => {
    const session = await requireRole(["INDUSTRY", "ADMIN"]);
    const profile = await prisma.industryProfile.findUnique({
      where: { userId: session.user.id }, select: { id: true },
    });

    const projects = await prisma.project.findMany({
      where: { status: { in: ["PLANNING", "IN_EXECUTION", "PILOT"] } },
      orderBy: [{ problem: { priorityScore: "desc" } }, { updatedAt: "desc" }],
      take: 30,
      select: {
        id: true, title: true, status: true,
        problem: {
          select: { category: true, priorityScore: true, district: true, cluster: { select: { size: true } } },
        },
        partnerships: { select: { role: true, fundingCommitted: true, partnerId: true } },
      },
    });

    const items = projects.map((p) => ({
      id: p.id, title: p.title, status: p.status,
      category: p.problem.category, priorityScore: p.problem.priorityScore,
      district: p.problem.district, clusterSize: p.problem.cluster?.size ?? 1,
      partnerCount: p.partnerships.length,
      funding: p.partnerships.reduce((s, x) => s + x.fundingCommitted, 0),
      joined: profile ? p.partnerships.some((x) => x.partnerId === profile.id) : false,
    }));
    return Response.json(ok({ items, hasProfile: !!profile }));
  });
}
