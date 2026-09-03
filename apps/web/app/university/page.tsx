"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, CategoryBadge, StatusBadge, ClusterBadge } from "@repo/ui";
import { OutcomeType } from "@repo/types";
import { Sparkles, Inbox, FileCheck2, Check, X, Rocket, Award } from "lucide-react";

const OUTCOME_TYPES = OutcomeType.options;

type InboxItem = {
  matchScore: number; reason: string | null;
  problem: {
    id: string; title: string; description: string; category: string; priorityScore: number;
    status: string; district: string | null;
    cluster: { size: number } | null;
    project: { id: string; status: string } | null;
    proposal: { status: string } | null;
  };
};
type Review = { id: string; title: string; approach: string; problem: { id: string; title: string; category: string; priorityScore: number } };

const j = async (url: string, init?: RequestInit) => {
  const r = await fetch(url, init);
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.data;
};
const textarea = "h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function UniversityHome() {
  const qc = useQueryClient();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "UNIVERSITY_ADMIN" || session?.user?.role === "ADMIN";
  const inbox = useQuery({ queryKey: ["university", "inbox"], queryFn: () => j("/api/university/inbox").then((d) => d.items as InboxItem[]) });

  return (
    <AppShell title="University">
      {isAdmin && <ReviewSection />}

      <h1 className="text-2xl font-extrabold tracking-tight">Routed to your university</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Problems the AI matched to your institution&apos;s expertise — highest priority first. Propose a solution to pick one up.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {inbox.isLoading && <p className="text-sm text-muted-foreground">Loading inbox…</p>}
        {inbox.isError && <p className="text-sm text-destructive">Couldn&apos;t load your inbox.</p>}
        {inbox.data?.length === 0 && (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Nothing routed yet.</p>
          </div>
        )}
        {inbox.data?.map((it) => <InboxCard key={it.problem.id} it={it} onDone={() => qc.invalidateQueries({ queryKey: ["university"] })} />)}
      </div>

      <ProjectsSection />
    </AppShell>
  );
}

type Project = {
  id: string; title: string; status: string; problem: { category: string };
  outcomes: { type: string; title: string }[];
  milestones: { id: string; title: string; status: string }[];
};

function ProjectsSection() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["university", "projects"], queryFn: () => j("/api/university/projects").then((d) => d.items as Project[]) });
  if (!q.data?.length) return null;
  return (
    <div className="mt-8">
      <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight"><Rocket className="h-5 w-5 text-primary" /> Your projects</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {q.data.map((p) => <ProjectCard key={p.id} p={p} onDone={() => qc.invalidateQueries({ queryKey: ["university", "projects"] })} />)}
      </div>
    </div>
  );
}

function ProjectCard({ p, onDone }: { p: Project; onDone: () => void }) {
  const [type, setType] = useState<string>("PATENT");
  const [title, setTitle] = useState("");
  const record = useMutation({
    mutationFn: () => j("/api/outcomes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ projectId: p.id, type, title }) }),
    onSuccess: () => { setTitle(""); onDone(); },
  });
  const complete = useMutation({
    mutationFn: () => j("/api/projects/complete", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ projectId: p.id }) }),
    onSuccess: onDone,
  });
  const [msTitle, setMsTitle] = useState("");
  const addMs = useMutation({
    mutationFn: () => j("/api/milestones", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ projectId: p.id, title: msTitle }) }),
    onSuccess: () => { setMsTitle(""); onDone(); },
  });
  const toggleMs = useMutation({
    mutationFn: (id: string) => j("/api/milestones/toggle", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ milestoneId: id }) }),
    onSuccess: onDone,
  });
  const deployed = p.status === "DEPLOYED" || p.status === "CLOSED";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold">{p.title}</p>
          <Badge variant={deployed ? "success" : "warning"}>{p.status.replace(/_/g, " ")}</Badge>
        </div>
        <div className="mt-1"><CategoryBadge category={p.problem.category} /></div>

        {/* Milestones */}
        <div className="mt-3">
          {p.milestones.map((m) => (
            <button key={m.id} type="button" onClick={() => toggleMs.mutate(m.id)}
              className="flex w-full items-center gap-2 py-0.5 text-left text-sm">
              <span className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 ${m.status === "DONE" ? "border-secondary bg-secondary" : m.status === "IN_PROGRESS" ? "border-accent bg-accent/50" : "border-muted-foreground/40"}`} />
              <span className={m.status === "DONE" ? "text-muted-foreground line-through" : ""}>{m.title}</span>
            </button>
          ))}
          {!deployed && (
            <div className="mt-1.5 flex gap-2">
              <input className="h-8 flex-1 rounded-lg border border-input bg-background px-2 text-xs" placeholder="Add a milestone…" value={msTitle} onChange={(e) => setMsTitle(e.target.value)} />
              <Button size="sm" variant="outline" disabled={addMs.isPending || msTitle.length < 2} onClick={() => addMs.mutate()}>Add</Button>
            </div>
          )}
        </div>

        {p.outcomes.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1">
            {p.outcomes.map((o, i) => (
              <li key={i} className="flex items-center gap-1.5 text-xs text-secondary">
                <Award className="h-3.5 w-3.5" /> {o.type.replace(/_/g, " ")}: {o.title}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select className="h-9 rounded-lg border border-input bg-background px-2 text-sm" value={type} onChange={(e) => setType(e.target.value)}>
            {OUTCOME_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
          </select>
          <input className="h-9 flex-1 rounded-lg border border-input bg-background px-2 text-sm" placeholder="Outcome title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Button size="sm" variant="outline" disabled={record.isPending || title.length < 2} onClick={() => record.mutate()}>Add</Button>
        </div>
        {!deployed && (
          <Button size="sm" className="mt-2" disabled={complete.isPending} onClick={() => complete.mutate()}>
            {complete.isPending ? "…" : "Mark deployed & resolve"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function InboxCard({ it, onDone }: { it: InboxItem; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [approach, setApproach] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const p = it.problem;

  const propose = useMutation({
    mutationFn: () => j("/api/proposals", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ problemId: p.id, title: p.title, description: `Solution proposal for: ${p.title}`, approach }),
    }),
    onSuccess: () => { setOpen(false); setErr(null); onDone(); },
    onError: (e: Error) => setErr(e.message),
  });

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold">{p.title}</p>
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
          </div>
          <StatusBadge status={p.status} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <CategoryBadge category={p.category} />
          {p.cluster && p.cluster.size > 1 && <ClusterBadge size={p.cluster.size} />}
          <Badge variant="warning">priority {p.priorityScore}</Badge>
          {p.district && <span className="text-xs text-muted-foreground">{p.district}</span>}
        </div>
        {it.reason && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Matched on {it.reason} · {Math.round(it.matchScore * 100)}%
          </p>
        )}

        <div className="mt-3">
          {p.project ? (
            <Badge variant="success">Project started · {p.project.status.replace(/_/g, " ")}</Badge>
          ) : p.proposal ? (
            <Badge variant="secondary">Proposal {p.proposal.status.toLowerCase()}</Badge>
          ) : open ? (
            <div className="flex flex-col gap-2">
              <textarea className={textarea} placeholder="Your team's approach to solving this…" value={approach} onChange={(e) => setApproach(e.target.value)} />
              {err && <p className="text-xs text-destructive">{err}</p>}
              <div className="flex gap-2">
                <Button size="sm" disabled={propose.isPending || approach.length < 10} onClick={() => propose.mutate()}>
                  {propose.isPending ? "Submitting…" : "Submit proposal"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button size="sm" onClick={() => setOpen(true)}>Propose a solution</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewSection() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["university", "proposals"], queryFn: () => j("/api/university/proposals").then((d) => d.items as Review[]) });
  const review = useMutation({
    mutationFn: (v: { proposalId: string; decision: "APPROVED" | "REJECTED" }) =>
      j("/api/proposals/review", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(v) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["university"] }),
  });

  if (!q.data?.length) return null;
  return (
    <Card className="mb-6 border-accent/30 bg-accent/5">
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <FileCheck2 className="h-5 w-5 text-accent" />
        <CardTitle className="text-base">Proposals awaiting your review ({q.data.length})</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {q.data.map((r) => (
          <div key={r.id} className="rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-semibold">{r.problem.title}</p>
              <CategoryBadge category={r.problem.category} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground"><b className="text-foreground">Approach:</b> {r.approach}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" disabled={review.isPending} onClick={() => review.mutate({ proposalId: r.id, decision: "APPROVED" })}>
                <Check className="mr-1 h-3.5 w-3.5" /> Approve &amp; start
              </Button>
              <Button size="sm" variant="outline" disabled={review.isPending} onClick={() => review.mutate({ proposalId: r.id, decision: "REJECTED" })}>
                <X className="mr-1 h-3.5 w-3.5" /> Reject
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
