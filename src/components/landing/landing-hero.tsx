import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic";
import { Parallax } from "@/components/motion/parallax";
import { Reveal3D } from "@/components/motion/reveal-3d";
import { SplitHeading } from "@/components/motion/split-heading";
import { Photo } from "@/components/landing/photo";
import { ThoughtsRail } from "@/components/landing/thoughts-rail";

// Hero (peach band): serif headline with the page's ONE script word, intro, CTAs,
// and an overlapping editorial photo collage. Ends with the "thoughts" rail.
export function LandingHero() {
  return (
    <section className="band-peach relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-10 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-16 lg:pt-20">
        <div>
          <SplitHeading as="h1" immediate className="text-[2.9rem] leading-[1.02] sm:text-6xl lg:text-7xl">
            Walk into the room like you{" "}
            <span className="font-script scribble-underline whitespace-nowrap text-[1.12em] leading-none">belong</span>
          </SplitHeading>
          <Reveal3D immediate delay={0.35} tilt={6}>
            <p data-reveal className="mt-7 max-w-md text-[1.0625rem] leading-relaxed text-foreground/80 sm:text-lg">
              EaseMind is a private space for men in India dealing with the stress and self-doubt that can come with
              hair loss. Quick, CBT-based tools, a judgement-free companion, and a way to real help when you want it.
            </p>
            <div data-reveal className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Magnetic className="w-full sm:w-auto">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/start">
                    Start now <ArrowRight className="size-5" aria-hidden />
                  </Link>
                </Button>
              </Magnetic>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-foreground/25 bg-transparent backdrop-blur-none hover:bg-white/30 sm:w-auto dark:hover:bg-white/5"
              >
                <Link href="/home">I&apos;ve been here before</Link>
              </Button>
            </div>
            <p data-reveal className="mt-5 text-[13px] text-foreground/70">
              Private · free · a self-help tool — not therapy or medical care.
            </p>
          </Reveal3D>
        </div>

        <HeroCollage />
      </div>

      <ThoughtsRail />
    </section>
  );
}

const SHADOW = "shadow-[0_28px_56px_-26px_rgba(22,21,20,0.5)]";

function HeroCollage() {
  return (
    <div className="relative mx-auto aspect-[10/9] w-full max-w-[30rem] lg:max-w-none">
      <Parallax speed={0.12} className="absolute left-[2%] top-0 z-10 w-[40%]">
        <Photo
          src="/images/hero-1.jpg"
          alt="A young man smiling as he talks with a friend"
          sizes="(min-width: 1024px) 240px, 40vw"
          priority
          className={`aspect-[3/4] w-full ${SHADOW}`}
        />
      </Parallax>
      <Parallax speed={0.22} className="absolute right-[2%] top-[9%] z-0 w-[44%]">
        <Photo
          src="/images/hero-2.jpg"
          alt="A man relaxing outdoors in warm light"
          sizes="(min-width: 1024px) 260px, 44vw"
          priority
          className={`aspect-[3/4] w-full ${SHADOW}`}
        />
      </Parallax>
      <Parallax speed={0.05} className="absolute bottom-0 left-[24%] z-20 w-[48%]">
        <Photo
          src="/images/hero-3.jpg"
          alt="A man at ease, looking ahead"
          sizes="(min-width: 1024px) 280px, 48vw"
          priority
          className={`aspect-[4/3] w-full ${SHADOW}`}
        />
      </Parallax>
    </div>
  );
}
