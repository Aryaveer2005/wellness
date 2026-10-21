import Link from "next/link";
import { ArrowRight, Lifebuoy } from "@/components/icons";
import { LandingTopBar } from "@/components/landing/landing-top-bar";
import { SplitHeading } from "@/components/motion/split-heading";
import { Reveal3D } from "@/components/motion/reveal-3d";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip">
      {/* SAFETY: the top bar keeps the "Need help now?" button visible here too */}
      <LandingTopBar />
      <main className="band-peach flex flex-1 items-center">
        <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/70">Error 404</p>
          <SplitHeading as="h1" immediate className="mt-4 text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-7xl">
            This page took a <span className="italic">wrong turn.</span>
          </SplitHeading>
          <Reveal3D immediate delay={0.3} tilt={6}>
            <p data-reveal className="mt-6 max-w-md text-[1.0625rem] leading-relaxed text-foreground/80 sm:text-lg">
              No stress — take a breath. The link may be old, or the page may have moved. Everything you need is one
              tap away.
            </p>
            <div data-reveal className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/">
                  Back to EaseMind <ArrowRight className="size-5" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-foreground/25 bg-transparent backdrop-blur-none sm:w-auto"
              >
                <Link href="/home">Go to my home</Link>
              </Button>
            </div>
            <p data-reveal className="mt-8 text-[15px] text-foreground/80">
              Need to talk to someone right now?{" "}
              <Link href="/help" className="inline-flex items-center gap-1 font-semibold text-crisis underline underline-offset-4">
                <Lifebuoy className="size-4" aria-hidden /> Crisis helplines
              </Link>
            </p>
          </Reveal3D>
        </div>
      </main>
    </div>
  );
}
