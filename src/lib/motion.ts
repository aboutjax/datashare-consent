import { cn } from "@/lib/utils"

/** The steps of the flow, in the order they are walked through. */
export const steps = ["connect", "consent", "confirming"] as const

/** One step of the flow. */
export type Step = (typeof steps)[number]

/** Where a step sits relative to the one on screen. */
export type StepPosition = "before" | "active" | "after"

/**
 * The timing the anchored action block resizes with. Same half second and
 * same ease-out curve the steps crossfade on, so the block settling into its
 * new height reads as part of that one swap rather than a second event.
 */
export const settle = {
  duration: 0.5,
  ease: [0, 0, 0.2, 1],
} as const

/**
 * Everything that is not the step's copy: the badge and the plane. Their
 * entrance is held to the copy's beat by the caller, which reads it off the
 * dials rather than hard-coding it here.
 */
export function rise(position: StepPosition, delay?: string) {
  return cn(
    // `translate`, not `transform`: Tailwind v4 emits the movement as the
    // standalone translate property, which a transform transition ignores —
    // the offset would snap into place instead of easing.
    "transition-[opacity,translate] duration-500 ease-out motion-reduce:transition-none",
    position === "active" && cn("translate-y-0 opacity-100", delay),
    position === "before" && "translate-y-2 opacity-0",
    position === "after" && "-translate-y-2 opacity-0"
  )
}
