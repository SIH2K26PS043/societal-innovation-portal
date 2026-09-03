import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { route, errors } from "@/lib/api";
import { ok, CreatePartnershipInput } from "@repo/types";

export const dynamic = "force-dynamic";

// POST /api/partnerships — an industry partner joins a project (I2, P1).
export async function POST(req: Request) {
  return route(async () => {
    const session = await requireRole(["INDUSTRY", "ADMIN"]);
    const parsed = CreatePartnershipInput.safeParse(await req.json());
    if (!parsed.success) throw errors.validation(parsed.error.message);
    const { projectId, role, fundingCommitted } = parsed.data;

    const profile = await prisma.industryProfile.findUnique({ where: { userId: session.user.id }, select: { id: true } });
    if (!profile) throw errors.conflict("Register an industry profile before partnering");

    const dup = await prisma.partnership.findFirst({ where: { projectId, partnerId: profile.id, role } });
    if (dup) throw errors.conflict("You already offer this to the project");

    const partnership = await prisma.partnership.create({
      data: { projectId, partnerId: profile.id, role, fundingCommitted },
    });
    return Response.json(ok({ partnership }), { status: 201 });
  });
}
