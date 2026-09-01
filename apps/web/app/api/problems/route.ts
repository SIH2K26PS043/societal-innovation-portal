import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { route, errors } from "@/lib/api";
import { ai } from "@/lib/ai-client";
import { ok, CreateProblemInput, ProblemFilter } from "@repo/types";

export const dynamic = "force-dynamic"; // reads query params + DB; server-rendered

// GET /api/problems — list with filters (public read)
export async function GET(req: NextRequest) {
  return route(async () => {
    const parsed = ProblemFilter.safeParse(Object.fromEntries(req.nextUrl.searchParams));
    if (!parsed.success) throw errors.validation(parsed.error.message);
    const { page, limit, category, district, status, clusterId } = parsed.data;
    const where = { category, district, status, clusterId }; // Prisma ignores undefined

    const [items, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.problem.count({ where }),
    ]);
    return Response.json(ok({ items, total, page, limit }));
  });
}

// POST /api/problems — citizen submits; server runs the AI pipeline (docs/03 §7)
export async function POST(req: NextRequest) {
  return route(async () => {
    const session = await requireRole(["CITIZEN", "ADMIN"]);
    const parsed = CreateProblemInput.safeParse(await req.json());
    if (!parsed.success) throw errors.validation(parsed.error.message);
    const input = parsed.data;

    // 1) persist the report
    const problem = await prisma.problem.create({
      data: {
        title: input.title,
        description: input.description,
        category: input.category ?? "OTHER",
        severity: input.severity,
        district: input.district,
        latitude: input.latitude,
        longitude: input.longitude,
        address: input.address,
        language: input.language,
        reporterId: session.user.id,
        media: { create: input.mediaUrls.map((m) => ({ type: m.type, url: m.url })) },
      },
    });

    // 2) AI: categorize + embed + dedup + expertise-match (all degrade gracefully)
    const category = input.category ?? (await ai.categorize(input.title, input.description))?.category;
    const processed = await ai.process({
      problemId: problem.id,
      title: input.title,
      description: input.description,
      category,
    });

    // 3) reflect AI outcome on the problem
    const updated = await prisma.problem.update({
      where: { id: problem.id },
      data: {
        category: category ?? problem.category,
        clusterId: processed?.clusterId ?? undefined,
        priorityScore: processed?.priorityScore ?? 0,
        status: processed?.assignment ? "ROUTED" : "SUBMITTED",
      },
    });

    return Response.json(ok({ problem: updated, ai: processed }), { status: 201 });
  });
}
