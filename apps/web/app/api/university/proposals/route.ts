import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { route } from "@/lib/api";
import { ok } from "@repo/types";

export const dynamic = "force-dynamic";

// GET /api/university/proposals — submitted proposals awaiting the admin's review (U5).
export async function GET() {
  return route(async () => {
    const session = await requireRole(["UNIVERSITY_ADMIN", "ADMIN"]);
    const universityId = session.user.universityId;
    if (!universityId) return Response.json(ok({ items: [] }));

    const items = await prisma.proposal.findMany({
      where: { status: "SUBMITTED", problem: { assignment: { universityId } } },
      orderBy: { submittedAt: "desc" },
      select: {
        id: true, title: true, approach: true, createdAt: true,
        problem: { select: { id: true, title: true, category: true, priorityScore: true } },
      },
    });
    return Response.json(ok({ items }));
  });
}
