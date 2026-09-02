import Link from "next/link";
import { buttonVariants } from "@repo/ui";

const WINS = [
  {
    tag: "A2",
    title: "Dedup & clustering",
    body: "300 reports of one broken pipeline collapse into a single priority — “reported by 300 citizens.” Noise becomes signal.",
    tint: "bg-primary/10 text-primary",
    icon: (
      <>
        <circle cx="9" cy="7" r="3" /><path d="M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2" /><path d="M16 3a4 4 0 0 1 0 8" />
      </>
    ),
  },
  {
    tag: "A3",
    title: "Expertise matching",
    body: "A water problem routes to the professor who actually researches water — semantic matching, not a dropdown.",
    tint: "bg-secondary/10 text-secondary",
    icon: <><path d="M12 3l8 4v5c0 5-4 8-8 9-4-1-8-4-8-9V7z" /><path d="M9 12l2 2 4-4" /></>,
  },
  {
    tag: "D3",
    title: "NEP-outcome dashboard",
    body: "Patents, startups, participation, completion — exactly what the Dept. of Higher Education measures.",
    tint: "bg-accent/10 text-accent",
    icon: <><path d="M3 3v18h18" /><path d="M7 14l3-4 3 3 4-6" /></>,
  },
];

const STAGES = ["Report", "Understand", "Route", "Solve", "Partner", "Execute", "Measure"];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* top bar */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-secondary" />
            <span className="font-bold tracking-tight">Innovation Portal</span>
          </div>
          <nav className="ml-8 hidden gap-6 text-sm font-medium text-muted-foreground md:flex">
            <span>How it works</span><span>Universities</span><span>Industry</span><span>Government</span>
          </nav>
          <div className="ml-auto flex items-center gap-2.5">
            <Link href="/login" className={buttonVariants({ variant: "outline", size: "sm" })}>Sign in</Link>
            <Link href="/citizen" className={buttonVariants({ size: "sm" })}>Report a problem</Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pt-24">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Government of Jharkhand · Dept. of Higher &amp; Technical Education
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-6xl">
          Community problems, turned into university innovation.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Citizens report local problems. AI merges the duplicates and routes each to the right university
          expert. Universities and industry turn them into real, measured solutions — the NEP&nbsp;2020 way.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/citizen" className={buttonVariants({ size: "lg" })}>Report a problem</Link>
          <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg" })}>Sign in</Link>
        </div>

        <dl className="mt-16 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          {[["24", "districts covered"], ["5", "partner universities"], ["1 : N", "duplicates merged"], ["₹0", "built on free tools"]].map(([n, l]) => (
            <div key={l}>
              <dt className="text-3xl font-extrabold tracking-tight sm:text-4xl">{n}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{l}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* three winning features */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-5 sm:grid-cols-3">
          {WINS.map((w) => (
            <div key={w.tag} className="rounded-2xl border bg-card p-7 shadow-sm">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${w.tint}`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{w.icon}</svg>
              </div>
              <h3 className="mt-5 text-xl font-bold tracking-tight">{w.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* lifecycle strip */}
      <section className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-5">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent">The pipeline</p>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Report → understand → route → solve → measure
          </h2>
          <ol className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {STAGES.map((s, i) => (
              <li key={s} className={`rounded-xl p-4 ${i === STAGES.length - 1 ? "bg-accent" : "bg-white/5"}`}>
                <div className="font-mono text-xs text-white/60">{String(i + 1).padStart(2, "0")}</div>
                <div className="mt-1.5 font-bold">{s}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* footer */}
      <footer className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-5 py-9 text-sm text-muted-foreground">
        <span className="font-mono">SIH26043</span>
        <span>· Societal Innovation Portal · Government of Jharkhand</span>
        <span className="sm:ml-auto">Built on free &amp; open tools</span>
      </footer>
    </main>
  );
}
