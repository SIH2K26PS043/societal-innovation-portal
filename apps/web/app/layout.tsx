import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@repo/ui/styles.css";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Societal Innovation Portal",
  description:
    "Crowdsource societal challenges into university innovation projects with industry partnership — Government of Jharkhand (SIH26043).",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = { themeColor: "#0b3d91" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
