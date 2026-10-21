"use client";

import { useEffect, useRef } from "react";
import { sound } from "@/lib/sound";

/**
 * Plays the rising progress tone whenever `value` moves forward (0…max),
 * and the completion chime when it reaches the end. Silent when going back.
 */
export function useProgressSound(value: number, max = 1, { chimeAtEnd = true } = {}) {
  const prev = useRef<number | null>(null);
  useEffect(() => {
    const p = max > 0 ? value / max : 0;
    if (prev.current !== null && p > prev.current) {
      if (p >= 1 && chimeAtEnd) sound.complete();
      else sound.progress(p);
    }
    prev.current = p;
  }, [value, max, chimeAtEnd]);
}
