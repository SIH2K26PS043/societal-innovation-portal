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
