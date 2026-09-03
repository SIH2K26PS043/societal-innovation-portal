import { requireAuth } from "@/lib/auth";
import { route, errors } from "@/lib/api";
import { env } from "@/lib/env";
import { ok } from "@repo/types";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

// POST /api/upload — multipart photo → Supabase Storage `evidence` bucket → public URL (C2).
// Uses the service-role key server-side (bypasses RLS); no client SDK needed.
export async function POST(req: Request) {
  return route(async () => {
    const session = await requireAuth();
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) throw errors.conflict("Storage is not configured");

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw errors.validation("No file provided");
    if (!ALLOWED.includes(file.type)) throw errors.validation("Only JPEG, PNG or WebP images are allowed");
    if (file.size > MAX_BYTES) throw errors.validation("Image must be 5 MB or smaller");

    const ext = file.type.split("/")[1];
    const path = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const res = await fetch(`${env.SUPABASE_URL}/storage/v1/object/${env.STORAGE_BUCKET}/${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "content-type": file.type,
        "x-upsert": "true",
      },
      body: Buffer.from(await file.arrayBuffer()),
    });
    if (!res.ok) throw errors.conflict(`Upload failed (${res.status})`);

    const url = `${env.SUPABASE_URL}/storage/v1/object/public/${env.STORAGE_BUCKET}/${path}`;
    return Response.json(ok({ url, type: "IMAGE" as const }));
  });
}
