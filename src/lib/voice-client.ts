"use client";

/**
 * Browser side of the voice feature. Calls our own /api/tts route (the NVIDIA
 * key stays on the server), plays one clip at a time, and caches clips so the
 * same text isn't requested twice. Fails quietly — voice is always optional.
 */

type TtsBody =
  | { kind: "cue"; situation: string; phase: "breathe" | "posture" | "affirm" | "visualise" }
  | { kind: "reply"; text: string };

const urlCache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();
let current: HTMLAudioElement | null = null;
let currentKey: string | null = null;

const keyOf = (b: TtsBody) => (b.kind === "cue" ? `cue:${b.situation}:${b.phase}` : `reply:${b.text}`);

function fetchClip(body: TtsBody, signal?: AbortSignal): Promise<string | null> {
  const key = keyOf(body);
  const hit = urlCache.get(key);
  if (hit) return Promise.resolve(hit);
  const pending = inflight.get(key);
  if (pending) return pending;
  const p = loadClip(body, key, signal).finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}

async function loadClip(body: TtsBody, key: string, signal?: AbortSignal): Promise<string | null> {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("audio")) return null;
    const url = URL.createObjectURL(await res.blob());
    if (urlCache.size > 40) {
      const [oldKey, oldUrl] = urlCache.entries().next().value as [string, string];
      URL.revokeObjectURL(oldUrl);
      urlCache.delete(oldKey);
    }
    urlCache.set(key, url);
    return url;
  } catch {
    return null;
  }
}

/** Warm the cache without playing (e.g. upcoming session cues). */
export function preloadVoice(body: TtsBody) {
  void fetchClip(body);
}

export function stopVoice() {
  if (current) {
    current.pause();
    current = null;
  }
  currentKey = null;
  window.dispatchEvent(new CustomEvent("showup:voice", { detail: null }));
}

/** Plays a clip. Resolves true if it started, false if voice is unavailable. */
export async function playVoice(body: TtsBody, { volume = 1, signal }: { volume?: number; signal?: AbortSignal } = {}) {
  const key = keyOf(body);
  stopVoice();
  currentKey = key;
  window.dispatchEvent(new CustomEvent("showup:voice", { detail: { key, state: "loading" } }));
  const url = await fetchClip(body, signal);
  if (!url || currentKey !== key || signal?.aborted) {
    if (currentKey === key) stopVoice();
    return false;
  }
  const audio = new Audio(url);
  audio.volume = volume;
  current = audio;
  audio.onended = () => {
    if (current === audio) stopVoice();
  };
  try {
    await audio.play();
    window.dispatchEvent(new CustomEvent("showup:voice", { detail: { key, state: "playing" } }));
    return true;
  } catch {
    stopVoice();
    return false;
  }
}

export const voiceKey = keyOf;

/** Play and wait until the clip ends (or is stopped / fails). Resolves true if it played. */
export function playVoiceAndWait(body: TtsBody): Promise<boolean> {
  const key = keyOf(body);
  return new Promise((resolve) => {
    let mine = false; // our clip has begun loading (ignore the "stop" for the previous clip)
    let started = false;
    const onVoice = (e: Event) => {
      const d = (e as CustomEvent<{ key: string; state: string } | null>).detail;
      if (d?.key === key) {
        mine = true;
        if (d.state === "playing") started = true;
        return;
      }
      // "null" detail = stopped/ended; a different key = something else took over
      if (mine && (!d || d.key !== key)) {
        window.removeEventListener("showup:voice", onVoice);
        resolve(started);
      }
    };
    window.addEventListener("showup:voice", onVoice);
    void playVoice(body).then((ok) => {
      if (!ok) {
        window.removeEventListener("showup:voice", onVoice);
        resolve(false);
      }
    });
  });
}
