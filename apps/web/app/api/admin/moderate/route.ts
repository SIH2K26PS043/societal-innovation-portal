import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { route, errors } from "@/lib/api";
import { ok } from "@repo/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

const Body = z.object({ problemId: z.string(), action: z.enum(["reject", "restore"]) });

// POST /api/admin/moderate — reject spam/invalid reports, or restore them (M1 moderation).
export async function POST(req: Request) {
  return route(async () => {
    await requireRole(["ADMIN"]);
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) throw errors.validation(parsed.error.message);
    const status = parsed.data.action === "reject" ? "REJECTED" : "SUBMITTED";
    await prisma.problem.update({ where: { id: parsed.data.problemId }, data: { status } });
    return Response.json(ok({ problemId: parsed.data.problemId, status }));
  });
}
