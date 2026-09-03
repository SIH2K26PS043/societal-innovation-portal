import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { route } from "@/lib/api";
import { ok } from "@repo/types";

export const dynamic = "force-dynamic";

// GET /api/university/inbox — problems the AI routed to the signed-in user's university (U1),
// highest priority first, with the match reason and whether it's been accepted yet.
export async function GET() {
  return route(async () => {
    const session = await requireRole(["STUDENT", "FACULTY", "UNIVERSITY_ADMIN", "ADMIN"]);
    const universityId = session.user.universityId;
    if (!universityId) return Response.json(ok({ items: [] }));

    const items = await prisma.assignment.findMany({
      where: { universityId },
      orderBy: { problem: { priorityScore: "desc" } },
      select: {
        matchScore: true, reason: true,
        problem: {
          select: {
            id: true, title: true, description: true, category: true, priorityScore: true, status: true, district: true,
            cluster: { select: { size: true } },
            project: { select: { id: true, status: true } },
            proposal: { select: { status: true } },
          },
        },
      },
    });
    return Response.json(ok({ items }));
  });
}
