"use client";
import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent } from "@repo/ui";

const ROLES = ["CITIZEN", "STUDENT", "FACULTY", "UNIVERSITY_ADMIN", "INDUSTRY", "GOVERNMENT"] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CITIZEN" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (json.error) {
      setError(json.error.message);
      setLoading(false);
      return;
    }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <Card className="w-full">
        <CardContent className="pt-6">
          <h1 className="text-xl font-bold">Create account</h1>
          <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3">
            <input className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              placeholder="Full name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            <input className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              type="email" placeholder="Email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
            <input className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              type="password" placeholder="Password (min 6)" value={form.password} onChange={(e) => set("password", e.target.value)} required />
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={form.role} onChange={(e) => set("role", e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
            </select>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
