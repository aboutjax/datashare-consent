import { useEffect, useMemo, useRef } from "react"
import {
  type DialConfig,
  type TransitionConfig,
  useDialKitController,
} from "dialkit"
import { type Transition, type Variants } from "motion/react"

import {
  allEffects,
  bodyEffects,
  defaultBodyEffect,
  defaultHeadingEffect,
  defaultPendingEffect,
  effectOptions,
  headingEffects,
  phaseTotalMs,
  splitUnits,
  type Phase,
  type TextEffect,
} from "@/lib/text-effects"
import { steps, type Step } from "@/lib/motion"

/** `[default, min, max, step?]`, kept as a tuple so DialKit reads it as a slider. */
function slider(...range: [number, number, number, number?]) {
  return range
}

function transition(phase: Phase) {
  return {
    type: "easing",
    duration: phase.durationMs / 1000,
    ease: phase.ease,
  } as const
}

const heading = headingEffects[defaultHeadingEffect]
const body = bodyEffects[defaultBodyEffect]

/**
 * Every property the two `animate-text` effects expose, as dials. The defaults
 * are the shipped preset; picking another one from `effect` reloads the rest of
 * the panel with that spec's values, which stay editable from there.
 *
 * One config shared by every caller: DialKit reference-counts a panel by name,
 * so the heading and body of all three steps read and write the same dials.
 */
const stepCopyConfig = {
  swap: {
    // The outgoing heading needs `duration + (words - 1) x stagger` to clear.
    // This is that total minus the overlap the incoming step may steal.
    enterDelay: slider(500, 0, 1500, 10),
    bodyOffset: slider(60, 0, 600, 10),
  },
  heading: {
    effect: {
      type: "select",
      options: effectOptions(headingEffects),
      default: defaultHeadingEffect,
    },
    split: {
      type: "select",
      options: ["per-word", "per-character"],
      default: heading.target,
    },
    enter: transition(heading.enter),
    enterStagger: slider(heading.enter.staggerMs, 0, 150, 1),
    enterY: slider(heading.enter.y, -60, 60, 1),
    enterBlur: slider(heading.enter.blur, 0, 24, 0.5),
    enterScale: slider(heading.enter.scale, 0.5, 1.5, 0.01),
    exit: transition(heading.exit),
    exitStagger: slider(heading.exit.staggerMs, 0, 150, 1),
    exitY: slider(heading.exit.y, -60, 60, 1),
    exitBlur: slider(heading.exit.blur, 0, 24, 0.5),
    exitScale: slider(heading.exit.scale, 0.5, 1.5, 0.01),
  },
  body: {
    effect: {
      type: "select",
      options: effectOptions(bodyEffects),
      default: defaultBodyEffect,
    },
    enter: transition(body.enter),
    enterY: slider(body.enter.y, -60, 60, 1),
    enterBlur: slider(body.enter.blur, 0, 24, 0.5),
    enterScale: slider(body.enter.scale, 0.5, 1.5, 0.01),
    exit: transition(body.exit),
    exitY: slider(body.exit.y, -60, 60, 1),
    exitBlur: slider(body.exit.blur, 0, 24, 0.5),
    exitScale: slider(body.exit.scale, 0.5, 1.5, 0.01),
  },
} satisfies DialConfig

const pending = allEffects[defaultPendingEffect]

/**
 * The pending line runs the same catalog, with the swap block the step copy
 * has no use for: nothing else in the flow replaces a phrase in a slot the
 * outgoing one still occupies.
 *
 * The defaults are `soft-blur-in` as its own spec asks to be used on copy like
 * this — split per word rather than per character, since the underwriting
 * lines run past the 40 characters where the spec says a character stagger
 * stops finishing in time, and blurred 6px rather than 12px, which is what it
 * calls for below 24px type.
 */
const pendingConfig = {
  effect: {
    type: "select",
    options: effectOptions(allEffects),
    default: defaultPendingEffect,
  },
  split: {
    type: "select",
    options: ["per-word", "per-character"],
    default: "per-word",
  },
  swap: {
    // How much of the outgoing phrase's exit the incoming one is allowed to
    // start under, and the beat that follows it.
    overlap: slider(pending.swap.overlapMs, 0, 900, 10),
    microDelay: slider(pending.swap.microDelayMs, 0, 600, 5),
    // The only value the catalog has no opinion on: it is the reading time,
    // not the motion. At the shipped spec it puts a line's whole beat near two
    // seconds, which is the coarser rhythm above the 0.8s banner stripes.
    hold: slider(1200, 0, 3000, 50),
  },
  enter: transition(pending.enter),
  enterStagger: slider(15, 0, 150, 1),
  enterY: slider(pending.enter.y, -60, 60, 1),
  enterBlur: slider(6, 0, 24, 0.5),
  enterScale: slider(pending.enter.scale, 0.5, 1.5, 0.01),
  exit: transition(pending.exit),
  exitStagger: slider(pending.exit.staggerMs, 0, 150, 1),
  exitY: slider(pending.exit.y, -60, 60, 1),
  exitBlur: slider(6, 0, 24, 0.5),
  exitScale: slider(pending.exit.scale, 0.5, 1.5, 0.01),
} satisfies DialConfig

const flowConfig = {
  step: { type: "select", options: [...steps], default: steps[0] },
  replay: { type: "action", label: "Replay entrance" },
} satisfies DialConfig

/**
 * The shipped headings, and the only copy in the flow that is editable at
 * runtime. They live here rather than in the panels because a dial's default
 * has to exist before anything renders — so this is the one place the words
 * are written, and the panels read them back.
 *
 * Length is the point of editing them: an effect that reads well across nine
 * words can fall apart at three, or take too long at twenty.
 */
const copyConfig = {
  connect: {
    heading: {
      type: "text",
      default: "See if you qualify for the Nav Credit Builder Card",
      placeholder: "Connect heading",
    },
  },
  consent: {
    heading: {
      type: "text",
      default: "You're almost there!",
      placeholder: "Consent heading",
    },
  },
  confirming: {
    heading: {
      type: "text",
      default: "You\u2019re all set! Offers can take up to 5 business days to process.",
      placeholder: "Confirmation heading",
    },
  },
} satisfies DialConfig

/** What a transition dial is worth in milliseconds, spring or curve. */
function durationMsOf(config: TransitionConfig) {
  return (
    (config.type === "spring"
      ? (config.visualDuration ?? 0.5)
      : config.duration) * 1000
  )
}

/** DialKit's transition control speaks its own dialect; Motion needs its own. */
function toMotion(config: TransitionConfig): Transition {
  if (config.type === "spring") {
    const { stiffness, damping, mass, visualDuration, bounce } = config
    return { type: "spring", stiffness, damping, mass, visualDuration, bounce }
  }
  return { duration: config.duration, ease: config.ease }
}

type PhaseDials = {
  enter: TransitionConfig
  enterY: number
  enterBlur: number
  enterScale: number
  exit: TransitionConfig
  exitY: number
  exitBlur: number
  exitScale: number
}

/**
 * `before` and `after` are where the text waits and where it goes; only the
 * transitions are attached, so a value's resting state stays in one place.
 *
 * The split heading takes its entrance delay from the container's
 * `delayChildren`; the body block, having no container, takes it as `custom`.
 */
function phaseVariants(
  dials: PhaseDials,
  { selfDelayed = false } = {}
): Variants {
  // `transform` as a full string rather than Motion's `y`/`scale` shorthands:
  // the shorthands animate on the main thread via `requestAnimationFrame` and
  // drop frames when the browser is busy. The string form is composited on
  // the GPU, so it stays smooth even while the card climb runs alongside it.
  const arrived = {
    opacity: 1,
    transform: "translateY(0px) scale(1)",
    filter: "blur(0px)",
  }

  return {
    before: {
      opacity: 0,
      transform: `translateY(${dials.enterY}px) scale(${dials.enterScale})`,
      filter: `blur(${dials.enterBlur}px)`,
    },
    active: selfDelayed
      ? (delay: number) => ({
        ...arrived,
        transition: { ...toMotion(dials.enter), delay },
      })
      : { ...arrived, transition: toMotion(dials.enter) },
    after: {
      opacity: 0,
      transform: `translateY(${dials.exitY}px) scale(${dials.exitScale})`,
      filter: `blur(${dials.exitBlur}px)`,
      transition: toMotion(dials.exit),
    },
  }
}

/**
 * The wrapper around a split phrase. It carries the stagger and the entrance
 * delay only; the units carry every value that moves.
 */
function staggerContainer(
  enterStaggerMs: number,
  exitStaggerMs: number
): Variants {
  return {
    before: {},
    active: (delay: number) => ({
      transition: {
        staggerChildren: enterStaggerMs / 1000,
        delayChildren: delay,
      },
    }),
    after: { transition: { staggerChildren: exitStaggerMs / 1000 } },
  }
}

/** The heading can only split by word or character; nothing else is offered. */
function splitOf(effect: TextEffect) {
  return effect.target === "per-character" ? "per-character" : "per-word"
}

/** The values a preset writes back into the panel when it is selected. */
function presetValues(effect: TextEffect) {
  return {
    enter: transition(effect.enter),
    enterY: effect.enter.y,
    enterBlur: effect.enter.blur,
    enterScale: effect.enter.scale,
    exit: transition(effect.exit),
    exitY: effect.exit.y,
    exitBlur: effect.exit.blur,
    exitScale: effect.exit.scale,
  }
}

export type StepCopyMotion = {
  heading: {
    /** Holds the stagger only; the words carry the movement. */
    container: Variants
    unit: Variants
    split: "per-word" | "per-character"
    delay: number
  }
  body: { variants: Variants; delay: number }
}

/** The live animation contract for a step's copy, as the dials currently read. */
export function useStepCopyMotion(): StepCopyMotion {
  // A fixed id, not the generated one: without it every heading and body
  // registers its own panel, and the reader gets six copies of the same dials.
  const dials = useDialKitController("Step copy", stepCopyConfig, {
    id: "step-copy",
  })
  const { swap, heading: h, body: b } = dials.values
  const { setValues } = dials

  // Selecting a preset is the only thing that overwrites the other dials, so
  // hand-tuned values survive every other change to the panel.
  const headingEffect = h.effect
  const bodyEffect = b.effect
  useEffect(() => {
    const picked = headingEffects[headingEffect]

    setValues({
      heading: { split: splitOf(picked), ...presetValues(picked) },
      body: presetValues(bodyEffects[bodyEffect]),
    })
  }, [headingEffect, bodyEffect, setValues])

  return useMemo(
    () => ({
      heading: {
        container: staggerContainer(h.enterStagger, h.exitStagger),
        unit: phaseVariants(h),
        split: h.split === "per-character" ? "per-character" : "per-word",
        delay: swap.enterDelay / 1000,
      },
      body: {
        variants: phaseVariants(b, { selfDelayed: true }),
        delay: (swap.enterDelay + swap.bodyOffset) / 1000,
      },
    }),
    [h, b, swap.enterDelay, swap.bodyOffset]
  )
}

export type PendingCopyMotion = {
  container: Variants
  unit: Variants
  split: "per-word" | "per-character"
  /** How long an arriving phrase waits for the slot the leaving one still holds. */
  enterDelayMs: (leaving: string) => number
  /** How long a phrase stays, counted from the moment it was handed the slot. */
  restMs: (arriving: string, enterDelayMs: number) => number
}

/**
 * The live animation contract for the cycling pending line.
 *
 * Its rhythm is derived rather than fixed: a phrase leaves, the next one
 * arrives under the tail of that exit, and only once it has fully landed does
 * the hold start counting. A slower effect, a longer phrase, or a character
 * split therefore buys itself the time it needs instead of being cut off by a
 * timer that was written for something quicker.
 */
export function usePendingCopyMotion(): PendingCopyMotion {
  const dials = useDialKitController("Pending line", pendingConfig, {
    id: "pending",
  })
  const { values, setValues } = dials
  const effect = values.effect

  // Not on the first run, unlike the step copy: the shipped values here are
  // the preset as its own notes ask for it at this size, and loading the
  // preset raw would throw that away before anything had been picked.
  const picked = useRef<string>(effect)
  useEffect(() => {
    if (picked.current === effect) return
    picked.current = effect

    const chosen = allEffects[effect]

    setValues({
      split: splitOf(chosen),
      swap: {
        overlap: chosen.swap.overlapMs,
        microDelay: chosen.swap.microDelayMs,
      },
      ...presetValues(chosen),
    })
  }, [effect, setValues])

  return useMemo(() => {
    const split =
      values.split === "per-character" ? "per-character" : "per-word"
    const units = (phrase: string) => splitUnits(phrase, split)

    const enterPhase = {
      durationMs: durationMsOf(values.enter),
      staggerMs: values.enterStagger,
    }
    const exitPhase = {
      durationMs: durationMsOf(values.exit),
      staggerMs: values.exitStagger,
    }

    return {
      container: staggerContainer(values.enterStagger, values.exitStagger),
      unit: phaseVariants(values),
      split,
      enterDelayMs: (leaving: string) =>
        Math.max(
          0,
          phaseTotalMs(exitPhase, units(leaving)) - values.swap.overlap
        ) + values.swap.microDelay,
      restMs: (arriving: string, enterDelayMs: number) =>
        enterDelayMs +
        phaseTotalMs(enterPhase, units(arriving)) +
        values.swap.hold,
    }
  }, [values])
}

/**
 * A step's heading, as the panel currently reads. Editing it re-splits the
 * line, and any unit whose word has changed enters again on the spot — which
 * is how you see what a phrase does to the effect rather than guessing.
 */
export function useStepHeading(step: Step) {
  const { values } = useDialKitController("Copy", copyConfig, { id: "copy" })

  return values[step].heading
}

/**
 * The step the card is showing. It lives in the panel rather than in component
 * state so the flow can be walked, or jumped around, without clicking through
 * it — and so advancing it from the card keeps the panel in step.
 */
export function useFlowDials(onReplay: () => void) {
  const dials = useDialKitController("Flow", flowConfig, {
    id: "flow",
    onAction: (action) => {
      if (action === "replay") onReplay()
    },
  })

  const { setValues } = dials

  return useMemo(
    () => ({
      step: dials.values.step as Step,
      goTo: (step: Step) => setValues({ step }),
    }),
    [dials.values.step, setValues]
  )
}
