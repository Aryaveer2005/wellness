import "server-only";
import config from "./expression-prompts.json";

/**
 * "Suggested expression" images (FLUX.2 klein) — server-only.
 * Users never send prompt text; they only pick a situation id.
 *
 * Realistic since 2026-10-21 (owner request), see docs/AI_CHATBOT.md §3:
 * - Photorealistic close-ups of an adult Indian man, framed from mid-forehead to just below
 *   the chin. The app ALSO crops the top ~16% when displaying (object-position 50% 85%),
 *   so the hairline is never shown — important for an audience dealing with hair loss.
 * - The model is deterministic for prompt + seed + size + steps, so only seeds checked by
 *   eye are used. If you change ANY prompt text in the JSON, re-verify the seeds.
 * - Labelled in the UI as "AI-generated photo · not a real person · not saved".
 */

type Situation = { expression: string; seeds: number[] };

const situations = config.situations as Record<string, Situation>;

export const EXPRESSION_IDS = Object.keys(situations) as [string, ...string[]];
export const EXPRESSION_WIDTH = config.width;
export const EXPRESSION_HEIGHT = config.height;
export const EXPRESSION_STEPS = config.steps;

export function expressionPrompt(id: string): string {
  return config.prefix + situations[id].expression + config.suffix;
}

/** A verified seed, avoiding `exclude` when there's a choice (for "Show another drawing"). */
export function pickSeed(id: string, exclude?: number): number {
  const pool = situations[id].seeds.filter((s) => s !== exclude);
  const list = pool.length ? pool : situations[id].seeds;
  return list[Math.floor(Math.random() * list.length)];
}
