import { AppShell, ModulePlaceholder } from "@/components/app-shell";

export default function AdminHome() {
  return (
    <AppShell title="Admin">
      <ModulePlaceholder owner="M1 — Foundations" reqs="X1 X3 · moderation">
        <h1 className="text-2xl font-bold">Admin console</h1>
        <p className="mt-2 text-muted-foreground">
          Moderation, spam review (A5), manual routing overrides, and user/role management.
        </p>
      </ModulePlaceholder>
    </AppShell>
  );
}
