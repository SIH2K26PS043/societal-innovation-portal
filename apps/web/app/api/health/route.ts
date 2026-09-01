import { ok } from "@repo/types";

export async function GET() {
  return Response.json(ok({ status: "ok", service: "web", time: new Date().toISOString() }));
}
