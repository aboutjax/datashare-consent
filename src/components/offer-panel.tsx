import { StepBody, StepHeading } from "@/components/step-copy"
import { Button } from "@/components/ui/button"
import { rise, type Plan, type StepPosition } from "@/lib/motion"
import { useStepCopyMotion, useStepHeading } from "@/lib/step-motion"
import { cn } from "@/lib/utils"

const hiFive = "/assets/hi-five.png"
const primeMark = "/assets/nav-prime-mark.svg"

/** What the offer is conditioned on, in the reader's own plan. `free` still
 *  has a plan to join before the offer is theirs to take; `prime` already
 *  cleared that and can go straight at the application. */
const body: Record<Plan, string> = {
  free: "Join an eligible Nav Prime plan to apply. We base your offer on your revenue and other underwriting criteria. No business or personal credit checks.",
  prime:
    "Apply in a few steps. We base your offer on your revenue and other criteria. No business or personal credit checks.",
}

/** The step an email brings a reader back to: the offer the review in
 *  `reviewing` was building towards. Two flavors of the same fact, not two
 *  steps — what's pre-approved doesn't change with the plan, only whether
 *  applying for it is one click away or behind an upgrade first. */
export function OfferPanel({
  position,
  plan,
}: {
  position: StepPosition
  plan: Plan
}) {
  const { heading } = useStepCopyMotion()
  const title = useStepHeading("offer")

  return (
    <div className="flex flex-col gap-3">
      {/* A beat ahead of the heading, the way every other step's art leads
          its own. */}
      <img
        src={hiFive}
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
        {/* Keyed by plan rather than by step: the two flavors are different
            sentences, not a changed detail inside the same one, so a plan
            flip is meant to replay the swap rather than let new words land
            silently under copy already on screen. */}
        <StepBody
          key={plan}
          position={position}
          className="type-body-2 text-balance text-muted-foreground lg:type-body-1"
        >
          {body[plan]}
        </StepBody>
      </div>
    </div>
  )
}

/** The credit line the offer is for, and the one action it leads to — apply
 *  outright on `prime`, or clear the plan that unlocks it on `free`. Reaching
 *  for either lifts the card the way reaching for `connect`'s button does:
 *  this is the climb's own last inch. */
export function OfferAction({ plan }: { plan: Plan }) {
  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="type-caption-1-uppercase text-primary">
          Your pre-approved credit limit
        </p>
        <p className="flex items-baseline gap-1">
          <span className="type-display-2-emphasized text-foreground">
            $12,000
          </span>
        </p>
      </div>

      {plan === "free" ? (
        <Button
          data-card-hint
          className="h-8 w-full gap-1.5 rounded-[6px] prime-sheen type-body-2-emphasized shadow-brand-raised hover:brightness-105 lg:h-12 lg:type-body-1-emphasized"
        >
          <img src={primeMark} alt="" className="size-4" />
          Upgrade to apply
        </Button>
      ) : (
        <Button
          data-card-hint
          className="h-8 w-full rounded-[6px] brand-sheen type-body-2-emphasized shadow-brand-raised hover:bg-primary hover:brightness-105 lg:h-12 lg:type-body-1-emphasized"
        >
          Apply now
        </Button>
      )}
    </>
  )
}
