import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { route } from "@/lib/api";
import { ok } from "@repo/types";

export const dynamic = "force-dynamic";

// GET /api/university/projects — the signed-in university's live projects, with recorded outcomes (P2).
export async function GET() {
  return route(async () => {
    const session = await requireRole(["STUDENT", "FACULTY", "UNIVERSITY_ADMIN", "ADMIN"]);
    const universityId = session.user.universityId;
    if (!universityId) return Response.json(ok({ items: [] }));

    const items = await prisma.project.findMany({
      where: { problem: { assignment: { universityId } } },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true, title: true, status: true,
        problem: { select: { category: true } },
        outcomes: { select: { type: true, title: true }, orderBy: { date: "desc" } },
        milestones: { select: { id: true, title: true, status: true }, orderBy: { order: "asc" } },
      },
    });
    return Response.json(ok({ items }));
  });
}
