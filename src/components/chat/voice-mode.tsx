"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Microphone, Pause, Phone, Play, X } from "@/components/icons";
import { NeedHelpButton } from "@/components/layout/need-help-button";
import { AmbientVideo } from "@/components/media/ambient-video";
import { getLenis } from "@/components/motion/smooth-scroll";
import { gsap } from "@/lib/gsap";
import { EMERGENCY, HELPLINES } from "@/lib/safety";
import { playVoiceAndWait, stopVoice } from "@/lib/voice-client";
import { VoiceRecorder } from "@/lib/voice-recorder";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "./chat-storage";
import { plain } from "./message-bubble";

/**
 * Voice mode — hands-free, speech-to-speech conversation with the companion.
 * You speak → NVIDIA Parakeet turns it into text (/api/stt) → the normal chat pipeline
 * (crisis check, topic guard, companion) → Chatterbox speaks the reply (/api/tts) → listens again.
 * Every turn also appears in the chat as text. Audio is never stored.
 */

export type VoiceReply = { content: string; kind?: ChatMessage["kind"] };

type Phase = "starting" | "listening" | "hearing" | "transcribing" | "thinking" | "speaking" | "paused" | "crisis" | "error";

const STATUS: Record<Phase, string> = {
  starting: "Getting the microphone ready…",
  listening: "I'm listening",
  hearing: "Go on, I'm listening…",
  transcribing: "Got it…",
  thinking: "Thinking…",
  speaking: "Speaking — tap the orb to interrupt",
  paused: "Paused",
  crisis: "Please reach out now",
  error: "Voice isn't available",
};

const CRISIS_LINE =
  "I'm really glad you told me. You deserve support right now. The numbers on your screen are free, and someone will listen.";

export function VoiceMode({
  open,
  onClose,
  onUtterance,
}: {
  open: boolean;
  onClose: () => void;
  onUtterance: (text: string) => Promise<VoiceReply | null>;
}) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("starting");
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");
  const [note, setNote] = useState<string | null>(null);

  // Latest callbacks without restarting the conversation when the chat re-renders.
  const sendRef = useRef(onUtterance);
  const closeRef = useRef(onClose);
  useEffect(() => {
    sendRef.current = onUtterance;
    closeRef.current = onClose;
  });
  const phaseRef = useRef<Phase>("starting");
  const pausedRef = useRef(false);
  const recRef = useRef<VoiceRecorder | null>(null);
  const listenRef = useRef<() => void>(() => {});
  const orbRef = useRef<HTMLButtonElement>(null);
  const scaleTo = useRef<((v: number) => void) | null>(null);

  const set = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  useEffect(() => setMounted(true), []);

  // The conversation engine — runs while the overlay is open.
  useEffect(() => {
    if (!open) return;
    let alive = true;
    pausedRef.current = false;
    setHeard("");
    setReply("");
    setNote(null);
    set("starting");

    const lenis = getLenis();
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const orb = orbRef.current;
    const rec = new VoiceRecorder();
    recRef.current = rec;

    const onLevel = (l: number) => {
      if (phaseRef.current === "listening" || phaseRef.current === "hearing") scaleTo.current?.(1 + l * 0.35);
    };

    const listen = () => {
      if (!alive || pausedRef.current) return;
      set("listening");
      scaleTo.current?.(1);
      rec.listen({ onLevel, onSpeechStart: () => set("hearing"), onUtterance: (wav) => void turn(wav) });
    };
    listenRef.current = listen;

    async function turn(wav: Blob) {
      set("transcribing");
      setNote(null);
      let text = "";
      try {
        const res = await fetch("/api/stt", { method: "POST", headers: { "Content-Type": "audio/wav" }, body: wav });
        const data = (await res.json().catch(() => ({}))) as { text?: string; message?: string };
        if (!res.ok) {
          if (res.status === 400) {
            setNote("I couldn't hear that — try again.");
            return listen();
          }
          setNote(data.message ?? "Voice input is offline right now — you can keep typing.");
          return set("error");
        }
        text = (data.text ?? "").trim();
      } catch {
        setNote("Voice input is offline right now — you can keep typing.");
        return set("error");
      }
      if (!alive) return;
      if (text.replace(/[^\p{L}\p{N}]/gu, "").length < 2) {
        setNote("I didn't catch that — try again.");
        return listen();
      }

      setHeard(text);
      setReply("");
      set("thinking");
      const r = await sendRef.current(text);
      if (!alive) return;
      if (!r) return listen();

      const spoken = plain(r.content);
      setReply(spoken);

      if (r.kind === "crisis") {
        // SAFETY: stop the conversation loop and put the helplines front and centre.
        set("crisis");
        rec.pause();
        await playVoiceAndWait({ kind: "reply", text: CRISIS_LINE });
        return;
      }
      if (r.kind === "offline" || r.kind === "error" || r.kind === "limit") {
        setNote(spoken);
        return set("error");
      }

      set("speaking");
      gsap.to(orbRef.current, { scale: 1.08, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      const ok = await playVoiceAndWait({ kind: "reply", text: spoken.slice(0, 700) });
      gsap.killTweensOf(orbRef.current);
      if (!alive) return;
      if (!ok) setNote("Couldn't play the voice — the reply is in the chat.");
      listen();
    }

    rec
      .start()
      .then(() => alive && listen())
      .catch(() => {
        if (!alive) return;
        setNote("Allow microphone access in your browser to talk. You can always type instead.");
        set("error");
      });

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    window.addEventListener("keydown", onKey);

    return () => {
      alive = false;
      window.removeEventListener("keydown", onKey);
      stopVoice();
      rec.stop();
      recRef.current = null;
      gsap.killTweensOf(orb);
      document.body.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [open]);

  // Smooth orb scaling from the mic level.
  useEffect(() => {
    if (!open || !orbRef.current) return;
    scaleTo.current = gsap.quickTo(orbRef.current, "scale", { duration: 0.25, ease: "power3.out" });
    return () => {
      scaleTo.current = null;
    };
  }, [open, mounted]);

  function togglePause() {
    if (phaseRef.current === "paused") {
      pausedRef.current = false;
      listenRef.current();
    } else {
      pausedRef.current = true;
      stopVoice();
      recRef.current?.pause();
      set("paused");
    }
  }

  function onOrb() {
    if (phaseRef.current === "speaking") stopVoice(); // interrupt → loop goes back to listening
    else if (phaseRef.current === "paused" || phaseRef.current === "error") {
      pausedRef.current = false;
      setNote(null);
      listenRef.current();
    }
  }

  if (!mounted || !open) return null;

  const listening = phase === "listening" || phase === "hearing";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Voice conversation"
      className="fixed inset-0 z-[60] flex flex-col bg-background"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <AmbientVideo name="water" overlay="strong" eager className="-z-10" />

      {/* Top bar — "Need help now?" stays visible (SAFETY) */}
      <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-8 sm:pt-6">
        <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-ember">Voice mode</p>
        <div className="flex items-center gap-2">
          <NeedHelpButton />
          <button
            type="button"
            onClick={onClose}
            aria-label="End voice conversation"
            className="grid size-11 place-items-center rounded-full border border-border bg-card transition-colors hover:bg-muted"
          >
            <X className="size-5" weight="bold" />
          </button>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <button
          ref={orbRef}
          type="button"
          onClick={onOrb}
          aria-label={phase === "speaking" ? "Interrupt" : STATUS[phase]}
          className={cn(
            "relative grid size-44 place-items-center rounded-full will-change-transform sm:size-52",
            "shadow-[0_30px_80px_-28px_color-mix(in_oklab,var(--peach-deep)_80%,transparent)]",
            phase === "crisis"
              ? "bg-[linear-gradient(160deg,color-mix(in_oklab,var(--crisis)_55%,white),var(--crisis))]"
              : "bg-[radial-gradient(circle_at_32%_26%,rgba(255,255,255,0.55),transparent_45%),linear-gradient(160deg,#FFD9C2_0%,#FFB58E_45%,#FF8F63_100%)]"
          )}
        >
          {listening && <span className="absolute inset-0 animate-ping rounded-full bg-[#FF8F63]/25 [animation-duration:2.4s]" aria-hidden />}
          {phase === "paused" ? (
            <Play className="size-12 text-[#161514]" weight="fill" />
          ) : (
            <Microphone className={cn("size-12 transition-opacity", phase === "crisis" ? "text-white" : "text-[#161514]", !listening && "opacity-70")} weight="duotone" />
          )}
        </button>

        <div className="min-h-[1.75rem]" aria-live="polite">
          <p className="font-display text-[2.25rem] leading-[1.05] sm:text-5xl">{STATUS[phase]}</p>
          {note && <p className="mt-2 text-sm text-muted-foreground">{note}</p>}
        </div>

        {phase === "crisis" ? (
          <div className="w-full space-y-3">
            {[...HELPLINES, EMERGENCY].map((h) => (
              <a
                key={h.id}
                href={`tel:${h.numbers[0].tel}`}
                className="flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-crisis px-5 text-lg font-semibold text-crisis-foreground shadow-[0_14px_34px_-12px_color-mix(in_oklab,var(--crisis)_75%,transparent)]"
              >
                <Phone className="size-5" weight="fill" /> {h.name}: {h.numbers[0].display}
              </a>
            ))}
            <Link href="/help" className="inline-block pt-2 text-sm font-semibold text-crisis underline underline-offset-4">
              More ways to get help now
            </Link>
          </div>
        ) : (
          <div className="w-full space-y-3 text-left" data-lenis-prevent>
            {heard && (
              <p className="ml-auto w-fit max-w-[90%] rounded-[1.4rem] rounded-br-md bg-primary px-4 py-2.5 text-[0.95rem] text-primary-foreground">
                {heard}
              </p>
            )}
            {reply && (
              <p className="max-h-44 w-fit max-w-[95%] overflow-y-auto rounded-[1.4rem] border border-border bg-card rounded-bl-md px-4 py-2.5 text-[0.95rem] leading-relaxed">
                {reply}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-3 px-6 pb-8">
        {phase !== "crisis" && phase !== "error" && phase !== "starting" && (
          <button
            type="button"
            onClick={togglePause}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-foreground/70 bg-card px-6 font-medium transition-colors hover:bg-muted"
          >
            <span className="inline-flex items-center gap-2">
              {phase === "paused" ? <Play className="size-5" weight="fill" /> : <Pause className="size-5" weight="fill" />}
              {phase === "paused" ? "Resume" : "Pause"}
            </span>
          </button>
        )}
        <p className="max-w-sm text-center text-xs text-muted-foreground">
          Your voice is turned into text to reply and isn&apos;t stored. AI companion — not a therapist. In a crisis, use Need help now.
        </p>
      </div>
    </div>,
    document.body
  );
}
