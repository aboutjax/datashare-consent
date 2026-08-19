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
          Connecting more bank accounts gives us a fuller picture of your
          revenue and may help you qualify. If you get an offer, upgrade to an
          eligible Nav Prime plan to apply.
        </StepBody>
      </div>
    </div>
  )
}

/** Neutral, and it leads nowhere in the flow: the review is already running,
 *  so the only thing offered is the count of what's being reviewed and a way
 *  back to the connections already made. The count lives here rather than in
 *  a banner — there's no aside to make about a box that only states a fact. */
export function ConfirmationAction({
  accountCount,
}: {
  accountCount: number
}) {
  return (
    <>
      <p className="type-body-2-emphasized text-foreground">
        Reviewing {accountCount} connected bank account
        {accountCount === 1 ? "" : "s"}
      </p>

      <Button
        size="lg"
        className="h-8 w-full rounded-[6px] bg-surface-container-highest type-body-2-emphasized text-foreground shadow-raised hover:bg-secondary lg:h-12 lg:type-body-1-emphasized"
      >
        Manage bank connections
      </Button>
    </>
  )
}
