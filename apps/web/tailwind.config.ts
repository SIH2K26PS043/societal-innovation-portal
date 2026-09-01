import type { Config } from "tailwindcss";
import preset from "@repo/ui/tailwind-preset";

export default {
  presets: [preset],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    // include the shared UI package so its class names are not purged:
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
} satisfies Config;
