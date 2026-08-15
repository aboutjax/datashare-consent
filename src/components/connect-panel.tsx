import { StepBody, StepHeading } from "@/components/step-copy"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { rise, type StepPosition } from "@/lib/motion"
import { useStepCopyMotion, useStepHeading } from "@/lib/step-motion"
import { cn } from "@/lib/utils"

export function ConnectPanel({ position }: { position: StepPosition }) {
  const { heading } = useStepCopyMotion()
  const title = useStepHeading("connect")

  return (
    <div className="flex flex-col items-start gap-1 lg:gap-2">
      {/* Held to the same beat the copy waits for, so the badge leads the
          heading instead of arriving while the last step is still leaving. */}
      <Badge
        variant="warn"
        className={cn("h-5 px-1.5 lg:h-6 lg:px-2", rise(position))}
        style={
          position === "active"
            ? { transitionDelay: `${heading.delay}s` }
            : undefined
        }
      >
        No bank connected yet
      </Badge>

      <StepHeading
        position={position}
        className="type-headline text-foreground lg:type-title-1-emphasized"
      >
        {title}
      </StepHeading>

      <StepBody
        position={position}
        className="type-body-2 text-balance text-muted-foreground lg:type-body-1"
      >
        Your limit is based on your business&rsquo;s revenue and other
        underwriting criteria. It is reviewed regularly and can increase as your
        business grows. No business or personal credit checks required.
      </StepBody>
    </div>
  )
}

/** The only step whose action stands on its own: there is no connection to
 *  head it yet, so it is a bare button rather than the anchored bento. */
export function ConnectAction({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex w-full flex-col gap-3 lg:gap-2">
      {/* Marks this as the control the card answers to: reaching for it lifts
          the card a little out of its shelf, which is the climb this step ends
          in. The illustration finds it by attribute, so the two can sit in
          different corners of the layout without a prop between them. */}
      <Button
        data-card-hint
        onClick={onConnect}
        className="h-8 w-full rounded-[6px] brand-sheen type-body-2-emphasized shadow-brand-raised hover:bg-primary hover:brightness-105 lg:h-12 lg:type-body-1-emphasized"
      >
        Connect bank accounts
      </Button>
      <p className="w-full text-center type-caption-2 text-balance text-muted-foreground lg:type-caption-1">
        Bank-grade encryption via Plaid. We only read your transaction history.
      </p>
    </div>
  )
}
