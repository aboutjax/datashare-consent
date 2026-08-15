/**
 * Presets from the `animate-text` catalog, transcribed from its portable motion
 * contracts (`assets/specs/<id>.json`). These are the raw spec values, not the
 * catalog website's playback timings: that runtime scales everything by 0.72
 * and shortens the travel to fit a looping demo tile.
 *
 * Everything here is a starting point. The dial panel edits the live values;
 * picking a preset only reloads this set into the dials.
 */

export type Bezier = [number, number, number, number]

/** One end of an effect: where the text comes from, or where it goes. */
export type Phase = {
  durationMs: number
  staggerMs: number
  ease: Bezier
  /** Offset the text travels from (enter) or to (exit), in pixels. */
  y: number
  blur: number
  scale: number
}

/**
 * The spec's `swap` block: how one phrase hands the slot to the next. The
 * incoming phrase starts at `exit total - overlap + microDelay`, so a
 * crossfade keeps both layers alive for a moment and a sequential swap leaves
 * a beat of empty slot between them.
 */
export type Swap = {
  mode: "crossfade" | "sequential"
  overlapMs: number
  microDelayMs: number
}

export type TextEffect = {
  id: string
  label: string
  /** The unit the spec animates. Splitting the copy any finer misreads it. */
  target: "per-word" | "per-character" | "whole"
  enter: Phase
  exit: Phase
  swap: Swap
}

function phase(p: Partial<Phase> & Pick<Phase, "durationMs" | "ease">): Phase {
  return { staggerMs: 0, y: 0, blur: 0, scale: 1, ...p }
}

function swap(s: Partial<Swap>): Swap {
  return { mode: "crossfade", overlapMs: 0, microDelayMs: 0, ...s }
}

/**
 * Effects that split the line. Offered for the heading, which is short enough
 * that a stagger finishes inside the swap.
 */
export const headingEffects: Record<string, TextEffect> = {
  "blur-out-up": {
    id: "blur-out-up",
    label: "Blur Out Up",
    target: "per-word",
    enter: phase({
      durationMs: 560,
      staggerMs: 28,
      ease: [0.22, 1, 0.36, 1],
      y: 10,
      blur: 6,
    }),
    exit: phase({
      durationMs: 480,
      staggerMs: 24,
      ease: [0.64, 0, 0.78, 0],
      y: -14,
      blur: 8,
    }),
    swap: swap({ overlapMs: 170, microDelayMs: 35 }),
  },
  "soft-blur-in": {
    id: "soft-blur-in",
    label: "Soft Blur",
    // Per-word rather than the spec's per-character: the spec itself switches
    // target above 40 characters, and these headings run to 49.
    target: "per-word",
    enter: phase({
      durationMs: 900,
      staggerMs: 25,
      ease: [0.22, 1, 0.36, 1],
      y: 16,
      blur: 12,
    }),
    exit: phase({
      durationMs: 600,
      staggerMs: 15,
      ease: [0.64, 0, 0.78, 0],
      y: -16,
      blur: 12,
    }),
    swap: swap({ overlapMs: 300 }),
  },
  "per-word-crossfade": {
    id: "per-word-crossfade",
    label: "Per-Word Crossfade",
    target: "per-word",
    enter: phase({
      durationMs: 700,
      staggerMs: 70,
      ease: [0.16, 1, 0.3, 1],
      y: 8,
    }),
    exit: phase({
      durationMs: 500,
      staggerMs: 40,
      ease: [0.7, 0, 0.84, 0],
      y: -6,
    }),
    swap: swap({ overlapMs: 170, microDelayMs: 70 }),
  },
  "spring-scale-in": {
    id: "spring-scale-in",
    label: "Spring Scale In",
    target: "per-word",
    enter: phase({
      durationMs: 360,
      staggerMs: 95,
      ease: [0.34, 1.56, 0.64, 1],
      scale: 0.7,
    }),
    exit: phase({
      durationMs: 200,
      staggerMs: 80,
      ease: [0.7, 0, 0.84, 0],
      scale: 0.8,
    }),
    swap: swap({ microDelayMs: 35 }),
  },
  "per-character-rise": {
    id: "per-character-rise",
    label: "Per-Character Rise",
    target: "per-character",
    enter: phase({
      durationMs: 700,
      staggerMs: 24,
      ease: [0.2, 0.8, 0.2, 1],
      y: 32,
    }),
    exit: phase({
      durationMs: 420,
      staggerMs: 14,
      ease: [0.7, 0, 0.84, 0],
      y: -24,
    }),
    swap: swap({ overlapMs: 210 }),
  },
  "bottom-up-letters": {
    id: "bottom-up-letters",
    label: "Bottom Up Letters",
    target: "per-character",
    enter: phase({
      durationMs: 400,
      staggerMs: 88,
      ease: [0.18, 1, 0.32, 1],
      y: 46,
    }),
    exit: phase({
      durationMs: 280,
      staggerMs: 28,
      ease: [0.7, 0, 0.84, 0],
      y: -14,
    }),
    swap: swap({ mode: "sequential", microDelayMs: 35 }),
  },
  "top-down-letters": {
    id: "top-down-letters",
    label: "Top Down Letters",
    target: "per-character",
    enter: phase({
      durationMs: 400,
      staggerMs: 88,
      ease: [0.18, 1, 0.32, 1],
      y: -46,
    }),
    exit: phase({
      durationMs: 280,
      staggerMs: 28,
      ease: [0.7, 0, 0.84, 0],
      y: 14,
    }),
    swap: swap({ mode: "sequential", microDelayMs: 35 }),
  },
}

/**
 * Whole-phrase effects. Offered for the body copy, which at forty-odd words
 * would still be arriving after the next step had asked its question.
 */
export const bodyEffects: Record<string, TextEffect> = {
  "scale-down-fade": {
    id: "scale-down-fade",
    label: "Scale Down Fade",
    target: "whole",
    enter: phase({
      durationMs: 520,
      ease: [0.22, 1, 0.36, 1],
      y: 8,
      scale: 1.04,
    }),
    exit: phase({
      durationMs: 380,
      ease: [0.64, 0, 0.78, 0],
      y: -8,
      scale: 0.94,
    }),
    swap: swap({ overlapMs: 130, microDelayMs: 20 }),
  },
  "focus-blur-resolve": {
    id: "focus-blur-resolve",
    label: "Focus Blur Resolve",
    target: "whole",
    enter: phase({
      durationMs: 760,
      ease: [0.22, 1, 0.36, 1],
      y: 14,
      blur: 14,
      scale: 1.01,
    }),
    exit: phase({
      durationMs: 520,
      ease: [0.64, 0, 0.78, 0],
      y: -10,
      blur: 10,
    }),
    swap: swap({ overlapMs: 160, microDelayMs: 35 }),
  },
  "micro-scale-fade": {
    id: "micro-scale-fade",
    label: "Micro Scale Fade",
    target: "whole",
    enter: phase({ durationMs: 600, ease: [0.32, 0.72, 0, 1], scale: 0.96 }),
    exit: phase({ durationMs: 400, ease: [0.7, 0, 0.84, 0], scale: 0.96 }),
    swap: swap({ microDelayMs: 20 }),
  },
  "fade-through": {
    id: "fade-through",
    label: "Fade Through",
    target: "whole",
    enter: phase({
      durationMs: 420,
      ease: [0.2, 0, 0, 1],
      y: 6,
      blur: 2,
      scale: 0.99,
    }),
    exit: phase({ durationMs: 260, ease: [0.4, 0, 1, 1], y: -4 }),
    swap: swap({ overlapMs: 20, microDelayMs: 60 }),
  },
}

/**
 * The whole catalog, for the pending line: it is neither a heading nor a
 * paragraph, and a phrase that short can carry either half of the library.
 */
export const allEffects: Record<string, TextEffect> = {
  ...headingEffects,
  ...bodyEffects,
}

export const defaultHeadingEffect = "blur-out-up"
export const defaultBodyEffect = "scale-down-fade"
export const defaultPendingEffect = "soft-blur-in"

/** Effect ids as `{ value, label }`, for a dial's select control. */
export function effectOptions(effects: Record<string, TextEffect>) {
  return Object.values(effects).map((e) => ({ value: e.id, label: e.label }))
}

/**
 * How long a phase takes end to end: the last unit only starts once every unit
 * before it has. This is what an incoming phrase waits out, minus the overlap
 * it is allowed to steal, and what a cycling line has to leave room for.
 */
export function phaseTotalMs(
  { durationMs, staggerMs }: Pick<Phase, "durationMs" | "staggerMs">,
  unitCount: number
) {
  return durationMs + Math.max(0, unitCount - 1) * staggerMs
}

/** How the units of a phrase are counted, given the split the effect uses. */
export function splitUnits(text: string, split: "per-word" | "per-character") {
  const words = text.split(/\s+/).filter(Boolean)

  return split === "per-character"
    ? words.reduce((total, word) => total + word.length, 0)
    : words.length
}
