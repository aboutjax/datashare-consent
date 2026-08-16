import { useEffect, useReducer, useState } from "react"
import { GrainGradient } from "@paper-design/shaders-react"
import { AnimatePresence, motion, MotionConfig } from "motion/react"

import { ActionBento, type BentoBanner } from "@/components/action-bento"
import {
  ConfirmationAction,
  ConfirmationPanel,
} from "@/components/confirmation-panel"
import { ConnectAction, ConnectPanel } from "@/components/connect-panel"
import { ConsentAction, ConsentPanel } from "@/components/consent-panel"
import { PlaidLinkDialog } from "@/components/plaid-link-dialog"
import { CardHeader, ShelfIllustration } from "@/components/shelf-illustration"
import { type BankConnection } from "@/lib/banks"
import { settle, steps, type Step, type StepPosition } from "@/lib/motion"
import { useFlowDials } from "@/lib/step-motion"
import { cn } from "@/lib/utils"

function positionOf(step: Step, current: Step): StepPosition {
  const distance = steps.indexOf(step) - steps.indexOf(current)
  if (distance === 0) return "active"
  return distance < 0 ? "after" : "before"
}

/**
 * Stacks the steps in one cell. It deliberately does not fade them: every
 * element inside a step animates itself, and a wrapper fade would clip those
 * exits (the heading alone takes two thirds of a second to leave) and
 * double-fade whatever survived.
 */
function slot(position: StepPosition) {
  return cn(
    "col-start-1 row-start-1",
    position !== "active" && "pointer-events-none"
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
  const [linkOpen, setLinkOpen] = useState(false)
  const [connection, setConnection] = useState<BankConnection | null>(null)
  // Replaying remounts the copy, which is the only way to watch an entrance
  // again without walking the flow back to the step before it.
  const [take, replay] = useReducer((n: number) => n + 1, 0)

  const { step: phase, goTo } = useFlowDials(replay)

  // The shader has no ready event, and its canvas is transparent until WebGL
  // paints its first frame — so revealed immediately it would pop in over the
  // white card. Two frames (one to mount the canvas, one to paint it) is
  // enough for the gradient to be there before it is faded in.
  const [shaderReady, setShaderReady] = useState(false)
  useEffect(() => {
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setShaderReady(true))
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [])

  return (
    // One transition for everything motion drives, and reduced motion is
    // honoured centrally rather than per element.
    <MotionConfig transition={settle} reducedMotion="user">
      {/* The illustration carries across every step, so it is rendered once
          here rather than inside each one: crossfading three copies of it
          would stack their half-transparent selves and wash the panel out
          mid-swap — and the card could not climb continuously if each step
          drew its own. */}
      {/* Wide, the floor is the tallest step — consent, whose action carries
          the checkbox as well as the button — so the panel is that height on
          every step and never resizes as the flow advances: only the action
          block moves, and the reading area above absorbs the difference.

          Narrow there is no floor. Holding the same height there would leave
          the first step with 150px of nothing between its copy and its button,
          and on a phone that reads as a broken card rather than as breathing
          room. Each step is its own height instead, and the panel's lower edge
          moves with the action. */}
      {/* `group` so the illustration can watch the action beside it: the card
          leans towards whoever is reaching for the connect button. */}
      <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-card shadow-raised lg:min-h-122.5 lg:flex-row">
        {/* The card's backdrop: an animated grain gradient that fills the
            panel and sits behind both the shelf illustration and the reading
            column. `width`/`height` fill the card rather than using the
            playground's fixed 1280×720 canvas; the rest are the props as
            given. Aria-hidden and non-interactive — it is texture, not
            content. */}
        <GrainGradient
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none"
          style={{ opacity: shaderReady ? 1 : 0 }}
          width="100%"
          height="100%"
          colors={["#dedbff", "#d2e4d9"]}
          colorBack="#ffffff"
          softness={1}
          intensity={0}
          noise={0.21}
          shape="blob"
          speed={0.72}
          scale={2.4}
        />

        {/* Narrow, the artwork and the lockup head the panel, full bleed: the
            wide layout has a column beside the copy to carry both, and this
            one does not. Outside the padded column for that reason — the band
            runs to the panel's own edges. */}
        <CardHeader step={phase} />

        <div className="z-10 flex min-w-0 flex-1 flex-col gap-6 p-6 lg:gap-3">
          {/* The steps' copy shares one grid cell, so the reading area is as
                tall as the longest of them and does not resize between steps.
                Only the action below it changes height. */}
          <div key={take} className="grid min-w-0 flex-1">
            <div
              className={slot(positionOf("connect", phase))}
              inert={phase !== "connect"}
            >
              <ConnectPanel position={positionOf("connect", phase)} />
            </div>

            <div
              className={slot(positionOf("consent", phase))}
              inert={phase !== "consent"}
            >
              <ConsentPanel position={positionOf("consent", phase)} />
            </div>

            <div
              className={slot(positionOf("confirming", phase))}
              inert={phase !== "confirming"}
            >
              <ConfirmationPanel position={positionOf("confirming", phase)} />
            </div>
          </div>

          {/* The anchored slot. `popLayout` takes the outgoing action out of
                flow the moment it starts leaving, so the block below settles
                to its new height once rather than waiting for the fade. */}
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
                  <ConsentAction onSubmit={() => goTo("confirming")} />
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
          goTo("consent")
        }}
      />
    </MotionConfig>
  )
}
