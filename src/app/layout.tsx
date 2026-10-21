import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Hanken_Grotesk, Caveat } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Typography — "Warm Editorial" (docs/DESIGN.md, 2026-10-21):
// • Instrument Serif — elegant editorial headlines (normal + italic accents)
// • Hanken Grotesk   — clean, friendly body and UI text
// • Caveat           — ONE handwritten accent word per page, at most
const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});
const sans = Hanken_Grotesk({ variable: "--font-grotesk", subsets: ["latin"], display: "swap" });
const script = Caveat({ variable: "--font-script", subsets: ["latin"], weight: ["500", "600"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "EaseMind — Confidence, one breath at a time", template: "%s · EaseMind" },
  description:
    "A private, judgement-free wellness app that helps men dealing with hair loss rebuild confidence and manage stress. Self-help tool — not therapy or medical care.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFCFA" },
    { media: "(prefers-color-scheme: dark)", color: "#121110" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${serif.variable} ${sans.variable} ${script.variable}`}>
      <body className="min-h-dvh antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SmoothScroll>{children}</SmoothScroll>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
