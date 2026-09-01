import { AppShell, ModulePlaceholder } from "@/components/app-shell";

export default function GovHome() {
  return (
    <AppShell title="Government">
      <ModulePlaceholder owner="M6 — Government &amp; Data Viz" reqs="D1 D2 D3">
        <h1 className="text-2xl font-bold">Impact dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Live KPIs (<span className="font-mono">/api/analytics/summary</span>), district heatmap, and the
          NEP-outcome panel — patents, startups, participation, completion rate.
        </p>
      </ModulePlaceholder>
    </AppShell>
  );
}
