"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@repo/ui";
import type { ReactNode } from "react";

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const { data } = useSession();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-6">
          <Link href="/" className="font-semibold tracking-tight">Innovation Portal</Link>
          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{title}</span>
          <div className="ml-auto flex items-center gap-3 text-sm">
            {data?.user && (
              <span className="hidden text-muted-foreground sm:inline">
                {data.user.name} · {data.user.role}
              </span>
            )}
            <Button size="sm" variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

/** Placeholder each module owner replaces with real screens. */
export function ModulePlaceholder({ owner, reqs, children }: { owner: string; reqs: string; children: ReactNode }) {
  return (
    <div>
      {children}
      <p className="mt-4 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        Scaffold stub — owned by <b>{owner}</b>. Build here: <span className="font-mono">{reqs}</span>.
        Use <span className="font-mono">@repo/types</span> shapes and the <span className="font-mono">/api</span> contract in docs/03.
      </p>
    </div>
  );
}
