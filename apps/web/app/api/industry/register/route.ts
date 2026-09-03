import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { route, errors } from "@/lib/api";
import { ok, IndustryRegisterInput } from "@repo/types";

export const dynamic = "force-dynamic";

// POST /api/industry/register — create/update the signed-in user's industry profile (I1).
export async function POST(req: Request) {
  return route(async () => {
    const session = await requireRole(["INDUSTRY", "ADMIN"]);
    const parsed = IndustryRegisterInput.safeParse(await req.json());
    if (!parsed.success) throw errors.validation(parsed.error.message);
    const { companyName, sector, offerings, description } = parsed.data;

    const profile = await prisma.industryProfile.upsert({
      where: { userId: session.user.id },
      update: { companyName, sector, offerings, description },
      create: { userId: session.user.id, companyName, sector, offerings, description },
    });
    return Response.json(ok({ profile }), { status: 201 });
  });
}
