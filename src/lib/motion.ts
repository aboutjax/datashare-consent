import { cn } from "@/lib/utils"

/** The steps of the flow, in the order they are walked through. */
export const steps = ["connect", "consent", "confirming", "checking"] as const

/** One step of the flow. */
export type Step = (typeof steps)[number]

/** Where a step sits relative to the one on screen. */
export type StepPosition = "before" | "active" | "after"

/**
 * Staggered entrance for the content of a step. Each element waits below the
 * line, rises into place when its step becomes active, then keeps travelling
 * up and out when the next step arrives — so the sequence reads as one
 * continuous climb rather than three unrelated screens.
 *
 * Only the content moves: the card and its illustration hold still.
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
