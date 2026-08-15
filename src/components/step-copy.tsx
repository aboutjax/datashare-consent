import { useState, type ComponentProps } from "react"
import { motion, useReducedMotionConfig, type Variants } from "motion/react"

import { type StepPosition } from "@/lib/motion"
import { useStepCopyMotion, type PendingCopyMotion } from "@/lib/step-motion"
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
 * A phrase broken into the units an effect animates. Words are separated by
 * real text nodes rather than padding on the spans, so the line still has
 * somewhere to break and `text-balance` still balances it; a word split into
 * characters stays one inline-block, so it never breaks mid-word.
 */
function SplitPhrase({
  text,
  split,
  unit,
}: {
  text: string
  split: "per-word" | "per-character"
  unit: Variants
}) {
  const reduced = useReducedMotionConfig()

  // Blur is not vestibular motion, but it is still motion the reader asked not
  // to see; without it the units simply fade.
  const style = reduced ? { filter: "none" } : undefined

  return (
    // Empty tokens are dropped: an edited phrase can arrive mid-word or with a
    // trailing space, and a blank unit would still take a turn in the stagger.
    <>
      {text
        .split(/\s+/)
        .filter(Boolean)
        .map((word, index) => (
          // Left inline on purpose: the space below is only a break opportunity
          // while it sits in the inline flow, not inside an inline-block.
          <span key={`${word}-${index}`}>
            {index > 0 && " "}
            {split === "per-character" ? (
              Array.from(word).map((character, position) => (
                <motion.span
                  key={`${character}-${position}`}
                  className="inline-block will-change-[transform,filter,opacity]"
                  variants={unit}
                  style={style}
                >
                  {character}
                </motion.span>
              ))
            ) : (
              <motion.span
                className="inline-block will-change-[transform,filter,opacity]"
                variants={unit}
                style={style}
              >
                {word}
              </motion.span>
            )}
          </span>
        ))}
    </>
  )
}

/**
 * A phrase that is replaced in place rather than with its step: it enters when
 * mounted and, under `AnimatePresence`, leaves when it is dropped. The delay is
 * the caller's, because only the caller knows what is still occupying the slot.
 */
export function SwapPhrase({
  text,
  motion: contract,
  delay,
  className,
  // `popLayout` measures the leaving phrase and hands it back a ref and a pop
  // id to position it by. Swallowing those props leaves it in the flow.
  ...rest
}: {
  text: string
  motion: PendingCopyMotion
  delay: number
} & ComponentProps<typeof motion.span>) {
  return (
    <motion.span
      {...rest}
      // Inline-block so `popLayout` can lift the leaving phrase out of the
      // flow: an inline box cannot be positioned, so the two would stack and
      // the slot would grow by a line for the length of every swap.
      className={cn("inline-block", className)}
      variants={contract.container}
      custom={delay}
      initial="before"
      animate="active"
      exit="after"
    >
      <SplitPhrase text={text} split={contract.split} unit={contract.unit} />
    </motion.span>
  )
}

/** The step's title, split into the units the chosen effect animates. */
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
  const delay = useSwapDelay(position, heading.delay)

  return (
    <motion.h2
      className={cn("text-balance", className)}
      variants={heading.container}
      custom={delay}
      initial="before"
      animate={position}
    >
      <SplitPhrase text={children} split={heading.split} unit={heading.unit} />
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
