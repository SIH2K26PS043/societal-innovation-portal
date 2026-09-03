"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Button, Card, CardContent, Badge, CategoryBadge } from "@repo/ui";
import { PartnerOffering } from "@repo/types";
import { Handshake, IndianRupee, Users } from "lucide-react";

const OFFERINGS = PartnerOffering.options;

type Project = {
  id: string; title: string; status: string; category: string; priorityScore: number;
  district: string | null; clusterSize: number; partnerCount: number; funding: number; joined: boolean;
};

async function fetchProjects(): Promise<{ items: Project[]; hasProfile: boolean }> {
  const r = await fetch("/api/industry/projects");
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return j.data;
}

export default function IndustryHome() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["industry", "projects"], queryFn: fetchProjects });

  return (
    <AppShell title="Industry">
      <h1 className="text-2xl font-extrabold tracking-tight">Innovation opportunities</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Active university projects, ranked by community priority. Fund, mentor or pilot the ones that fit your sector.
      </p>

      {q.data && !q.data.hasProfile && (
        <p className="mt-4 rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm">
          Complete your industry profile to start partnering.
        </p>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {q.isLoading && <p className="text-sm text-muted-foreground">Loading opportunities…</p>}
        {q.isError && <p className="text-sm text-destructive">Couldn&apos;t load opportunities.</p>}
        {q.data?.items.length === 0 && (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No active projects yet — universities will start accepting routed problems soon.
          </p>
        )}
        {q.data?.items.map((p) => <ProjectCard key={p.id} p={p} onDone={() => qc.invalidateQueries({ queryKey: ["industry", "projects"] })} />)}
      </div>
    </AppShell>
  );
}

function ProjectCard({ p, onDone }: { p: Project; onDone: () => void }) {
  const [role, setRole] = useState<string>("FUNDING");
  const [funding, setFunding] = useState("0");
  const [err, setErr] = useState<string | null>(null);

  const partner = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/partnerships", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId: p.id, role, fundingCommitted: Number(funding) || 0 }),
      });
      const j = await r.json();
      if (j.error) throw new Error(j.error.message);
      return j.data;
    },
    onSuccess: () => { setErr(null); onDone(); },
    onError: (e: Error) => setErr(e.message),
  });

  return (
    <Card>
      <CardContent className="flex h-full flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold">{p.title}</p>
          <Badge variant="warning">priority {p.priorityScore}</Badge>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          <CategoryBadge category={p.category} />
          {p.clusterSize > 1 && <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{p.clusterSize} citizens</span>}
          {p.district && <span>{p.district}</span>}
          <span className="inline-flex items-center gap-0.5"><IndianRupee className="h-3 w-3" />{p.funding.toLocaleString()} committed</span>
          <span>{p.partnerCount} partner{p.partnerCount === 1 ? "" : "s"}</span>
        </div>

        <div className="mt-auto pt-4">
          {p.joined ? (
            <Badge variant="success"><Handshake className="mr-1 h-3.5 w-3.5" /> You&apos;re partnered</Badge>
          ) : (
            <div className="flex flex-wrap items-end gap-2">
              <select className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
                value={role} onChange={(e) => setRole(e.target.value)}>
                {OFFERINGS.map((o) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
              </select>
              {role === "FUNDING" && (
                <input className="h-9 w-28 rounded-lg border border-input bg-background px-2 text-sm"
                  type="number" min={0} value={funding} onChange={(e) => setFunding(e.target.value)} placeholder="₹ amount" />
              )}
              <Button size="sm" disabled={partner.isPending} onClick={() => partner.mutate()}>
                {partner.isPending ? "…" : "Partner"}
              </Button>
            </div>
          )}
          {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
