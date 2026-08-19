import { useEffect, useReducer, useState } from "react"
import { GrainGradient } from "@paper-design/shaders-react"
import { MotionConfig } from "motion/react"

import { ActionBento, type BentoBanner } from "@/components/action-bento"
import {
  ConfirmationAction,
  ConfirmationPanel,
} from "@/components/confirmation-panel"
import { ConnectAction, ConnectPanel } from "@/components/connect-panel"
import { ConsentAction, ConsentPanel } from "@/components/consent-panel"
import { OfferHeader, OfferIllustration } from "@/components/offer-illustration"
import { OfferAction, OfferPanel } from "@/components/offer-panel"
import { PlaidLinkDialog } from "@/components/plaid-link-dialog"
import { CardHeader, ShelfIllustration } from "@/components/shelf-illustration"
import { StepNav } from "@/components/step-nav"
import { defaultConnection, type BankConnection } from "@/lib/banks"
import { bankIdFromUrl } from "@/lib/deep-link"
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
 * qualifies the decision still to be made; on the offer step it carries the
 * offer's expiry as a `highlight` — the same brand tint as `pending` but
 * static, since a deadline is a fact, not a process. `reviewing` and
 * `connect` carry none — the bento stands on its own there.
 */
const banners: Record<"consent" | "offer", BentoBanner> = {
  consent: {
    tone: "note",
    text: "You can opt out of this at any time before activating a Nav Credit Builder Card in Settings → Bank accounts.",
  },
  offer: {
    tone: "highlight",
    text: "Offer expires in 3 days",
  },
}

export function ConsentCard() {
  const [linkOpen, setLinkOpen] = useState(false)
  // Replaying remounts the copy, which is the only way to watch an entrance
  // again without walking the flow back to the step before it.
  const [take, replay] = useReducer((n: number) => n + 1, 0)

  const { step: phase, plan, goTo, goToPlan } = useFlowDials(replay)
  // Every bank linked so far, oldest first — an array rather than one slot
  // because "Add another bank" doesn't replace what's already connected, it
  // adds to it.
  const [connections, setConnections] = useState<BankConnection[]>([])

  // `connect` is skippable — a deep link can open straight on `consent` or
  // `reviewing`, and the dev dial can jump there too — so once the flow is
  // past it without a real connection, a stand-in one is shown rather than
  // leaving the steps after it talking about a bank nobody linked. Derived
  // rather than stored: the moment Plaid hands back a real connection,
  // `connections` itself carries it and this stops applying.
  const shownConnections =
    connections.length > 0
      ? connections
      : phase === "connect"
        ? []
        : [defaultConnection(bankIdFromUrl())]

  // What `reviewing`'s action line is based on: every account across every
  // bank linked so far, the same total the consent step spells out in its own
  // row — just folded into the action here instead of repeated as one.
  const accountCount = shownConnections.reduce(
    (total, each) => total + each.accounts.length,
    0
  )

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
      <StepNav step={phase} goTo={goTo} plan={plan} goToPlan={goToPlan} />

      {/* The illustration carries across the three climbing steps, so it is
          rendered once here rather than inside each one: crossfading three
          copies of it would stack their half-transparent selves and wash the
          panel out mid-swap — and the card could not climb continuously if
          each step drew its own. `offer` swaps in a wholly different
          composition instead of a fourth rung on this one — see
          `offer-illustration.tsx`. */}
      {/* Wide, the floor is the tallest reading panel (connect's, which
          carries the credit-card art) plus the tallest action block
          (consent's, whose action carries the checkbox as well as the
          button) — the two don't belong to the same step, so the floor has
          to cover both rather than either alone, or consent would outgrow it
          by the difference between its own copy and connect's. With that
          covered, the panel is that height on every step and never resizes
          as the flow advances: only the action block moves, and the reading
          area above absorbs the difference.

          Narrow there is no floor. Holding the same height there would leave
          the first step with 150px of nothing between its copy and its button,
          and on a phone that reads as a broken card rather than as breathing
          room. Each step is its own height instead, and the panel's lower edge
          moves with the action. */}
      {/* `group` so the illustration can watch the action beside it: the card
          leans towards whoever is reaching for the connect button. */}
      <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-card shadow-raised lg:min-h-129 lg:flex-row">
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
          speed={2}
          scale={3}
        />

        {/* Narrow, the artwork and the lockup head the panel, full bleed: the
            wide layout has a column beside the copy to carry both, and this
            one does not. Outside the padded column for that reason — the band
            runs to the panel's own edges. */}
        {phase === "offer" ? <OfferHeader /> : <CardHeader step={phase} />}

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
              className={slot(positionOf("reviewing", phase))}
              inert={phase !== "reviewing"}
            >
              <ConfirmationPanel position={positionOf("reviewing", phase)} />
            </div>

            <div
              className={slot(positionOf("offer", phase))}
              inert={phase !== "offer"}
            >
              <OfferPanel position={positionOf("offer", phase)} plan={plan} />
            </div>
          </div>

          {/* The anchored slot: every step's action lives in the same bento,
              so only what's inside crossfades as the flow advances rather
              than the frame around it. */}
          <ActionBento
            connections={
              phase === "reviewing" || phase === "offer"
                ? undefined
                : shownConnections
            }
            onAddBank={() => setLinkOpen(true)}
            stepKey={phase === "offer" ? `offer-${plan}` : phase}
            banner={
              phase === "consent"
                ? banners.consent
                : phase === "offer"
                  ? banners.offer
                  : undefined
            }
          >
            {phase === "connect" ? (
              <ConnectAction onConnect={() => setLinkOpen(true)} />
            ) : phase === "consent" ? (
              <ConsentAction onSubmit={() => goTo("reviewing")} />
            ) : phase === "reviewing" ? (
              <ConfirmationAction accountCount={accountCount} />
            ) : (
              <OfferAction plan={plan} />
            )}
          </ActionBento>
        </div>

        {phase === "offer" ? (
          <OfferIllustration />
        ) : (
          <ShelfIllustration step={phase} />
        )}
      </div>

      <PlaidLinkDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        onComplete={(next) => {
          // Appended, not replaced: "Add another bank" from consent or
          // reviewing raises the connected count in place rather than
          // starting the list over. Only the first one — walked from
          // `connect` itself — also carries the flow forward, since a later
          // add happens after that decision is already made.
          setConnections((current) => [...current, next])
          setLinkOpen(false)
          if (phase === "connect") goTo("consent")
        }}
      />
    </MotionConfig>
  )
}
