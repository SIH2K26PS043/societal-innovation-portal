import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { route, errors } from "@/lib/api";
import { notifyUser } from "@/lib/notify";
import { ok, ReviewProposalInput } from "@repo/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

const Body = ReviewProposalInput.extend({ proposalId: z.string() });

// POST /api/proposals/review — admin approves/rejects (U5). Approval starts the project (P1).
export async function POST(req: Request) {
  return route(async () => {
    const session = await requireRole(["UNIVERSITY_ADMIN", "ADMIN"]);
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) throw errors.validation(parsed.error.message);
    const { proposalId, decision, note } = parsed.data;

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      select: {
        id: true, title: true, problemId: true,
        problem: { select: { title: true, reporterId: true, project: { select: { id: true } } } },
      },
    });
    if (!proposal) throw errors.notFound("Proposal not found");

    await prisma.proposal.update({
      where: { id: proposalId },
      data: { status: decision, reviewedBy: session.user.id, reviewNote: note },
    });

    if (decision === "APPROVED") {
      if (!proposal.problem.project) {
        await prisma.project.create({ data: { problemId: proposal.problemId, title: proposal.title, status: "IN_EXECUTION" } });
        await prisma.problem.update({ where: { id: proposal.problemId }, data: { status: "IN_PROGRESS" } });
      }
      await notifyUser({
        userId: proposal.problem.reporterId, type: "PROPOSAL_REVIEWED",
        message: `A team's proposal for "${proposal.problem.title}" was approved — work has started.`, link: "/citizen",
      });
    }

    return Response.json(ok({ decision }));
  });
}
