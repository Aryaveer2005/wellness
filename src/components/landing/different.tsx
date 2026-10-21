import { Brain, Heart, Lifebuoy, LockSimple, Timer } from "@/components/icons";
import { Reveal3D } from "@/components/motion/reveal-3d";
import { SplitHeading } from "@/components/motion/split-heading";

const ITEMS = [
  {
    Icon: LockSimple,
    title: "Private by default",
    text: "Works without an account. Your entries stay on your device unless you choose to sign in.",
  },
  { Icon: Timer, title: "Quick", text: "Most tools take about 60 seconds — made for real life, not long courses." },
  { Icon: Heart, title: "Judgement-free", text: "No one watching, nothing to explain. Just you and a calm space." },
  {
    Icon: Brain,
    title: "Grounded in CBT",
    text: "The reframer follows Cognitive Behavioural Therapy steps for working through a thought.",
  },
  {
    Icon: Lifebuoy,
    title: "Real help when you need it",
    text: "Crisis helplines one tap away, and a list of professionals when you want more support.",
  },
];

export function Different() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SplitHeading className="mx-auto max-w-xl text-center text-4xl sm:text-5xl">
          What makes EaseMind different
        </SplitHeading>
        <Reveal3D
          tilt={6}
          className="mt-12 grid grid-cols-1 gap-8 sm:mt-14 sm:gap-10 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:gap-6"
        >
          {ITEMS.map(({ Icon, title, text }) => (
            <div key={title} data-reveal className="flex gap-4 text-left min-[480px]:block min-[480px]:text-center">
              <span className="grid size-14 shrink-0 place-items-center rounded-full min-[480px]:mx-auto min-[480px]:size-16 bg-[color-mix(in_oklab,var(--ember)_12%,transparent)]">
                <Icon className="size-9 text-ember min-[480px]:size-11" aria-hidden />
              </span>
              <h3 className="text-[1.5rem] min-[480px]:mt-4">{title}</h3>
              <p className="mt-1.5 max-w-[15rem] text-[15px] min-[480px]:mx-auto min-[480px]:mt-2 leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </Reveal3D>
      </div>
    </section>
  );
}
