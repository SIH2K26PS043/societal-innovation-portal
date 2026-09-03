import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { route, errors } from "@/lib/api";
import { ok } from "@repo/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

const Body = z.object({ milestoneId: z.string() });
const NEXT: Record<string, string> = { TODO: "IN_PROGRESS", IN_PROGRESS: "DONE", DONE: "TODO", BLOCKED: "TODO" };

// POST /api/milestones/toggle — advance a milestone TODO -> IN_PROGRESS -> DONE -> TODO.
export async function POST(req: Request) {
  return route(async () => {
    await requireRole(["FACULTY", "UNIVERSITY_ADMIN", "STUDENT", "ADMIN"]);
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) throw errors.validation(parsed.error.message);

    const m = await prisma.milestone.findUnique({ where: { id: parsed.data.milestoneId }, select: { status: true } });
    if (!m) throw errors.notFound("Milestone not found");
    const status = (NEXT[m.status] ?? "TODO") as "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
    const milestone = await prisma.milestone.update({ where: { id: parsed.data.milestoneId }, data: { status } });
    return Response.json(ok({ milestone }));
  });
}
