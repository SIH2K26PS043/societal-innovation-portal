import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { route, errors } from "@/lib/api";
import { ok, CreateOutcomeInput } from "@repo/types";

export const dynamic = "force-dynamic";

// POST /api/outcomes — record a measurable NEP outcome on a project (P2): patent, startup, IP transfer…
export async function POST(req: Request) {
  return route(async () => {
    await requireRole(["FACULTY", "UNIVERSITY_ADMIN", "INDUSTRY", "ADMIN"]);
    const parsed = CreateOutcomeInput.safeParse(await req.json());
    if (!parsed.success) throw errors.validation(parsed.error.message);
    const { projectId, type, title, details } = parsed.data;

    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
    if (!project) throw errors.notFound("Project not found");

    const outcome = await prisma.outcome.create({ data: { projectId, type, title, details } });
    return Response.json(ok({ outcome }), { status: 201 });
  });
}
