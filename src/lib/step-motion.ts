import { useEffect, useMemo } from "react"
import {
  type DialConfig,
  type TransitionConfig,
  useDialKitController,
} from "dialkit"
import { type Transition, type Variants } from "motion/react"

import {
  bodyEffects,
  defaultBodyEffect,
  defaultHeadingEffect,
  effectOptions,
  headingEffects,
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
      default: "You\u2019re all set!",
      placeholder: "Confirmation heading",
    },
  },
} satisfies DialConfig

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
  const arrived = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }

  return {
    before: {
      opacity: 0,
      y: dials.enterY,
      scale: dials.enterScale,
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
      y: dials.exitY,
      scale: dials.exitScale,
      filter: `blur(${dials.exitBlur}px)`,
      transition: toMotion(dials.exit),
    },
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
        container: {
          before: {},
          active: (delay: number) => ({
            transition: {
              staggerChildren: h.enterStagger / 1000,
              delayChildren: delay,
            },
          }),
          after: { transition: { staggerChildren: h.exitStagger / 1000 } },
        },
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
