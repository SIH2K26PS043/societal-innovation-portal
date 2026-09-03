import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { route, errors } from "@/lib/api";
import { notifyUsers } from "@/lib/notify";
import { ok, CreateProposalInput } from "@repo/types";

export const dynamic = "force-dynamic";

// POST /api/proposals — a student/faculty forms a team (U2) and submits a solution proposal (U3).
export async function POST(req: Request) {
  return route(async () => {
    const session = await requireRole(["STUDENT", "FACULTY", "UNIVERSITY_ADMIN", "ADMIN"]);
    const parsed = CreateProposalInput.safeParse(await req.json());
    if (!parsed.success) throw errors.validation(parsed.error.message);
    const { problemId, title, description, approach } = parsed.data;

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      select: { id: true, assignment: { select: { universityId: true } }, proposal: { select: { id: true } } },
    });
    if (!problem) throw errors.notFound("Problem not found");
    if (problem.proposal) throw errors.conflict("A proposal already exists for this problem");

    const universityId = session.user.universityId ?? problem.assignment?.universityId;
    if (!universityId) throw errors.conflict("No university context for this proposal");

    // U2 — form a team (once per problem) with the submitter as lead.
    await prisma.team.upsert({
      where: { problemId },
      update: {},
      create: {
        problemId, universityId, name: `Team · ${title}`.slice(0, 60),
        members: { create: { userId: session.user.id, role: "lead" } },
      },
    });

    const proposal = await prisma.proposal.create({
      data: { problemId, title, description, approach, status: "SUBMITTED", submittedAt: new Date() },
    });

    const admins = await prisma.user.findMany({
      where: { role: "UNIVERSITY_ADMIN", universityId }, select: { id: true },
    });
    await notifyUsers(admins.map((a) => a.id), {
      type: "PROPOSAL_SUBMITTED", message: `New proposal to review: "${title}"`, link: "/university",
    });

    return Response.json(ok({ proposal }), { status: 201 });
  });
}
