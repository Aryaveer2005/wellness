"use client";

import { useEffect, useState } from "react";
import { CircleNotch, SpeakerHigh, Pause } from "@/components/icons";
import { playVoice, stopVoice, voiceKey } from "@/lib/voice-client";
import { cn } from "@/lib/utils";

/** "Listen" — reads a companion reply aloud (Chatterbox voice via our server). */
export function ListenButton({ text, className }: { text: string; className?: string }) {
  const key = voiceKey({ kind: "reply", text });
  const [state, setState] = useState<"idle" | "loading" | "playing" | "error">("idle");

  useEffect(() => {
    const onVoice = (e: Event) => {
      const d = (e as CustomEvent<{ key: string; state: "loading" | "playing" } | null>).detail;
      setState((s) => (d && d.key === key ? d.state : s === "error" ? "error" : "idle"));
    };
    window.addEventListener("showup:voice", onVoice);
    return () => window.removeEventListener("showup:voice", onVoice);
  }, [key]);

  const toggle = async () => {
    if (state === "playing" || state === "loading") return stopVoice();
    const ok = await playVoice({ kind: "reply", text: text.slice(0, 700) });
    if (!ok) setState("error");
  };

  const label = state === "playing" ? "Stop" : state === "loading" ? "Loading…" : state === "error" ? "Voice unavailable" : "Listen";
  const Icon = state === "loading" ? CircleNotch : state === "playing" ? Pause : SpeakerHigh;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={state === "playing" ? "Stop reading aloud" : "Read this reply aloud"}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors duration-300 hover:bg-muted hover:text-foreground",
        state === "playing" && "text-ember",
        className
      )}
    >
      <Icon className={cn("size-4", state === "loading" && "animate-spin")} weight={state === "playing" ? "fill" : "duotone"} />
      {label}
    </button>
  );
}
