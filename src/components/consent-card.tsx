import { useState } from "react"

import { CheckingPanel } from "@/components/checking-panel"
import { ConfirmationPanel } from "@/components/confirmation-panel"
import { ConnectPanel } from "@/components/connect-panel"
import { ConsentPanel } from "@/components/consent-panel"
import { PlaidLinkDialog } from "@/components/plaid-link-dialog"
import { ShelfIllustration } from "@/components/shelf-illustration"
import { type BankConnection } from "@/lib/banks"
import { steps, type Step, type StepPosition } from "@/lib/motion"
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

export function ConsentCard() {
  const [phase, setPhase] = useState<Step>("connect")
  const [linkOpen, setLinkOpen] = useState(false)
  const [connection, setConnection] = useState<BankConnection | null>(null)

  return (
    <>
      {/* The illustration carries across every step, so it is rendered once
          here rather than inside each one: crossfading three copies of it
          would stack their half-transparent selves and wash the panel out
          mid-swap — and the card could not climb continuously if each step
          drew its own. */}
      <div className="flex overflow-hidden rounded-2xl bg-card shadow-raised lg:min-h-100">
        {/* The steps share one grid cell, so the card is always as tall as
            the tallest of them and its height never changes between steps. */}
        <div className="grid min-w-0 flex-1">
          <div
            className={fade(positionOf("connect", phase))}
            inert={phase !== "connect"}
          >
            <ConnectPanel
              position={positionOf("connect", phase)}
              onConnect={() => setLinkOpen(true)}
            />
          </div>

          <div
            className={fade(positionOf("consent", phase))}
            inert={phase !== "consent"}
          >
            <ConsentPanel
              position={positionOf("consent", phase)}
              connection={connection}
              onSubmit={() => setPhase("confirming")}
            />
          </div>

          <div
            className={fade(positionOf("confirming", phase))}
            inert={phase !== "confirming"}
          >
            <ConfirmationPanel
              position={positionOf("confirming", phase)}
              onSubmit={() => setPhase("checking")}
            />
          </div>

          <div
            className={fade(positionOf("checking", phase))}
            inert={phase !== "checking"}
          >
            <CheckingPanel position={positionOf("checking", phase)} />
          </div>
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
    </>
  )
}
