import Link from "next/link";
import { buttonVariants, Card, CardContent } from "@repo/ui";

const WINS = [
  { tag: "A2", title: "Dedup & clustering", body: "300 reports of one pipeline become a single priority: reported by 300 citizens." },
  { tag: "A3", title: "Expertise matching", body: "A water problem routes to the professor who researches water — not a dropdown." },
  { tag: "D3", title: "NEP-outcome dashboard", body: "Patents, startups, participation — what the Dept. of Higher Education measures." },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        Government of Jharkhand · Dept. of Higher &amp; Technical Education
      </p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
        Societal Innovation Portal
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        Citizens report local problems. AI merges duplicates and routes each to the right university
        expert. Universities and industry turn them into real innovation projects — measured against
        NEP&nbsp;2020.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/login" className={buttonVariants()}>Sign in</Link>
        <Link href="/register" className={buttonVariants({ variant: "outline" })}>Create account</Link>
      </div>

      <div className="mt-14 grid gap-4 sm:grid-cols-3">
        {WINS.map((w) => (
          <Card key={w.tag}>
            <CardContent className="pt-6">
              <span className="font-mono text-xs font-semibold text-accent">{w.tag}</span>
              <h3 className="mt-1 text-lg font-semibold">{w.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{w.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
