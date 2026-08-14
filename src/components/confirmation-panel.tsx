import { StepBody, StepHeading } from "@/components/step-copy"
import { Button } from "@/components/ui/button"
import { rise, type StepPosition } from "@/lib/motion"
import { useStepCopyMotion, useStepHeading } from "@/lib/step-motion"
import { cn } from "@/lib/utils"

const confirmation = "/assets/confirmation.png"

/** The last step: the sharing is done, and the review it started runs on
 *  without the reader. Nothing here asks for anything. */
export function ConfirmationPanel({ position }: { position: StepPosition }) {
  const { heading } = useStepCopyMotion()
  const title = useStepHeading("confirming")

  return (
    <div className="flex flex-col gap-3">
      {/* A beat ahead of the heading, the way the permission picture leads the
          step before it: the confirmation is the picture, and the words
          explain it. */}
      <img
        src={confirmation}
        alt=""
        className={cn("size-20 max-w-none object-contain", rise(position))}
        style={
          position === "active"
            ? { transitionDelay: `${Math.max(0, heading.delay - 0.05)}s` }
            : undefined
        }
      />

      <div className="flex flex-col gap-2">
        <StepHeading
          position={position}
          className="type-title-1-emphasized text-foreground"
        >
          {title}
        </StepHeading>
        <StepBody
          position={position}
          className="type-body-2 text-balance text-muted-foreground"
        >
          We review your eligibility automatically. Connecting more bank
          accounts gives us a fuller picture of your revenue and may help you
          qualify.
        </StepBody>
      </div>
    </div>
  )
}

/** Neutral, and it leads nowhere in the flow: the review is already running,
 *  so the only thing left to offer is a way back to the connection. */
export function ConfirmationAction() {
  return (
    <Button
      size="lg"
      className="h-12 w-full rounded-[6px] bg-surface-container-highest type-body-2-emphasized text-foreground shadow-raised hover:bg-secondary"
    >
      Manage bank connections
    </Button>
  )
}
