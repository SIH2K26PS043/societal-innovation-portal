import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { route, errors } from "@/lib/api";
import { ok } from "@repo/types";

// POST /api/notifications/:id/read — mark one of your notifications read (N1)
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  return route(async () => {
    const session = await requireAuth();
    const n = await prisma.notification.findUnique({ where: { id: params.id } });
    if (!n || n.userId !== session.user.id) throw errors.notFound();
    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: { read: true },
    });
    return Response.json(ok(updated));
  });
}
