"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Button, Card, CardContent, CardHeader, CardTitle, CategoryBadge, StatusBadge, ClusterBadge } from "@repo/ui";
import { Category, Severity, CreateProblemInput, type ProblemStatus, type AiProcessRes } from "@repo/types";
import { Sparkles, CheckCircle2, Users, ImagePlus, X, LocateFixed } from "lucide-react";

const LocationPicker = dynamic(() => import("@/components/location-picker"), {
  ssr: false,
  loading: () => <div className="h-[220px] w-full animate-pulse rounded-xl bg-muted" />,
});

const CATEGORIES = Category.options;
const SEVERITIES = Severity.options;
const EMPTY = { title: "", description: "", category: "", severity: "MEDIUM", district: "", address: "" };

type MyProblem = {
  id: string; title: string; description: string; category: string; status: ProblemStatus;
  severity: string; district: string | null; priorityScore: number; clusterId: string | null; createdAt: string;
  cluster: { id: string; size: number; title: string } | null;
  assignment: { reason: string | null; matchScore: number; university: { name: string } } | null;
};

async function fetchMine(): Promise<MyProblem[]> {
  const r = await fetch("/api/problems/mine");
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return j.data.items;
}

const inputCls =
  "h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function CitizenHome() {
  const qc = useQueryClient();
  const mine = useQuery({ queryKey: ["problems", "mine"], queryFn: fetchMine });
  const [form, setForm] = useState(EMPTY);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ ai: AiProcessRes | null } | null>(null);
  const [media, setMedia] = useState<{ type: "IMAGE" | "VIDEO" | "DOC"; url: string }[]>([]);
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const set = (k: keyof typeof EMPTY, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setErr(null);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const j = await (await fetch("/api/upload", { method: "POST", body: fd })).json();
        if (j.data) setMedia((m) => [...m, j.data]);
        else setErr(j.error?.message ?? "Upload failed");
      }
    } finally {
      setUploading(false);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) return setErr("Geolocation not available");
    navigator.geolocation.getCurrentPosition(
      (pos) => setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setErr("Couldn't get your location — tap the map to drop a pin"),
    );
  }

  const submit = useMutation({
    mutationFn: async () => {
      const parsed = CreateProblemInput.safeParse({
        title: form.title,
        description: form.description,
        category: form.category || undefined,
        severity: form.severity,
        district: form.district || undefined,
        address: form.address || undefined,
        latitude: loc?.lat,
        longitude: loc?.lng,
        mediaUrls: media,
      });
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
      const r = await fetch("/api/problems", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const j = await r.json();
      if (j.error) throw new Error(j.error.message);
      return j.data as { ai: AiProcessRes | null };
    },
    onSuccess: (data) => {
      setResult(data);
      setErr(null);
      setForm(EMPTY);
      setMedia([]);
      setLoc(null);
      qc.invalidateQueries({ queryKey: ["problems", "mine"] });
    },
    onError: (e: Error) => setErr(e.message),
  });

  return (
    <AppShell title="Citizen">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* ── Report form ── */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Report a problem</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Describe a local issue. AI groups duplicates and routes it to the right expert.
          </p>

          <form
            className="mt-5 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              submit.mutate();
            }}
          >
            <Field label="Title">
              <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. No water supply in Ranchi ward 4" required />
            </Field>
            <Field label="Description">
              <textarea className={inputCls + " h-24 py-2.5"} value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="What is happening, since when, who is affected?" required />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
                  <option value="">✨ Auto-detect</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                </select>
              </Field>
              <Field label="Severity">
                <select className={inputCls} value={form.severity} onChange={(e) => set("severity", e.target.value)}>
                  {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="District"><input className={inputCls} value={form.district}
                onChange={(e) => set("district", e.target.value)} placeholder="Ranchi" /></Field>
              <Field label="Address / landmark"><input className={inputCls} value={form.address}
                onChange={(e) => set("address", e.target.value)} placeholder="Near ..." /></Field>
            </div>
            {/* Photo evidence */}
            <div>
              <span className="mb-1.5 block text-sm font-semibold">Photo evidence</span>
              <div className="flex flex-wrap items-center gap-2">
                {media.map((m, i) => (
                  <div key={m.url} className="relative h-16 w-16 overflow-hidden rounded-lg border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt="evidence" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => setMedia((x) => x.filter((_, j) => j !== i))}
                      className="absolute right-0.5 top-0.5 rounded bg-black/60 p-0.5 text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground hover:text-foreground">
                  <ImagePlus className="h-5 w-5" />
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden"
                    onChange={(e) => onFiles(e.target.files)} />
                </label>
                {uploading && <span className="text-xs text-muted-foreground">Uploading…</span>}
              </div>
            </div>

            {/* Location */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-semibold">Location</span>
                <button type="button" onClick={useMyLocation}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                  <LocateFixed className="h-3.5 w-3.5" /> Use my location
                </button>
              </div>
              <LocationPicker value={loc} onChange={setLoc} />
              <p className="mt-1 text-xs text-muted-foreground">
                {loc ? `Pinned at ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` : "Tap the map to drop a pin."}
              </p>
            </div>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <Button type="submit" size="lg" disabled={submit.isPending}>
              {submit.isPending ? "Submitting…" : "Submit report"}
            </Button>
          </form>

          {result && <AiResultCard ai={result.ai} />}
        </div>

        {/* ── My reports ── */}
        <div>
          <h2 className="text-lg font-bold tracking-tight">My reports</h2>
          <div className="mt-4 flex flex-col gap-3">
            {mine.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {mine.isError && <p className="text-sm text-destructive">Couldn&apos;t load your reports.</p>}
            {mine.data?.length === 0 && (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No reports yet. Submit your first one on the left.
              </p>
            )}
            {mine.data?.map((p) => <ReportRow key={p.id} p={p} />)}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

function AiResultCard({ ai }: { ai: AiProcessRes | null }) {
  return (
    <Card className="mt-5 border-primary/30 bg-primary/5">
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <CheckCircle2 className="h-5 w-5 text-secondary" />
        <CardTitle className="text-base">Report submitted</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        {!ai ? (
          <p className="text-muted-foreground">Saved. The AI engine will group and route it shortly.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {ai.isDuplicate && ai.clusterSize > 1 && (
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Matches <b>{ai.clusterSize - 1}</b> similar report{ai.clusterSize - 1 === 1 ? "" : "s"} — merged into one priority cluster.
              </li>
            )}
            {ai.assignment && (
              <li className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
                <span>Auto-routed to a matched expert — <i>{ai.assignment.reason}</i>{" "}
                  <span className="text-muted-foreground">({Math.round(ai.assignment.matchScore * 100)}% match)</span>
                </span>
              </li>
            )}
            <li className="text-muted-foreground">Priority score: <b className="text-foreground">{ai.priorityScore}</b></li>
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function ReportRow({ p }: { p: MyProblem }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold">{p.title}</p>
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
          </div>
          <StatusBadge status={p.status} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <CategoryBadge category={p.category} />
          {p.cluster && p.cluster.size > 1 && <ClusterBadge size={p.cluster.size} />}
          {p.priorityScore > 0 && (
            <span className="text-xs text-muted-foreground">priority {p.priorityScore}</span>
          )}
          <span className="ml-auto text-xs text-muted-foreground">
            {new Date(p.createdAt).toLocaleDateString()}
          </span>
        </div>
        {p.assignment && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-secondary">
            <Sparkles className="h-3.5 w-3.5" />
            Routed to {p.assignment.university.name} — {p.assignment.reason}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
