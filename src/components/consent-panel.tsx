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
          it. */}
      <img
        src={needPermission}
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
          className="type-body-1 text-balance text-muted-foreground"
        >
          Parafin reviews your connected bank data to see what credit limit you
          may qualify for, based on your revenue, not your credit scores.
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
        className="h-12 w-full rounded-[6px] brand-sheen type-body-1-emphasized shadow-brand-raised hover:bg-primary hover:brightness-105"
      >
        Check my eligibility
      </Button>
    </>
  )
}
