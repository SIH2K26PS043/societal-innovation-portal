import { AppShell, ModulePlaceholder } from "@/components/app-shell";

export default function CitizenHome() {
  return (
    <AppShell title="Citizen">
      <ModulePlaceholder owner="M2 — Citizen" reqs="C1 C2 C3 C4">
        <h1 className="text-2xl font-bold">Report a problem</h1>
        <p className="mt-2 text-muted-foreground">
          Submission form, photo/video + map pin (GPS), local language, and “my submissions” tracking.
        </p>
      </ModulePlaceholder>
    </AppShell>
  );
}
