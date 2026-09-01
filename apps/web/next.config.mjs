import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load the single root .env so the whole monorepo shares one env file.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../../.env") });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Transpile workspace packages (they ship TS/TSX source, no build step).
  transpilePackages: ["@repo/ui", "@repo/types", "@repo/db"],
  eslint: { ignoreDuringBuilds: false },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
