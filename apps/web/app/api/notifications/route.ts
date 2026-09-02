import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { route } from "@/lib/api";
import { ok } from "@repo/types";

export const dynamic = "force-dynamic"; // reads session

// GET /api/notifications — the current user's notifications + unread count (N1)
export async function GET() {
  return route(async () => {
    const session = await requireAuth();
    const [items, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.notification.count({ where: { userId: session.user.id, read: false } }),
    ]);
    return Response.json(ok({ items, unread }));
  });
}
