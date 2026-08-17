import { useState } from "react"

import { StepBody, StepHeading } from "@/components/step-copy"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { rise, type StepPosition } from "@/lib/motion"
import { useStepCopyMotion, useStepHeading } from "@/lib/step-motion"
import { cn } from "@/lib/utils"

const needPermission = "/assets/need-permission.png"

export function ConsentPanel({ position }: { position: StepPosition }) {
  const { heading } = useStepCopyMotion()
  const title = useStepHeading("consent")

  return (
    <div className="flex flex-col gap-3">
      {/* A beat ahead of the heading, the way the plane leads the last step:
          the permission being asked for is the picture, and the words explain
          it. Narrow, the band at the head of the panel is already carrying a
          picture, and a second one under it would be one too many. */}
      <img
        src={needPermission}
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
          className="type-body-2 text-balance text-muted-foreground lg:type-body-1"
        >
          To see if you qualify, we need to share your bank data with Parafin,
          our card partner. Eligibility is based on your revenue and other
          underwriting criteria.
        </StepBody>
      </div>
    </div>
  )
}

/** The consent itself. The checkbox state lives here so it is discarded with
 *  the step rather than outliving the question it answers. */
export function ConsentAction({ onSubmit }: { onSubmit: () => void }) {
  const [checked, setChecked] = useState(false)

  return (
    <>
      <div className="flex items-start gap-2">
        {/* Matches the label's 20px line box so the control centers on the
            first line rather than the whole block. */}
        <span className="flex h-5 shrink-0 items-center">
          <Checkbox
            id="consent"
            checked={checked}
            onCheckedChange={setChecked}
            className="rounded-xs border-on-surface-dim focus-visible:ring-ring/30"
          />
        </span>
        <Label
          htmlFor="consent"
          className="cursor-pointer type-body-2 text-foreground"
        >
          <span>
            I have read and agree to the{" "}
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="underline decoration-muted-foreground/40 underline-offset-2 transition-colors hover:decoration-foreground"
            >
              Terms and Conditions.
            </a>
          </span>
        </Label>
      </div>

      <Button
        disabled={!checked}
        onClick={onSubmit}
        className="h-8 w-full rounded-[6px] brand-sheen type-body-2-emphasized shadow-brand-raised hover:bg-primary hover:brightness-105 disabled:bg-surface-dim disabled:bg-none disabled:text-on-surface-dim disabled:opacity-100 disabled:shadow-none lg:h-12 lg:type-body-1-emphasized"
      >
        Check my eligibility
      </Button>
    </>
  )
}
