"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkle } from "@/components/icons";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "./chat-storage";
import { ListenButton } from "./listen-button";

const TOOL_LINK = /(\/(?:confidence|reframe|psychologists|help|home|progress)\b)/g;
const TOOL_LABEL: Record<string, string> = {
  "/confidence": "Confidence builder",
  "/reframe": "Thought reframer",
  "/psychologists": "Find a psychologist",
  "/help": "Need help now",
  "/home": "Home",
  "/progress": "My progress",
};

// Turns in-app paths like "/reframe" into tappable links.
/** Models sometimes add markdown emphasis; the chat shows plain text, so drop the markers. */
export function plain(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(^|[\s(“"])\*(?!\s)(.+?)\*(?=[\s.,!?;:)”"]|$)/g, "$1$2")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*•]\s+/gm, "• ");
}

function renderWithLinks(text: string, isCrisisish: boolean) {
  return plain(text).split(TOOL_LINK).map((part, i) =>
    TOOL_LABEL[part] ? (
      <Link
        key={i}
        href={part}
        className={cn(
          "mx-0.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.85em] font-semibold underline-offset-2 hover:underline",
          part === "/help" || isCrisisish ? "bg-crisis/10 text-crisis" : "bg-accent text-accent-foreground"
        )}
      >
        {TOOL_LABEL[part]}
      </Link>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

/** Small warm peach circle that stands in for the companion. */
function CompanionOrb() {
  return (
    <span aria-hidden className="band-peach mt-0.5 grid size-8 shrink-0 place-items-center rounded-full">
      <Sparkle className="size-4 text-ink" weight="duotone" />
    </span>
  );
}

/** User bubble: solid ink, like the reference's black pills. */
const userInk = "bg-primary text-primary-foreground";

export function MessageBubble({ message, streaming = false }: { message: ChatMessage; streaming?: boolean }) {
  const isUser = message.role === "user";
  const special = message.kind;
  const canListen = !isUser && !streaming && !!message.content.trim() && (!special || special === "offtopic");
  const muted = special === "offline" || special === "limit" || special === "error";
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: isUser ? "100% 100%" : "0% 100%" }}
      className={cn("flex w-full gap-2", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && <CompanionOrb />}
      <div className={cn("flex max-w-[85%] flex-col sm:max-w-[75%]", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-full whitespace-pre-wrap break-words rounded-[1.6rem] px-4.5 py-3 text-[0.98rem] leading-relaxed",
          isUser ? cn("rounded-br-md", userInk) : "rounded-bl-md border border-border bg-card text-foreground",
          special === "crisis" && "border-2 border-crisis/50",
          muted && "border border-dashed border-border bg-muted/60"
        )}
      >
        <span className={cn(!isUser && "relative z-[2]")}>
          <span className="sr-only">{isUser ? "You said: " : "Companion said: "}</span>
          {isUser ? message.content : renderWithLinks(message.content, special === "crisis")}
        </span>
      </div>
      {canListen && <ListenButton text={plain(message.content)} className="mt-1" />}
      </div>
    </motion.div>
  );
}

/** Three softly breathing dots (GSAP). Static when motion is reduced. */
export function TypingIndicator() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        "[data-dot]",
        { scale: 0.65, opacity: 0.35 },
        { scale: 1.15, opacity: 1, duration: 0.75, ease: "sine.inOut", stagger: { each: 0.18, repeat: -1, yoyo: true } }
      );
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="flex items-center gap-2" role="status" aria-label="Companion is typing">
      <CompanionOrb />
      <div className="flex items-center gap-1.5 rounded-[1.6rem] rounded-bl-md border border-border bg-card px-4.5 py-3.5">
        {[0, 1, 2].map((i) => (
          <span key={i} data-dot className="size-2 rounded-full bg-ember/80" />
        ))}
      </div>
    </div>
  );
}
