import { Briefcase, Confetti, Heart, Lightning, PresentationChart, UsersThree, type AppIcon } from "@/components/icons";

// Content for the 60-Second Confidence Builder (PROJECT_SPEC §4.1).
// Affirmations focus on presence, character and showing up — never appearance fixes.

export type Situation = {
  id: string;
  label: string;
  icon: AppIcon;
  affirmations: [string, string, string];
  visualise: string;
};

export const SITUATIONS: Situation[] = [
  {
    id: "date",
    label: "A date",
    icon: Heart,
    affirmations: [
      "I'm here to get to know someone, not to pass a test.",
      "My warmth, humour and attention are what people remember.",
      "I can be curious, relaxed and fully myself.",
    ],
    visualise:
      "Picture the first hello. You smile, make easy eye contact and ask a good question. You listen. The conversation finds its rhythm.",
  },
  {
    id: "interview",
    label: "An interview",
    icon: Briefcase,
    affirmations: [
      "I've earned my place in this room through my work.",
      "I can take a breath before I answer. Pauses are strength.",
      "They're meeting my skills, my judgement and my character.",
    ],
    visualise:
      "See yourself walking in, shaking hands, sitting tall. A tough question comes — you pause, breathe, and answer clearly.",
  },
  {
    id: "meeting",
    label: "A meeting",
    icon: UsersThree,
    affirmations: [
      "My ideas deserve to be heard.",
      "I can speak slowly and clearly. People lean in.",
      "I bring focus and calm to the table.",
    ],
    visualise:
      "Imagine the moment you speak up. Your voice is steady. You make your point, and someone nods and builds on it.",
  },
  {
    id: "social",
    label: "Party / social",
    icon: Confetti,
    affirmations: [
      "Most people are busy thinking about themselves, not judging me.",
      "I can start with one person and one easy question.",
      "I'm good company. I'm allowed to enjoy this.",
    ],
    visualise:
      "Picture yourself walking in, finding a familiar face, laughing at something small. You feel your shoulders drop.",
  },
  {
    id: "presentation",
    label: "A presentation",
    icon: PresentationChart,
    affirmations: [
      "I know this material. I've prepared for this.",
      "Nerves are energy. I can use them to be present.",
      "The audience wants me to do well.",
    ],
    visualise:
      "See yourself at the front, feet planted. You take one breath, look up, and say your first line clearly. It lands.",
  },
  {
    id: "boost",
    label: "Just need a boost",
    icon: Lightning,
    affirmations: [
      "I'm more than how I look on any given day.",
      "I keep showing up — that's what confidence is made of.",
      "I can handle today, one moment at a time.",
    ],
    visualise:
      "Picture the rest of your day going steadily. You meet each moment with a straight back and an open face.",
  },
];

export type Phase = {
  id: "breathe" | "posture" | "affirm" | "visualise";
  label: string;
  seconds: number;
};

export const PHASES: Phase[] = [
  { id: "breathe", label: "Breathe", seconds: 20 },
  { id: "posture", label: "Posture", seconds: 10 },
  { id: "affirm", label: "Affirm", seconds: 20 },
  { id: "visualise", label: "Visualise", seconds: 10 },
];

export const TOTAL_SECONDS = PHASES.reduce((s, p) => s + p.seconds, 0);

export const POSTURE_CUE =
  "Plant both feet. Roll your shoulders back and down. Lift your chest a little, unclench your jaw, and let your hands rest open.";

/** Spoken at the start of the Breathe phase when the voice guide is on. */
export const BREATHE_CUE = "Let's begin. Breathe in for four. Hold for four. And slowly out for six.";

/**
 * "Suggested expression" — hand-written coaching (not AI-generated) shown with an
 * AI line-art illustration of the expression. The illustration prompt lives
 * server-side only (src/lib/server/expression-prompts.ts) and never draws hair.
 */
export type Expression = { title: string; tips: [string, string, string] };

export const EXPRESSIONS: Record<string, Expression> = {
  date: {
    title: "Warm and open",
    tips: ["Let your eyebrows relax — no frown line.", "A small, easy smile that reaches your eyes.", "Hold eye contact a beat longer, then look away softly."],
  },
  interview: {
    title: "Steady and attentive",
    tips: ["Chin level, eyes on theirs while they speak.", "A brief, closed-mouth smile when you meet.", "Nod slowly — it shows you're listening, not nervous."],
  },
  meeting: {
    title: "Calm and engaged",
    tips: ["Soft face, relaxed jaw before you speak.", "Look at people, not your notes, for your key line.", "A small nod when others make a good point."],
  },
  social: {
    title: "Easy and friendly",
    tips: ["Unclench your jaw and drop your shoulders.", "Smile first — most people will smile back.", "Let your eyes wander the room calmly, not the floor."],
  },
  presentation: {
    title: "Grounded and clear",
    tips: ["Pause and find one friendly face before you start.", "Brows relaxed, eyes up — your voice follows your face.", "Smile at the end of a point; it signals confidence."],
  },
  boost: {
    title: "Quietly confident",
    tips: ["Relax your forehead and let your jaw go loose.", "A small private smile — just for you.", "Eyes forward, chin level. You're here."],
  },
};
