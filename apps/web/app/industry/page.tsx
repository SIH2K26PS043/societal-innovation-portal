import { AppShell, ModulePlaceholder } from "@/components/app-shell";

export default function IndustryHome() {
  return (
    <AppShell title="Industry">
      <ModulePlaceholder owner="M5 — Industry &amp; Lifecycle" reqs="I1 I2 I3 P1 P2 N1 N2">
        <h1 className="text-2xl font-bold">Matched opportunities</h1>
        <p className="mt-2 text-muted-foreground">
          Register, browse projects matched to your sector (I2), and offer funding / mentoring / pilots.
        </p>
      </ModulePlaceholder>
    </AppShell>
  );
}
