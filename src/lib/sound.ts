"use client";

/**
 * EaseMind sound engine — tiny, synthesised UI sounds (Web Audio API).
 * No audio files, nothing AI-generated: every sound is a short sine/triangle
 * tone shaped in code, kept very quiet.
 *
 * - tick()      soft glass tick while numbers count up
 * - progress(p) gentle tone whose pitch rises with a progress bar (0–1)
 * - complete()  warm two-note chime when something finishes
 *
 * Browsers only allow sound after the user has tapped/clicked once, so the
 * first sounds before any interaction are silently skipped.
 * Users can switch sounds off in Settings (stored on this device).
 */

const STORAGE_KEY = "showup.sound";
const MASTER = 0.07; // overall volume — deliberately subtle

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let lastTick = 0;
let lastProgress = 0;
let lastChime = 0;

function enabled(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function isSoundOn() {
  return typeof window !== "undefined" && enabled();
}

export function setSoundOn(on: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
    window.dispatchEvent(new CustomEvent("showup:sound", { detail: on }));
  } catch {
    /* ignore */
  }
}

function audio(): { ctx: AudioContext; out: GainNode } | null {
  if (typeof window === "undefined" || !enabled()) return null;
  // Respect "has the user interacted yet" — never try to force audio.
  const ua = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
  if (ua && !ua.hasBeenActive) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = MASTER;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") void ctx.resume();
    return { ctx, out: master! };
  } catch {
    return null;
  }
}

function tone(freq: number, opts: { dur?: number; type?: OscillatorType; gain?: number; delay?: number; glideTo?: number } = {}) {
  const a = audio();
  if (!a) return;
  const { ctx: c, out } = a;
  const { dur = 0.08, type = "sine", gain = 1, delay = 0, glideTo } = opts;
  const t = c.currentTime + delay;
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(gain, t + 0.006);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(env).connect(out);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const sound = {
  /** Soft glass tick — call once per number change during a count-up. */
  tick(step = 0) {
    const now = performance.now();
    if (now - lastTick < 55) return; // never a buzz, always distinct ticks
    lastTick = now;
    tone(1850 + (step % 6) * 40, { dur: 0.045, type: "triangle", gain: 0.55 });
  },

  /** Rising tone that follows a progress bar (p = 0…1). Throttled. */
  progress(p: number) {
    const now = performance.now();
    if (now - lastProgress < 120) return;
    lastProgress = now;
    const clamped = Math.min(1, Math.max(0, p));
    const freq = 330 * Math.pow(2, clamped * 1.25); // E4 → ~ C#6 across the bar
    tone(freq, { dur: 0.12, type: "sine", gain: 0.45 });
  },

  /** Warm two-note "done" chime. */
  complete() {
    const now = performance.now();
    if (now - lastChime < 600) return; // several counters finishing together = one chime
    lastChime = now;
    tone(659.25, { dur: 0.35, type: "sine", gain: 0.7 }); // E5
    tone(987.77, { dur: 0.55, type: "sine", gain: 0.55, delay: 0.11 }); // B5
  },

  /** Very light tap for selections (mood faces, chips). */
  tap() {
    tone(520, { dur: 0.05, type: "sine", gain: 0.5, glideTo: 680 });
  },
};
