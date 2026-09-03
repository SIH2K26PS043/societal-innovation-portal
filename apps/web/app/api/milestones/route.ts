import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { route, errors } from "@/lib/api";
import { ok } from "@repo/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

const Body = z.object({ projectId: z.string(), title: z.string().min(2) });

// POST /api/milestones — add a milestone to a project (P2 execution tracking).
export async function POST(req: Request) {
  return route(async () => {
    await requireRole(["FACULTY", "UNIVERSITY_ADMIN", "STUDENT", "ADMIN"]);
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) throw errors.validation(parsed.error.message);

    const order = await prisma.milestone.count({ where: { projectId: parsed.data.projectId } });
    const milestone = await prisma.milestone.create({
      data: { projectId: parsed.data.projectId, title: parsed.data.title, order },
    });
    return Response.json(ok({ milestone }), { status: 201 });
  });
}
