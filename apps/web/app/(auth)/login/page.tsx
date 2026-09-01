"use client";
import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent } from "@repo/ui";

const HOME: Record<string, string> = {
  CITIZEN: "/citizen", STUDENT: "/university", FACULTY: "/university",
  UNIVERSITY_ADMIN: "/university", INDUSTRY: "/industry", GOVERNMENT: "/gov", ADMIN: "/admin",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("citizen@demo.in");
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
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <Card className="w-full">
        <CardContent className="pt-6">
          <h1 className="text-xl font-bold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Demo accounts (password <code>password</code>): citizen@demo.in · gov@demo.in · industry@demo.in
          </p>
          <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3">
            <input
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required
            />
            <input
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            No account? <Link href="/register" className="text-primary underline">Create one</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
