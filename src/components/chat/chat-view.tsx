"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowCounterClockwise, ArrowRight, Microphone, PaperPlaneRight, ShieldCheck, Sparkle } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { detectCrisis } from "@/lib/safety";
import { newId, store } from "@/lib/local-store";
import { cn } from "@/lib/utils";
import { CrisisCard } from "./crisis-card";
import { MessageBubble, TypingIndicator } from "./message-bubble";
import { clearSavedChat, loadChat, saveChat, type ChatMessage } from "./chat-storage";
import { VoiceMode, type VoiceReply } from "./voice-mode";

const MAX_CHARS = 2000;
const HISTORY_SENT = 20;

const STARTERS = [
  "I keep noticing my hairline and it's ruining my mood",
  "I have a date this weekend and I'm nervous about how I look",
  "I feel like people stare at my hair at work",
  "I just need to vent for a minute",
];

const OFFLINE_FALLBACK =
  "The companion is offline right now — sorry about that. You can still use the confidence builder (/confidence) or the thought reframer (/reframe). If you're struggling or feel unsafe, please go to /help.";

export function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [waitingFirstToken, setWaitingFirstToken] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [persist, setPersist] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const crisisRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load history after mount (storage is browser-only).
  useEffect(() => {
    const p = !!store.getProfile().saveChatHistory;
    const initial = loadChat(p);
    setPersist(p);
    setMessages(initial);
    setShowCrisis(initial.some((m) => m.kind === "crisis"));
    setLoaded(true);
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    if (loaded) saveChat(messages, persist);
  }, [messages, persist, loaded]);

  // Keep the newest message in view (scrolls only the chat pane, never the page).
  useEffect(() => {
    const el = scrollerRef.current;
    if (!messages.length || !el) return;
    const scroll = (behavior: ScrollBehavior) => {
      let top = el.scrollHeight;
      // SAFETY: when the crisis card is showing, keep its top (heading + first helpline) in view.
      const card = crisisRef.current;
      if (showCrisis && card) {
        const cardTop = el.scrollTop + card.getBoundingClientRect().top - el.getBoundingClientRect().top - 16;
        top = Math.min(el.scrollHeight - el.clientHeight, cardTop);
      }
      el.scrollTo({ top, behavior });
    };
    scroll("smooth");
    // Re-check once entry animations have settled.
    const id = window.setTimeout(() => scroll("smooth"), 900);
    return () => window.clearTimeout(id);
  }, [messages, waitingFirstToken, showCrisis]);

  /** Sends a message and resolves with the companion's final reply (used by voice mode too). */
  async function send(text: string): Promise<VoiceReply | null> {
    const content = text.trim().slice(0, MAX_CHARS);
    if (!content || busy) return null;

    // SAFETY: show the crisis card instantly, without waiting for the server.
    if (detectCrisis(content)) setShowCrisis(true);

    const userMsg: ChatMessage = { id: newId(), role: "user", content };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setBusy(true);
    setWaitingFirstToken(true);

    const history = next
      .filter((m) => !m.kind)
      .slice(-HISTORY_SENT)
      .map(({ role, content }) => ({ role, content }));

    const replyId = newId();
    const addReply = (msg: Omit<ChatMessage, "id" | "role">) =>
      setMessages((prev) => [...prev, { id: replyId, role: "assistant", ...msg }]);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      const type = res.headers.get("content-type") ?? "";

      if (type.includes("application/json")) {
        const data = (await res.json()) as { mode?: ChatMessage["kind"] | "invalid"; message?: string };
        const kind = data.mode === "invalid" || !data.mode ? "error" : data.mode;
        if (kind === "crisis") setShowCrisis(true);
        addReply({ content: data.message || OFFLINE_FALLBACK, kind });
        return { content: data.message || OFFLINE_FALLBACK, kind };
      }
      if (!res.ok || !res.body) throw new Error("Bad response");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      let started = false;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        if (!started) {
          started = true;
          setWaitingFirstToken(false);
          addReply({ content: acc });
        } else {
          const snapshot = acc;
          setMessages((prev) => prev.map((m) => (m.id === replyId ? { ...m, content: snapshot } : m)));
        }
      }
      if (!started) {
        addReply({ content: OFFLINE_FALLBACK, kind: "offline" });
        return { content: OFFLINE_FALLBACK, kind: "offline" };
      }
      return { content: acc };
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return null;
      addReply({ content: OFFLINE_FALLBACK, kind: "offline" });
      return { content: OFFLINE_FALLBACK, kind: "offline" };
    } finally {
      setBusy(false);
      setWaitingFirstToken(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }

  function clearConversation() {
    abortRef.current?.abort();
    setMessages([]);
    setShowCrisis(false);
    clearSavedChat({ includeSession: true });
  }

  const empty = loaded && messages.length === 0;
  const canSend = !busy && !!input.trim();

  return (
    // Full-height chat: viewport minus the sticky header + main top padding.
    // On phones the bottom padding leaves room for the floating nav dock.
    <div
      className={cn(
        "mx-auto flex w-full max-w-3xl flex-col",
        "h-[calc(100dvh-6.75rem-env(safe-area-inset-top,0px))] min-h-[28rem] pb-[calc(6rem+env(safe-area-inset-bottom,0px))]",
        "sm:h-[calc(100dvh-8.25rem-env(safe-area-inset-top,0px))] md:pb-6"
      )}
    >
      {/* Header */}
      <div className="flex shrink-0 items-start justify-between gap-3 pb-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">AI Companion</p>
          <h1 className="mt-1 text-[2.25rem] leading-[1.02] sm:text-5xl">
            Talk it <span className="italic text-ember">through</span>
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-ember" aria-hidden />
            {persist ? "Saved only on this device (you turned this on in Settings)." : "Private — cleared when you close this tab."}
          </p>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" onClick={clearConversation} className="mt-1 shrink-0 px-4">
            <ArrowCounterClockwise weight="bold" />
            <span>New chat</span>
          </Button>
        )}
      </div>

      {/* Conversation — its own scroller; Lenis must not hijack it */}
      <div
        ref={scrollerRef}
        data-lenis-prevent
        className="no-scrollbar -mx-4 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 [mask-image:linear-gradient(to_bottom,transparent,#000_1.25rem,#000_calc(100%-1.25rem),transparent)] sm:-mx-6 sm:px-6"
      >
        <div className="flex min-h-full flex-col justify-end gap-3 py-5" aria-live="polite">
          {empty && (
            <motion.div
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center px-1 py-6 text-center"
            >
              <span className="band-peach grid size-20 place-items-center rounded-full shadow-[0_18px_40px_-20px_var(--peach-deep)]">
                <Sparkle className="size-8 text-ink" weight="duotone" />
              </span>
              <p className="mt-6 font-display text-[2.25rem] leading-[1.05] text-foreground sm:text-5xl">
                Hey. What&apos;s on <span className="italic text-ember">your mind?</span>
              </p>
              <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground">
                No judgement here. Say it however it comes out — I&apos;ll listen, and we can figure out a next step together.
              </p>
              <div className="mt-7 grid w-full gap-2.5 sm:grid-cols-2">
                {STARTERS.map((s, i) => (
                  <motion.button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.07, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="liquid-glass liquid-glass-hover group flex min-h-11 items-start justify-between gap-3 rounded-3xl px-5 py-4 text-left text-[0.9375rem] font-medium leading-snug outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.98]"
                  >
                    <span>{s}</span>
                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-ember transition-transform duration-300 group-hover:translate-x-0.5" weight="bold" aria-hidden />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((m, i) => (
            <MessageBubble key={m.id} message={m} streaming={busy && i === messages.length - 1} />
          ))}

          <AnimatePresence>
            {waitingFirstToken && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>

          {showCrisis && (
            <div ref={crisisRef}>
              <CrisisCard />
            </div>
          )}
        </div>
      </div>

      {/* Floating glass composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="liquid-glass shrink-0 rounded-[1.75rem] p-1.5 focus-within:border-ring/50 focus-within:ring-4 focus-within:ring-ring/15"
      >
        <label htmlFor="chat-input" className="sr-only">
          Your message
        </label>
        <div className="relative z-[2] flex items-end gap-2">
          <textarea
            id="chat-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Type how you're feeling…"
            data-lenis-prevent
            className="field-sizing-content max-h-36 min-h-11 flex-1 resize-none bg-transparent py-2.5 pl-3.5 pr-1 text-base leading-relaxed outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => setVoiceOpen(true)}
            disabled={busy}
            aria-label="Start voice conversation"
            title="Talk instead of typing"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-blush text-ember transition-colors duration-300 hover:bg-accent disabled:opacity-40"
          >
            <Microphone className="size-[1.35rem]" />
          </button>
          <Button
            type="submit"
            size="icon-lg"
            disabled={!canSend}
            aria-label="Send message"
            className={cn("size-11 shrink-0 rounded-full transition-transform", canSend && "scale-100", !canSend && "scale-95")}
          >
            <PaperPlaneRight className="size-5" weight="fill" />
          </Button>
        </div>
        {input.length > MAX_CHARS * 0.8 && (
          <p
            className={cn(
              "relative z-[2] px-3.5 pb-1 text-xs",
              input.length >= MAX_CHARS ? "text-ember" : "text-muted-foreground"
            )}
          >
            {input.length}/{MAX_CHARS}
          </p>
        )}
      </form>
      <VoiceMode open={voiceOpen} onClose={() => setVoiceOpen(false)} onUtterance={send} />
      <p className="mt-2 shrink-0 px-2 text-center text-xs text-muted-foreground">
        AI companion, not a therapist or doctor. It can make mistakes. In a crisis,{" "}
        <Link href="/help" className="font-semibold text-crisis underline underline-offset-2">
          get help now
        </Link>
        .
      </p>
    </div>
  );
}
