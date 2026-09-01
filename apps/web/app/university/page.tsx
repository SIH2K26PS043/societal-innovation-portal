import { AppShell, ModulePlaceholder } from "@/components/app-shell";

export default function UniversityHome() {
  return (
    <AppShell title="University">
      <ModulePlaceholder owner="M4 — University" reqs="U1 U2 U3 U4">
        <h1 className="text-2xl font-bold">Matched problem queue</h1>
        <p className="mt-2 text-muted-foreground">
          Problems routed here by expertise (A3), team formation, proposals, and the project board.
        </p>
      </ModulePlaceholder>
    </AppShell>
  );
}
