import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { route, errors } from "@/lib/api";
import { ok, Role } from "@repo/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

const Body = z.object({ userId: z.string(), role: Role });

// POST /api/admin/user-role — change a user's role (M1 user management).
export async function POST(req: Request) {
  return route(async () => {
    await requireRole(["ADMIN"]);
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) throw errors.validation(parsed.error.message);
    await prisma.user.update({ where: { id: parsed.data.userId }, data: { role: parsed.data.role } });
    return Response.json(ok({ userId: parsed.data.userId, role: parsed.data.role }));
  });
}
