import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { route, errors } from "@/lib/api";
import { notifyUser } from "@/lib/notify";
import { ok } from "@repo/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

const Body = z.object({ projectId: z.string() });

// POST /api/projects/complete — mark a project deployed and its problem resolved (P2 -> D3).
export async function POST(req: Request) {
  return route(async () => {
    await requireRole(["FACULTY", "UNIVERSITY_ADMIN", "ADMIN"]);
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) throw errors.validation(parsed.error.message);

    const project = await prisma.project.findUnique({
      where: { id: parsed.data.projectId },
      select: { id: true, problemId: true, problem: { select: { title: true, reporterId: true } } },
    });
    if (!project) throw errors.notFound("Project not found");

    await prisma.project.update({ where: { id: project.id }, data: { status: "DEPLOYED" } });
    await prisma.problem.update({ where: { id: project.problemId }, data: { status: "RESOLVED" } });
    await notifyUser({
      userId: project.problem.reporterId, type: "OUTCOME_RECORDED",
      message: `Your report "${project.problem.title}" has been resolved and deployed.`, link: "/citizen",
    });

    return Response.json(ok({ status: "DEPLOYED" }));
  });
}
