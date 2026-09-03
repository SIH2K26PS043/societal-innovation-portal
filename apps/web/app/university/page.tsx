"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Button, Card, CardContent, Badge, CategoryBadge, StatusBadge, ClusterBadge } from "@repo/ui";
import { Sparkles, Inbox } from "lucide-react";

type InboxItem = {
  matchScore: number;
  reason: string | null;
  problem: {
    id: string; title: string; description: string; category: string; priorityScore: number;
    status: string; district: string | null;
    cluster: { size: number } | null;
    project: { id: string; status: string } | null;
  };
};

async function fetchInbox(): Promise<InboxItem[]> {
  const r = await fetch("/api/university/inbox");
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return j.data.items;
}

export default function UniversityHome() {
  const qc = useQueryClient();
  const inbox = useQuery({ queryKey: ["university", "inbox"], queryFn: fetchInbox });

  const accept = useMutation({
    mutationFn: async (problemId: string) => {
      const r = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ problemId }),
      });
      const j = await r.json();
      if (j.error) throw new Error(j.error.message);
      return j.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["university", "inbox"] }),
  });

  return (
    <AppShell title="University">
      <h1 className="text-2xl font-extrabold tracking-tight">Routed to your university</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Problems the AI matched to your institution&apos;s expertise — highest priority first. Accept one to start a project.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {inbox.isLoading && <p className="text-sm text-muted-foreground">Loading inbox…</p>}
        {inbox.isError && <p className="text-sm text-destructive">Couldn&apos;t load your inbox.</p>}
        {inbox.data?.length === 0 && (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Nothing routed yet. As citizens report problems, matched ones land here.
            </p>
          </div>
        )}
        {inbox.data?.map((it) => (
          <Card key={it.problem.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{it.problem.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{it.problem.description}</p>
                </div>
                <StatusBadge status={it.problem.status} />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <CategoryBadge category={it.problem.category} />
                {it.problem.cluster && it.problem.cluster.size > 1 && <ClusterBadge size={it.problem.cluster.size} />}
                <Badge variant="warning">priority {it.problem.priorityScore}</Badge>
                {it.problem.district && <span className="text-xs text-muted-foreground">{it.problem.district}</span>}
              </div>

              {it.reason && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Matched on {it.reason} · {Math.round(it.matchScore * 100)}%
                </p>
              )}

              <div className="mt-3">
                {it.problem.project ? (
                  <Badge variant="success">Project started · {it.problem.project.status.replace(/_/g, " ")}</Badge>
                ) : (
                  <Button size="sm" disabled={accept.isPending} onClick={() => accept.mutate(it.problem.id)}>
                    {accept.isPending ? "Starting…" : "Accept & start project"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
