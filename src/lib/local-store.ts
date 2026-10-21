"use client";

// On-device storage so every tool works without an account (PROJECT_SPEC.md §4.7).
// Data never leaves the browser unless the user logs in (Supabase, when configured).
// Every access is wrapped in try/catch: storage can be blocked (private mode etc.).

export type MoodEntry = { id: string; date: string; mood: 1 | 2 | 3 | 4 | 5; note?: string };
export type ConfidenceSession = {
  id: string;
  date: string;
  situation: string;
  before: number; // 0-10
  after: number; // 0-10
};
export type ReframeRecord = {
  id: string;
  date: string;
  situation: string;
  thought: string;
  emotion: string;
  intensityBefore: number; // 0-100
  traps: string[];
  evidenceFor: string;
  evidenceAgainst: string;
  balancedThought: string;
  intensityAfter: number; // 0-100
};
export type Profile = {
  name?: string;
  confirmedAdult?: boolean;
  acceptedDisclaimerAt?: string;
  reasons?: string[];
  saveChatHistory?: boolean;
};

const KEYS = {
  moods: "showup.moods",
  confidence: "showup.confidence",
  reframes: "showup.reframes",
  profile: "showup.profile",
  activeDays: "showup.activeDays",
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("showup:store", { detail: key }));
  } catch {
    /* storage unavailable — the app still works for this session */
  }
}

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

const todayKey = () => new Date().toISOString().slice(0, 10);

function markActiveToday() {
  const days = read<string[]>(KEYS.activeDays, []);
  const t = todayKey();
  if (!days.includes(t)) write(KEYS.activeDays, [...days, t]);
}

export const store = {
  getMoods: () => read<MoodEntry[]>(KEYS.moods, []),
  addMood(entry: Omit<MoodEntry, "id" | "date">) {
    const e: MoodEntry = { ...entry, id: newId(), date: new Date().toISOString() };
    write(KEYS.moods, [...store.getMoods(), e]);
    markActiveToday();
    return e;
  },
  // Latest entry for today ("Update" adds a new entry rather than editing).
  getTodayMood: () => store.getMoods().findLast((m) => m.date.slice(0, 10) === todayKey()),

  getConfidenceSessions: () => read<ConfidenceSession[]>(KEYS.confidence, []),
  addConfidenceSession(s: Omit<ConfidenceSession, "id" | "date">) {
    const e: ConfidenceSession = { ...s, id: newId(), date: new Date().toISOString() };
    write(KEYS.confidence, [...store.getConfidenceSessions(), e]);
    markActiveToday();
    return e;
  },

  getReframes: () => read<ReframeRecord[]>(KEYS.reframes, []),
  addReframe(r: Omit<ReframeRecord, "id" | "date">) {
    const e: ReframeRecord = { ...r, id: newId(), date: new Date().toISOString() };
    write(KEYS.reframes, [...store.getReframes(), e]);
    markActiveToday();
    return e;
  },
  deleteReframe(id: string) {
    write(KEYS.reframes, store.getReframes().filter((r) => r.id !== id));
  },

  getProfile: () => read<Profile>(KEYS.profile, {}),
  setProfile(p: Partial<Profile>) {
    write(KEYS.profile, { ...store.getProfile(), ...p });
  },

  getActiveDays: () => read<string[]>(KEYS.activeDays, []),

  exportAll() {
    return {
      exportedAt: new Date().toISOString(),
      profile: store.getProfile(),
      moods: store.getMoods(),
      confidenceSessions: store.getConfidenceSessions(),
      reframes: store.getReframes(),
      activeDays: store.getActiveDays(),
    };
  },
  clearAll() {
    try {
      Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
      window.dispatchEvent(new CustomEvent("showup:store", { detail: "*" }));
    } catch {
      /* ignore */
    }
  },
};
