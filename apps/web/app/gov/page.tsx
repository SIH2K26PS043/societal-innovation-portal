"use client";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CategoryBadge, categoryColor } from "@repo/ui";
import type { AnalyticsSummary, NepImpact, CategoryCount } from "@repo/types";
import type { MapPoint } from "@/components/problems-map";
import { FileText, CheckCircle2, Building2, Rocket, Award, GraduationCap, FlaskConical, Users } from "lucide-react";

const ProblemsMap = dynamic(() => import("@/components/problems-map"), {
  ssr: false,
  loading: () => <div className="h-[320px] w-full animate-pulse rounded-xl bg-muted" />,
});

type Overview = {
  summary: AnalyticsSummary;
  nep: NepImpact;
  categories: CategoryCount[];
  topClusters: { id: string; title: string; category: string; size: number }[];
  points: MapPoint[];
};

async function fetchOverview(): Promise<Overview> {
  const r = await fetch("/api/gov/overview");
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return j.data;
}

export default function GovDashboard() {
  const q = useQuery({ queryKey: ["gov", "overview"], queryFn: fetchOverview });

  return (
    <AppShell title="Government">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Innovation outcomes dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live NEP-2020 impact across problems, universities and industry — Dept. of Higher &amp; Technical Education.
          </p>
        </div>
      </div>

      {q.isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading dashboard…</p>}
      {q.isError && <p className="mt-8 text-sm text-destructive">Couldn&apos;t load the dashboard.</p>}

      {q.data && (
        <div className="mt-6 flex flex-col gap-6">
          {/* KPI row */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat icon={FileText} label="Problems reported" value={q.data.summary.totalProblems} />
            <Stat icon={CheckCircle2} label="Resolved" value={q.data.summary.resolved} tint="text-secondary" />
            <Stat icon={Building2} label="Universities engaged" value={q.data.summary.universitiesEngaged} />
            <Stat icon={Rocket} label="Active projects" value={q.data.summary.activeProjects} />
          </div>

          {/* NEP impact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">NEP-2020 outcomes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                <Mini icon={Award} label="Patents" value={q.data.nep.patents} />
                <Mini icon={Rocket} label="Startups" value={q.data.nep.startups} />
                <Mini icon={FlaskConical} label="IP transfers" value={q.data.nep.ipTransfers} />
                <Mini icon={FileText} label="Publications" value={q.data.nep.publications} />
                <Mini icon={GraduationCap} label="Students engaged" value={q.data.nep.studentsEngaged} />
                <Mini icon={CheckCircle2} label="Completion" value={`${Math.round(q.data.nep.completionRate * 100)}%`} />
              </div>
            </CardContent>
          </Card>

          {q.data.points.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Where problems are reported</CardTitle></CardHeader>
              <CardContent><ProblemsMap points={q.data.points} /></CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Category distribution */}
            <Card>
              <CardHeader><CardTitle className="text-base">Problems by category</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-2.5">
                {q.data.categories.length === 0 && <Empty>No problems yet.</Empty>}
                {q.data.categories.map((c) => {
                  const max = q.data!.categories[0]?.count || 1;
                  return (
                    <div key={c.category} className="flex items-center gap-3">
                      <span className="w-32 shrink-0 text-xs font-medium">{c.category.replace(/_/g, " ")}</span>
                      <div className="h-4 flex-1 overflow-hidden rounded bg-muted">
                        <div className="h-full rounded" style={{ width: `${(c.count / max) * 100}%`, backgroundColor: categoryColor(c.category) }} />
                      </div>
                      <span className="w-6 text-right text-xs tabular-nums text-muted-foreground">{c.count}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Top clusters / hotspots */}
            <Card>
              <CardHeader><CardTitle className="text-base">Top problem clusters</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-2.5">
                {q.data.topClusters.length === 0 && <Empty>No clusters yet — run the AI backfill.</Empty>}
                {q.data.topClusters.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                      {c.size}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{c.title}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" /> reported by {c.size} citizen{c.size === 1 ? "" : "s"}
                      </p>
                    </div>
                    <CategoryBadge category={c.category} />
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

function Mini({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) {
  return (
    <div className="rounded-lg border p-3">
      <Icon className="h-4 w-4 text-secondary" />
      <p className="mt-2 text-xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">{children}</p>;
}
