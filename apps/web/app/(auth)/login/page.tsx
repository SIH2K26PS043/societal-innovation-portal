"use client";
import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@repo/ui";

const HOME: Record<string, string> = {
  CITIZEN: "/citizen", STUDENT: "/university", FACULTY: "/university",
  UNIVERSITY_ADMIN: "/university", INDUSTRY: "/industry", GOVERNMENT: "/gov", ADMIN: "/admin",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("gov@demo.in");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }
    const session = await fetch("/api/auth/session").then((r) => r.json());
    router.push(HOME[session?.user?.role] ?? "/");
  }

  return (
    <main className="flex min-h-screen bg-background text-foreground">
      {/* brand panel */}
      <div className="relative hidden w-[46%] flex-col bg-slate-900 p-14 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary" />
          <span className="font-bold">Innovation Portal</span>
        </div>
        <div className="mt-auto">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent">
            Government of Jharkhand
          </p>
          <h1 className="mt-4 max-w-md text-4xl font-extrabold leading-[1.1] tracking-tight">
            Turn community problems into university innovation.
          </h1>
          <p className="mt-4 max-w-sm leading-relaxed text-white/70">
            Report, understand, route to the right expert, solve, and measure — the NEP 2020 way.
          </p>
        </div>
        <div className="mt-11 font-mono text-xs text-white/50">SIH26043</div>
      </div>

      {/* form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-extrabold tracking-tight">Sign in</h2>
          <p className="mt-2 text-sm text-muted-foreground">Welcome back. Choose your role&apos;s account.</p>

          <form onSubmit={onSubmit} className="mt-7 flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" size="lg" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
          </form>

          <div className="mt-5 rounded-lg bg-muted p-3.5 text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Demo accounts</span> (password: password)
            <br />citizen@demo.in · gov@demo.in · industry@demo.in · admin@demo.in
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            No account? <Link href="/register" className="font-semibold text-primary underline">Create one</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
