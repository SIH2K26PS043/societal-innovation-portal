import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { route, errors } from "@/lib/api";
import { notifyUser } from "@/lib/notify";
import { ok } from "@repo/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

const AcceptInput = z.object({ problemId: z.string(), title: z.string().min(4).optional() });

// POST /api/projects — a university team accepts a routed problem and starts a project (U4).
// Owns the SUBMITTED/ROUTED -> IN_PROGRESS transition (see docs/02 state machine).
export async function POST(req: Request) {
  return route(async () => {
    await requireRole(["FACULTY", "UNIVERSITY_ADMIN", "STUDENT", "ADMIN"]);
    const parsed = AcceptInput.safeParse(await req.json());
    if (!parsed.success) throw errors.validation(parsed.error.message);

    const problem = await prisma.problem.findUnique({
      where: { id: parsed.data.problemId },
      select: { id: true, title: true, reporterId: true, project: { select: { id: true } } },
    });
    if (!problem) throw errors.notFound("Problem not found");
    if (problem.project) throw errors.conflict("A project already exists for this problem");

    const project = await prisma.project.create({
      data: { problemId: problem.id, title: parsed.data.title ?? problem.title, status: "IN_EXECUTION" },
    });
    await prisma.problem.update({ where: { id: problem.id }, data: { status: "IN_PROGRESS" } });
    await notifyUser({
      userId: problem.reporterId,
      type: "MILESTONE_UPDATED",
      message: `A university team has started working on "${problem.title}".`,
      link: "/citizen",
    });

    return Response.json(ok({ project }), { status: 201 });
  });
}
