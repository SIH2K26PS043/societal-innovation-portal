import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { route } from "@/lib/api";
import { ok } from "@repo/types";

export const dynamic = "force-dynamic"; // reads session + DB

// GET /api/problems/mine — the signed-in citizen's own reports, with cluster + routing (C3)
export async function GET() {
  return route(async () => {
    const session = await requireAuth();
    const items = await prisma.problem.findMany({
      where: { reporterId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        cluster: { select: { id: true, size: true, title: true } },
        assignment: { select: { reason: true, matchScore: true, university: { select: { name: true } } } },
      },
    });
    return Response.json(ok({ items }));
  });
}
