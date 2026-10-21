import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { Reveal3D } from "@/components/motion/reveal-3d";
import { SplitHeading } from "@/components/motion/split-heading";
import { Photo } from "@/components/landing/photo";

const TOOLS = [
  {
    href: "/confidence",
    img: "/images/tool-confidence.jpg",
    alt: "A man taking a calm breath before stepping out",
    title: "60-second confidence boost",
    text: "Before a date, interview or meeting.",
  },
  {
    href: "/reframe",
    img: "/images/tool-reframe.jpg",
    alt: "A man thinking quietly by a window",
    title: "Reframe a heavy thought",
    text: "Step-by-step, the CBT way.",
  },
  {
    href: "/chat",
    img: "/images/tool-chat.jpg",
    alt: "A man typing a message on his phone",
    title: "Talk it through",
    text: "A judgement-free AI companion, any time.",
  },
  {
    href: "/psychologists",
    img: "/images/tool-psychologist.jpg",
    alt: "Two people in a calm conversation",
    title: "Find a professional",
    text: "When you want a real person to talk to.",
  },
];

export function ToolCards() {
  return (
    <section id="tools" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">Four simple tools</p>
          <SplitHeading className="mt-3 text-4xl sm:text-5xl">Your wellbeing, in your hands</SplitHeading>
        </div>
        <Reveal3D tilt={6} className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:gap-5">
          {TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              data-reveal
              className="group block rounded-[1.4rem] outline-none focus-visible:ring-3 focus-visible:ring-ring/60"
            >
              <Photo
                src={t.img}
                alt={t.alt}
                sizes="(min-width: 768px) 25vw, 48vw"
                className="aspect-[3/4.4] w-full rounded-[1.4rem]"
                imgClassName="transition-transform duration-1000 ease-[var(--ease-calm)] group-hover:scale-[1.04]"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3.5 text-white sm:p-5">
                  <div>
                    <h3 className="text-[1.3rem] leading-[1.08] lg:text-[1.65rem]">{t.title}</h3>
                    <p className="mt-1.5 hidden text-[13px] leading-snug text-white/80 lg:block">{t.text}</p>
                  </div>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-[#161514] transition-transform duration-500 group-hover:-rotate-45 sm:size-10">
                    <ArrowUpRight className="size-4 sm:size-5" aria-hidden />
                  </span>
                </div>
              </Photo>
            </Link>
          ))}
        </Reveal3D>
      </div>
    </section>
  );
}
