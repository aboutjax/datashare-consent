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
  const title = useStepHeading("reviewing")

  return (
    <div className="flex flex-col gap-3">
      {/* A beat ahead of the heading, the way the permission picture leads the
          step before it: the confirmation is the picture, and the words
          explain it. Narrow, the band at the head of the panel is already
          carrying a picture, and a second one under it would be one too
          many. */}
      <img
        src={confirmation}
        alt=""
        className={cn(
          "hidden max-w-none object-contain lg:block lg:size-20",
          rise(position)
        )}
        style={
          position === "active"
            ? { transitionDelay: `${Math.max(0, heading.delay - 0.05)}s` }
            : undefined
        }
      />

      <div className="flex flex-col gap-1 lg:gap-2">
        <StepHeading
          position={position}
          className="type-headline text-foreground lg:type-title-1-emphasized"
        >
          {title}
        </StepHeading>
        <StepBody
          position={position}
          className="type-body-2 text-balance text-muted-foreground"
        >
          We&rsquo;ll email you the moment an offer is available. Nothing
          here needs you, so you can close this page.
        </StepBody>
      </div>
    </div>
  )
}

/** Neutral, and it leads nowhere in the flow: the review is already running,
 *  so the only thing offered is a reason to add more and a way back to the
 *  connections already made. The count itself moved up into the banner —
 *  what's based on shouldn't repeat inside the box it's already fused to. */
export function ConfirmationAction() {
  return (
    <>
      <p className="type-body-2-emphasized text-foreground">
        Connecting every business bank account gives Parafin the most
        accurate picture of your cash flow, which may help you qualify.
      </p>

      <Button
        size="lg"
        className="h-8 w-full rounded-[6px] bg-surface-container-highest type-body-2-emphasized text-foreground shadow-raised hover:bg-secondary lg:h-12"
      >
        Manage bank accounts
      </Button>
    </>
  )
}
