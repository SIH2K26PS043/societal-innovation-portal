// Central env access. Never read process.env ad hoc elsewhere — import from here.
function opt(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}
function req(name: string): string {
  const v = process.env[name];
  if (!v && process.env.NODE_ENV === "production") {
    // Warn (don't crash the build); runtime code guards where needed.
    console.warn(`[env] Missing required env var: ${name}`);
  }
  return v ?? "";
}

export const env = {
  DATABASE_URL: req("DATABASE_URL"),
  NEXTAUTH_SECRET: req("NEXTAUTH_SECRET"),
  NEXTAUTH_URL: opt("NEXTAUTH_URL", "http://localhost:3000"),
  AI_SERVICE_URL: opt("AI_SERVICE_URL", "http://localhost:8000"),
  AI_SERVICE_KEY: opt("AI_SERVICE_KEY", "dev"),
  SUPABASE_URL: opt("SUPABASE_URL"),
  SUPABASE_SERVICE_ROLE_KEY: opt("SUPABASE_SERVICE_ROLE_KEY"),
  STORAGE_BUCKET: opt("STORAGE_BUCKET", "evidence"),
};
