// SAFETY (CLAUDE.md rule 5): crisis detection + helpline list used across the app.
// This file is imported by BOTH server (API routes) and client (chat UI) code,
// so it must stay free of secrets and browser/server-only APIs.
//
// Detection is deliberately cautious: a false positive only shows helplines,
// a false negative could miss someone in danger.

export type Helpline = {
  id: string;
  name: string;
  description: string;
  hours: string;
  numbers: { display: string; tel: string }[];
  /** false until the owner has checked the number is correct and current. */
  verified: boolean;
};

export const HELPLINES: Helpline[] = [
  {
    // PLACEHOLDER — owner to verify
    id: "tele-manas",
    name: "Tele-MANAS",
    description: "Government of India's national mental health helpline. Free, confidential, multiple languages.",
    hours: "24 × 7",
    numbers: [
      { display: "14416", tel: "14416" },
      { display: "1-800-891-4416", tel: "18008914416" },
    ],
    verified: false,
  },
  {
    // PLACEHOLDER — owner to verify
    id: "kiran",
    name: "KIRAN",
    description: "National mental health rehabilitation helpline. Free and confidential.",
    hours: "24 × 7",
    numbers: [{ display: "1800-599-0019", tel: "18005990019" }],
    verified: false,
  },
];

export const EMERGENCY: Helpline = {
  // PLACEHOLDER — owner to verify
  id: "emergency",
  name: "Emergency services",
  description: "If you or someone else is in immediate danger.",
  hours: "24 × 7",
  numbers: [{ display: "112", tel: "112" }],
  verified: false,
};

// Phrases are matched against a normalised, lower-case version of the text.
// Includes common English phrasings and Hinglish (romanised Hindi).
const CRISIS_PATTERNS: RegExp[] = [
  // English — suicide
  /\bsuicid(e|al)\b/,
  /\bkill(ing)? my ?self\b/,
  /\bend(ing)? my (own )?life\b/,
  /\btake my (own )?life\b/,
  /\b(want|wanna|going|ready|plan|planning) to die\b/,
  /\b(i )?wish i (was|were) dead\b/,
  /\bwish i (could|would) die\b/,
  /\bbetter off dead\b/,
  /\bbetter off without me\b/,
  /\b(want|wanna|going) to end it\b/,
  /\bjust end it\b/,
  /\bend it all\b/,
  /\bend everything\b/,
  /\bno reason to live\b/,
  /\bnothing to live for\b/,
  /\b(don'?t|do not) want to (live|be alive|exist|wake up)\b/,
  /\bcan'?t (go on|do this anymore|take it anymore)\b/,
  /\b(hang|hanging) my ?self\b/,
  /\bjump (off|from) (a |the )?(building|bridge|roof|terrace)\b/,
  /\boverdose\b/,
  /\bsleeping pills to die\b/,
  // English — self-harm
  /\bself[- ]?harm(ing)?\b/,
  /\bhurt(ing)? my ?self\b/,
  /\bcut(ting)? my ?self\b/,
  /\bcut(ting)? my (wrist|wrists|arm|arms)\b/,
  // Hinglish
  /\bmar ja(a)?n(a|e|a hai)\b/,
  /\bmar ja(a)?u(n|ng|nga)\b/,
  /\bmarna (chahta|chahti|hai)\b/,
  /\bmarne ka (mann|man|dil)\b/,
  /\bjeena nahi (chahta|chahti)\b/,
  /\bjeene ka (mann|man|dil) nahi\b/,
  /\bzindagi (khatam|khtm)\b/,
  /\bkhud ?kushi\b/,
  /\baatm ?hatya\b/,
  /\baatmahatya\b/,
  /\bsuicide kar\b/,
  /\bkhud ko (khatam|maar|mar)\b/,
  /\bapne aap ko (khatam|maar|mar)\b/,
];

function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9'\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Returns true if the text contains language that suggests risk of suicide or self-harm. */
export function detectCrisis(text: string): boolean {
  if (!text) return false;
  const t = normalise(text);
  return CRISIS_PATTERNS.some((p) => p.test(t));
}

/** Fixed, model-independent reply shown when crisis language is detected. */
export const CRISIS_RESPONSE = [
  "I'm really glad you told me. What you're feeling sounds heavy, and you deserve real support right now — more than an app can give.",
  "",
  "Please reach out to someone now:",
  `• Tele-MANAS (free, 24×7): ${HELPLINES[0].numbers.map((n) => n.display).join(" or ")}`,
  `• KIRAN (free, 24×7): ${HELPLINES[1].numbers[0].display}`,
  `• If you are in immediate danger, call ${EMERGENCY.numbers[0].display}.`,
  "",
  "If you can, tell one person you trust how you're feeling — a friend, family member, anyone. You don't have to go through this alone. The Need help now page has tap-to-call buttons.",
].join("\n");
