import { useState } from "react"
import { motion, useReducedMotionConfig } from "motion/react"

import { type StepPosition } from "@/lib/motion"
import { useStepCopyMotion } from "@/lib/step-motion"
import { cn } from "@/lib/utils"

/**
 * The entrance delay only exists to let the outgoing step clear the slot. The
 * step that is already on screen at first paint has nothing to wait for, so
 * its copy arrives straight away rather than after half a second of empty card.
 */
function useSwapDelay(position: StepPosition, delay: number) {
  const [openedOnThisStep] = useState(position === "active")

  return openedOnThisStep ? 0 : delay
}

/**
 * The step's title, split into the units the chosen effect animates. Words are
 * separated by real text nodes rather than padding on the spans, so the line
 * still has somewhere to break and `text-balance` still balances it; a word
 * split into characters stays one inline-block, so it never breaks mid-word.
 */
export function StepHeading({
  position,
  className,
  children,
}: {
  position: StepPosition
  className?: string
  children: string
}) {
  const { heading } = useStepCopyMotion()
  const reduced = useReducedMotionConfig()
  const delay = useSwapDelay(position, heading.delay)

  // Blur is not vestibular motion, but it is still motion the reader asked not
  // to see; without it the units simply fade.
  const style = reduced ? { filter: "none" } : undefined

  return (
    <motion.h2
      className={cn("text-balance", className)}
      variants={heading.container}
      custom={delay}
      initial="before"
      animate={position}
    >
      {/* Empty tokens are dropped: an edited heading can arrive mid-word or
          with a trailing space, and a blank unit would still take a turn in
          the stagger. */}
      {children
        .split(/\s+/)
        .filter(Boolean)
        .map((word, index) => (
          // Left inline on purpose: the space below is only a break opportunity
          // while it sits in the inline flow, not inside an inline-block.
          <span key={`${word}-${index}`}>
            {index > 0 && " "}
            {heading.split === "per-character" ? (
              Array.from(word).map((character, position) => (
                <motion.span
                  key={`${character}-${position}`}
                  className="inline-block will-change-[transform,filter,opacity]"
                  variants={heading.unit}
                  style={style}
                >
                  {character}
                </motion.span>
              ))
            ) : (
              <motion.span
                className="inline-block will-change-[transform,filter,opacity]"
                variants={heading.unit}
                style={style}
              >
                {word}
              </motion.span>
            )}
          </span>
        ))}
    </motion.h2>
  )
}

/**
 * The step's supporting copy. It runs as one block: at forty-odd words,
 * staggering it would outlast the swap it belongs to.
 */
export function StepBody({
  position,
  className,
  children,
}: {
  position: StepPosition
  className?: string
  children: React.ReactNode
}) {
  const { body } = useStepCopyMotion()
  const delay = useSwapDelay(position, body.delay)

  return (
    <motion.p
      className={className}
      variants={body.variants}
      custom={delay}
      initial="before"
      animate={position}
    >
      {children}
    </motion.p>
  )
}
