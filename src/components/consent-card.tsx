import { useState } from "react"
import { AnimatePresence, motion, MotionConfig } from "motion/react"

import { ActionBento, type BentoBanner } from "@/components/action-bento"
import {
  ConfirmationAction,
  ConfirmationPanel,
} from "@/components/confirmation-panel"
import { ConnectAction, ConnectPanel } from "@/components/connect-panel"
import { ConsentAction, ConsentPanel } from "@/components/consent-panel"
import { PlaidLinkDialog } from "@/components/plaid-link-dialog"
import { ShelfIllustration } from "@/components/shelf-illustration"
import { type BankConnection } from "@/lib/banks"
import { settle, steps, type Step, type StepPosition } from "@/lib/motion"
import { cn } from "@/lib/utils"

function positionOf(step: Step, current: Step): StepPosition {
  const distance = steps.indexOf(step) - steps.indexOf(current)
  if (distance === 0) return "active"
  return distance < 0 ? "after" : "before"
}

/**
 * Fades a step in and out; the content inside it carries the movement. The
 * outgoing step clears faster than the incoming one arrives, so the two never
 * sit on top of each other at half strength.
 */
function fade(position: StepPosition) {
  return cn(
    "col-start-1 row-start-1 transition-opacity ease-out motion-reduce:transition-none",
    position === "active"
      ? "opacity-100 delay-150 duration-500"
      : "opacity-0 duration-200"
  )
}

/**
 * The banner belongs to the step, not to the bento: on the consent step it
 * qualifies the decision still to be made, and once that decision is made it
 * reports what the decision set off.
 */
const banners: Record<"consent" | "confirming", BentoBanner> = {
  consent: {
    tone: "note",
    text: "You can opt out of this anytime in Settings → Bank accounts.",
  },
  confirming: { tone: "pending", text: "Checking your eligibility..." },
}

export function ConsentCard() {
  const [phase, setPhase] = useState<Step>("connect")
  const [linkOpen, setLinkOpen] = useState(false)
  const [connection, setConnection] = useState<BankConnection | null>(null)

  return (
    // One transition for everything motion drives, and reduced motion is
    // honoured centrally rather than per element.
    <MotionConfig transition={settle} reducedMotion="user">
      {/* The illustration carries across every step, so it is rendered once
          here rather than inside each one: crossfading three copies of it
          would stack their half-transparent selves and wash the panel out
          mid-swap — and the card could not climb continuously if each step
          drew its own. */}
      <div className="relative flex overflow-hidden rounded-2xl bg-card shadow-raised lg:min-h-100">
        <div className="z-10 flex min-w-0 flex-1 flex-col gap-3 p-6">
          {/* The steps' copy shares one grid cell, so the reading area is as
              tall as the longest of them and does not resize between steps.
              Only the action below it changes height. */}
          <div className="grid min-w-0 flex-1">
            <div
              className={fade(positionOf("connect", phase))}
              inert={phase !== "connect"}
            >
              <ConnectPanel position={positionOf("connect", phase)} />
            </div>

            <div
              className={fade(positionOf("consent", phase))}
              inert={phase !== "consent"}
            >
              <ConsentPanel position={positionOf("consent", phase)} />
            </div>

            <div
              className={fade(positionOf("confirming", phase))}
              inert={phase !== "confirming"}
            >
              <ConfirmationPanel position={positionOf("confirming", phase)} />
            </div>
          </div>

          {/* The anchored slot. `popLayout` takes the outgoing action out of
              flow the moment it starts leaving, so the block below settles to
              its new height once rather than waiting for the fade. */}
          <AnimatePresence mode="popLayout" initial={false}>
            {phase === "connect" ? (
              <motion.div
                key="connect"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ConnectAction onConnect={() => setLinkOpen(true)} />
              </motion.div>
            ) : (
              <ActionBento
                key="bento"
                connection={connection}
                stepKey={phase}
                banner={banners[phase]}
              >
                {phase === "consent" ? (
                  <ConsentAction onSubmit={() => setPhase("confirming")} />
                ) : (
                  <ConfirmationAction />
                )}
              </ActionBento>
            )}
          </AnimatePresence>
        </div>

        <ShelfIllustration step={phase} />
      </div>

      <PlaidLinkDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        onComplete={(next) => {
          setConnection(next)
          setLinkOpen(false)
          setPhase("consent")
        }}
      />
    </MotionConfig>
  )
}
