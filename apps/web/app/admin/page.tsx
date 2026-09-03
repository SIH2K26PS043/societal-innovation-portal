"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, Badge, CategoryBadge, StatusBadge } from "@repo/ui";
import { Role } from "@repo/types";
import { Users, FileText, Layers, Rocket, CheckCircle2, Cpu, Ban, RotateCcw } from "lucide-react";

const ROLES = Role.options;

type Overview = {
  counts: { users: number; problems: number; clusters: number; projects: number; resolved: number };
  roleBreakdown: { role: string; count: number }[];
  ai: { healthy: boolean; modelLoaded: boolean };
  recentUsers: { id: string; name: string; email: string; role: string; university: { name: string } | null }[];
  recentProblems: { id: string; title: string; status: string; category: string; createdAt: string }[];
};

const j = async (url: string, init?: RequestInit) => {
  const r = await fetch(url, init);
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return d.data;
};

export default function AdminDashboard() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "overview"], queryFn: () => j("/api/admin/overview") as Promise<Overview> });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "overview"] });

  const setRole = useMutation({
    mutationFn: (v: { userId: string; role: string }) =>
      j("/api/admin/user-role", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(v) }),
    onSuccess: invalidate,
  });
  const moderate = useMutation({
    mutationFn: (v: { problemId: string; action: "reject" | "restore" }) =>
      j("/api/admin/moderate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(v) }),
    onSuccess: invalidate,
  });

  return (
    <AppShell title="Admin">
      <h1 className="text-2xl font-extrabold tracking-tight">Platform administration</h1>
      <p className="mt-1 text-sm text-muted-foreground">System health, user roles and report moderation.</p>

      {q.isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading…</p>}
      {q.isError && <p className="mt-8 text-sm text-destructive">Couldn&apos;t load admin data.</p>}

      {q.data && (
        <div className="mt-6 flex flex-col gap-6">
          {/* AI service status */}
          <div className={`flex items-center gap-3 rounded-xl border p-4 ${q.data.ai.healthy ? "border-secondary/30 bg-secondary/5" : "border-destructive/30 bg-destructive/5"}`}>
            <Cpu className={`h-5 w-5 ${q.data.ai.healthy ? "text-secondary" : "text-destructive"}`} />
            <div className="text-sm">
              <span className="font-semibold">AI service: {q.data.ai.healthy ? "online" : "unreachable"}</span>
              {q.data.ai.healthy && (
                <span className="text-muted-foreground"> · model {q.data.ai.modelLoaded ? "loaded" : "warming up"}</span>
              )}
            </div>
            <span className={`ml-auto h-2.5 w-2.5 rounded-full ${q.data.ai.healthy ? "bg-secondary" : "bg-destructive"}`} />
          </div>

          {/* stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <Stat icon={Users} label="Users" value={q.data.counts.users} />
            <Stat icon={FileText} label="Problems" value={q.data.counts.problems} />
            <Stat icon={Layers} label="Clusters" value={q.data.counts.clusters} />
            <Stat icon={Rocket} label="Projects" value={q.data.counts.projects} />
            <Stat icon={CheckCircle2} label="Resolved" value={q.data.counts.resolved} tint="text-secondary" />
          </div>

          {/* role breakdown */}
          <div className="flex flex-wrap gap-2">
            {q.data.roleBreakdown.map((r) => (
              <Badge key={r.role} variant="secondary">{r.role.replace(/_/g, " ")}: {r.count}</Badge>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* users + role management */}
            <Card>
              <CardHeader><CardTitle className="text-base">Users &amp; roles</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-2">
                {q.data.recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{u.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{u.email}{u.university ? ` · ${u.university.name}` : ""}</p>
                    </div>
                    <select className="h-8 rounded-lg border border-input bg-background px-2 text-xs"
                      value={u.role} disabled={setRole.isPending}
                      onChange={(e) => setRole.mutate({ userId: u.id, role: e.target.value })}>
                      {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* moderation queue */}
            <Card>
              <CardHeader><CardTitle className="text-base">Recent reports · moderation</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-2">
                {q.data.recentProblems.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{p.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <CategoryBadge category={p.category} />
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                    {p.status === "REJECTED" ? (
                      <button className="inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                        disabled={moderate.isPending} onClick={() => moderate.mutate({ problemId: p.id, action: "restore" })}>
                        <RotateCcw className="h-3.5 w-3.5" /> Restore
                      </button>
                    ) : (
                      <button className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10"
                        disabled={moderate.isPending} onClick={() => moderate.mutate({ problemId: p.id, action: "reject" })}>
                        <Ban className="h-3.5 w-3.5" /> Reject
                      </button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value, tint }: { icon: any; label: string; value: number; tint?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <Icon className={`h-5 w-5 ${tint ?? "text-primary"}`} />
        <p className="mt-3 text-3xl font-extrabold tracking-tight">{value}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
