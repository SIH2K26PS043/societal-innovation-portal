// The ONLY place the web app talks to the Python AI service (apps/ai).
// Everything degrades gracefully: if the AI service is down, calls return null and
// the caller falls back (X4 demo safety) instead of crashing the request.
import { env } from "./env";
import type { AiCategorizeRes, AiProcessRes, AiMatch } from "@repo/types";

async function call<T>(path: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(`${env.AI_SERVICE_URL}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-ai-key": env.AI_SERVICE_KEY },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const json = (await res.json()) as { data: T | null; error: unknown };
    if (!res.ok || json.error || json.data == null) return null;
    return json.data;
  } catch (e) {
    console.warn(`[ai-client] ${path} unreachable:`, (e as Error).message);
    return null;
  }
}

export const ai = {
  categorize: (title: string, description: string) =>
    call<AiCategorizeRes>("/categorize", { title, description }),

  process: (input: { problemId: string; title: string; description: string; category?: string }) =>
    call<AiProcessRes>("/process", input),

  matchUniversity: (problemId: string) =>
    call<{ matches: AiMatch[] }>("/match/university", { problemId }),

  matchIndustry: (problemId: string) =>
    call<{ matches: AiMatch[] }>("/match/industry", { problemId }),
};
