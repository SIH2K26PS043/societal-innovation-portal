"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@repo/ui";
import type { ReactNode } from "react";

function NotificationBell() {
  const { data } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      return (json?.data?.unread as number) ?? 0;
    },
    staleTime: 30_000,
  });
  const unread = data ?? 0;
  return (
    <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border text-muted-foreground hover:text-foreground" aria-label="Notifications">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
      {unread > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );
}

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const { data } = useSession();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-secondary" />
            <span className="font-bold tracking-tight">Innovation Portal</span>
          </Link>
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{title}</span>
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />
            {data?.user && (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {data.user.name} · {data.user.role}
              </span>
            )}
            <Button size="sm" variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
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
