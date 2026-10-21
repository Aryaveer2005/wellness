import { ArrowUp, Smiley, SmileyMeh, SmileyNervous, SmileySad, SmileyWink } from "@/components/icons";
import { Reveal3D } from "@/components/motion/reveal-3d";
import { SplitHeading } from "@/components/motion/split-heading";

// Periwinkle band with three HTML/CSS phone mock-ups (tiny versions of the real UI).
const STEPS = [
  { title: "Check in", text: "Tap how you feel today. It takes five seconds.", screen: <MoodScreen /> },
  {
    title: "Take 60 seconds",
    text: "Breathe, reset your posture and steady your mind before the moment.",
    screen: <RingScreen />,
  },
  {
    title: "Talk it through",
    text: "Untangle a heavy thought with the reframer or the AI companion — privately.",
    screen: <ChatScreen />,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="band-periwinkle scroll-mt-16 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">How it works</p>
          <SplitHeading className="mt-3 text-4xl sm:text-5xl">A minute for yourself</SplitHeading>
        </div>
        <Reveal3D tilt={6} className="mt-14 grid gap-14 sm:grid-cols-3 sm:gap-6 lg:gap-10">
          {STEPS.map((s, i) => (
            <div key={s.title} data-reveal className="text-center">
              <div className="relative mx-auto h-[19rem] max-w-[17rem]">
                {/* peach plinth behind the phone */}
                <div className="absolute inset-x-0 bottom-0 h-[38%] rounded-2xl opacity-80" style={{ background: "var(--hero-gradient)" }} />
                <Phone>{s.screen}</Phone>
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/55">Step {i + 1}</p>
              <h3 className="mt-1.5 text-[1.75rem]">{s.title}</h3>
              <p className="mx-auto mt-2 max-w-[16rem] text-[15px] leading-relaxed text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </Reveal3D>
      </div>
    </section>
  );
}

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div
      aria-hidden
      className="absolute bottom-0 left-1/2 h-[18rem] w-[10rem] -translate-x-1/2 overflow-hidden rounded-t-[1.6rem] border-[5px] border-b-0 border-[#161514] bg-[#FFFCFA] text-[#161514] shadow-[0_20px_40px_-20px_rgba(22,21,20,0.5)] dark:border-[#3a3634] dark:bg-[#1B1918] dark:text-[#F5EFEA]"
    >
      <div className="mx-auto mt-1.5 h-3 w-12 rounded-full bg-[#161514] dark:bg-[#3a3634]" />
      <div className="px-2.5 pt-3">{children}</div>
    </div>
  );
}

function MoodScreen() {
  const faces = [SmileySad, SmileyNervous, SmileyMeh, Smiley, SmileyWink];
  return (
    <div>
      <p className="font-heading text-[15px] leading-tight">How are you feeling today?</p>
      <div className="mt-3 grid grid-cols-5 gap-1">
        {faces.map((Face, i) => (
          <span
            key={i}
            className={`grid aspect-square place-items-center rounded-full ${
              i === 3 ? "bg-[#E8673E]/20 text-[#E8673E] ring-1 ring-[#E8673E]" : "bg-[#F7F0EE] dark:bg-white/5"
            }`}
          >
            <Face className="size-3.5" weight={i === 3 ? "fill" : "duotone"} />
          </span>
        ))}
      </div>
      <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.14em] opacity-60">This week</p>
      <div className="mt-1.5 flex h-12 items-end gap-1.5">
        {[40, 55, 35, 65, 60, 80, 72].map((h, i) => (
          <span key={i} className="flex-1 rounded-t bg-[#E8673E]/70" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="mt-4 rounded-full bg-[#161514] py-1.5 text-center text-[9px] font-medium text-white dark:bg-[#F5EFEA] dark:text-[#161514]">
        Save check-in
      </div>
    </div>
  );
}

function RingScreen() {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="text-center">
      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] opacity-60">Confidence boost</p>
      <svg viewBox="0 0 84 84" className="mx-auto mt-2 size-24">
        <circle cx="42" cy="42" r={r} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="6" />
        <circle
          cx="42"
          cy="42"
          r={r}
          fill="none"
          stroke="#E8673E"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * 0.3}
          transform="rotate(-90 42 42)"
        />
        <text x="42" y="47" textAnchor="middle" fontSize="15" fill="currentColor" style={{ fontFamily: "var(--font-heading)" }}>
          0:42
        </text>
      </svg>
      <p className="mt-2 font-heading text-[15px]">Breathe in…</p>
      <p className="mt-0.5 text-[9px] opacity-60">Shoulders back, chin level</p>
      <div className="mx-auto mt-4 w-20 rounded-full border border-current/20 py-1.5 text-[9px] font-medium">Pause</div>
    </div>
  );
}

function ChatScreen() {
  return (
    <div className="space-y-2 text-[9.5px] leading-snug">
      <div className="ml-auto w-[85%] rounded-2xl rounded-br-md bg-[#161514] px-2.5 py-1.5 text-white dark:bg-[#F5EFEA] dark:text-[#161514]">
        I keep thinking everyone notices.
      </div>
      <div className="w-[88%] rounded-2xl rounded-bl-md bg-[#E8EEFB] px-2.5 py-1.5 dark:bg-[#1B2133]">
        That sounds tiring to carry. What happened today that brought it up?
      </div>
      <div className="flex w-12 gap-1 rounded-full bg-[#E8EEFB] px-2.5 py-2 dark:bg-[#1B2133]">
        <span className="size-1 rounded-full bg-current opacity-50" />
        <span className="size-1 rounded-full bg-current opacity-50" />
        <span className="size-1 rounded-full bg-current opacity-50" />
      </div>
      <div className="!mt-8 flex items-center justify-between rounded-full bg-[#F7F0EE] py-1 pl-3 pr-1 dark:bg-white/5">
        <span className="opacity-50">Type a message…</span>
        <span className="grid size-5 place-items-center rounded-full bg-[#161514] text-white dark:bg-[#F5EFEA] dark:text-[#161514]">
          <ArrowUp className="size-3" />
        </span>
      </div>
    </div>
  );
}
