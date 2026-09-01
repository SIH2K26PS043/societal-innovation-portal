import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { route, errors } from "@/lib/api";
import { ok, RegisterInput } from "@repo/types";

export async function POST(req: NextRequest) {
  return route(async () => {
    const parsed = RegisterInput.safeParse(await req.json());
    if (!parsed.success) throw errors.validation(parsed.error.message);
    const { email, password, name, role, universityId, phone, language } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw errors.conflict("Email already registered");

    const user = await prisma.user.create({
      data: {
        email, name, role, universityId, phone, language,
        passwordHash: await bcrypt.hash(password, 10),
      },
      select: { id: true, email: true, name: true, role: true },
    });
    return Response.json(ok({ user }), { status: 201 });
  });
}
