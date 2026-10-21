"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * Real filmed nature footage (see public/videos/CREDITS.md), used as a calm,
 * looping background. Built to be light:
 * - poster image shows instantly; the video only loads when near the screen
 * - 720p on phones / data-saver, 1080p on large screens (when available)
 * - pauses when off-screen or the tab is hidden
 * - reduced motion → still poster only, no video
 */
export type AmbientVideoName = "ocean" | "water" | "forest" | "mist" | "clouds";

const HAS_1080: Record<AmbientVideoName, boolean> = {
  ocean: true,
  water: true,
  forest: true,
  mist: true,
  clouds: true,
};

type Props = {
  name: AmbientVideoName;
  className?: string;
  /** Tint over the footage so text on top stays readable in both themes. */
  overlay?: "soft" | "strong" | "none";
  /** Extra classes for the <video>/<img> element (e.g. object-position). */
  mediaClassName?: string;
  /** Load immediately (above-the-fold hero) instead of when scrolled near. */
  eager?: boolean;
  /** Cover the whole screen behind the page (rendered on <body>, so animated parents can't trap it). */
  fullscreen?: boolean;
};

export function AmbientVideo({ fullscreen = false, ...props }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!fullscreen) return <AmbientVideoLayer {...props} />;
  if (!mounted) return null;
  return createPortal(
    <AmbientVideoLayer {...props} eager className={cn("fixed inset-0 -z-[5]", props.className)} />,
    document.body
  );
}

function AmbientVideoLayer({ name, className, overlay = "soft", mediaClassName, eager = false }: Omit<Props, "fullscreen">) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const poster = `/videos/${name}-poster.jpg`;

  // Decide whether/which video to load.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // still poster only
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const big = window.matchMedia("(min-width: 1024px)").matches && !conn?.saveData;
    const file = `/videos/${name}-${big && HAS_1080[name] ? "1080" : "720"}.mp4`;
    if (eager) {
      setSrc(file);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSrc(file);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(wrap);
    return () => io.disconnect();
  }, [name, eager]);

  // Play only while visible and the tab is active.
  useEffect(() => {
    const video = videoRef.current;
    const wrap = wrapRef.current;
    if (!video || !wrap || !src) return;
    let visible = true;
    const sync = () => {
      if (visible && !document.hidden) video.play().catch(() => {});
      else video.pause();
    };
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      sync();
    });
    io.observe(wrap);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [src]);

  return (
    <div ref={wrapRef} aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static poster, already optimised */}
      <img src={poster} alt="" className={cn("absolute inset-0 size-full object-cover", mediaClassName)} decoding="async" />
      {src && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          disablePictureInPicture
          onCanPlay={() => setReady(true)}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-1000 ease-[var(--ease-calm)]",
            ready ? "opacity-100" : "opacity-0",
            mediaClassName
          )}
        />
      )}
      {overlay !== "none" && (
        <div
          className={cn(
            "absolute inset-0",
            overlay === "soft"
              ? "bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_30%,transparent),color-mix(in_oklab,var(--background)_55%,transparent))]"
              : "bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_55%,transparent),color-mix(in_oklab,var(--background)_82%,transparent))]"
          )}
        />
      )}
    </div>
  );
}
