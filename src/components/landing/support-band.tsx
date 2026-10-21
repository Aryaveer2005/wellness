import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Parallax } from "@/components/motion/parallax";
import { Reveal3D } from "@/components/motion/reveal-3d";
import { SplitHeading } from "@/components/motion/split-heading";
import { Photo } from "@/components/landing/photo";

// Blush band → /psychologists. Copy describes the real feature (PROJECT_SPEC.md §3); no invented names or numbers.
export function SupportBand() {
  return (
    <section className="band-blush overflow-hidden py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-[1fr_1.15fr] lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">When you want more support</p>
          <SplitHeading className="mt-3 text-4xl sm:text-5xl">Talk to a professional</SplitHeading>
          <Reveal3D tilt={6}>
            <p data-reveal className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-muted-foreground">
              Self-help is a good start, and sometimes it helps to talk to someone trained. See the top 5
              psychiatrists near you, ranked by real reviews — then reach out in your own time.
            </p>
            <div data-reveal className="mt-8">
              <Button asChild size="lg">
                <Link href="/psychologists">
                  Find a professional <ArrowRight className="size-5" aria-hidden />
                </Link>
              </Button>
            </div>
          </Reveal3D>
        </div>
        <Parallax speed={0.1}>
          <Photo
            src="/images/band-support.jpg"
            alt="Friends sitting together and talking outdoors"
            sizes="(min-width: 768px) 560px, 100vw"
            className="aspect-[4/3] w-full rounded-[1.75rem] shadow-[0_30px_60px_-30px_rgba(22,21,20,0.45)]"
          />
        </Parallax>
      </div>
    </section>
  );
}
