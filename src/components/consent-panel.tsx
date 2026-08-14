import { useState } from "react"
import { CheckIcon } from "lucide-react"

import { BankMark } from "@/components/bank-mark"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { type BankConnection } from "@/lib/banks"
import { rise, type StepPosition } from "@/lib/motion"
import { cn } from "@/lib/utils"

export function ConsentPanel({
  position,
  connection,
  onSubmit,
}: {
  position: StepPosition
  connection?: BankConnection | null
  onSubmit: () => void
}) {
  const [checked, setChecked] = useState(false)

  return (
    // This step's content is shorter than the illustration beside it, so it
    // centres against it rather than hanging from the top edge.
    <div className="flex h-full flex-col justify-between gap-3 p-6">
      <div className={cn("flex flex-col gap-2", rise(position))}>
        <h2 className="type-title-1-emphasized text-balance text-foreground">
          See if you qualify for the Nav Credit Builder Card
        </h2>
        <p className="type-body-1 text-muted-foreground">
          Parafin reviews your connected bank data to see what credit limit you
          may qualify for, based on your revenue, not your credit scores.
        </p>
      </div>

      {/* Bento fused with the banner: the bento overlaps the banner by 16px
            so the two share an edge and read as one unit. */}
      <div className={cn("isolate flex flex-col", rise(position, "delay-75"))}>
        <div className="z-2 -mb-4 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-4 p-4">
            {/* What the consent applies to, named: the checkbox below asks to
                share this account, not banking in the abstract. */}
            {connection && (
              <div className="flex items-center gap-3 rounded-xl bg-surface-container-low p-3">
                <BankMark
                  bank={connection.bank}
                  className="size-8 rounded-lg text-[10px]"
                />
                <div className="min-w-0 flex-1">
                  <p className="type-body-2-emphasized text-foreground">
                    {connection.bank.name}
                  </p>
                  <p className="truncate type-caption-1 text-muted-foreground">
                    {connection.accounts.length === 1
                      ? "1 account"
                      : `${connection.accounts.length} accounts`}
                    {" · "}
                    {connection.accounts
                      .map((account) => `\u2022\u2022${account.mask}`)
                      .join(", ")}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 type-caption-1 text-success">
                  <CheckIcon className="size-3.5" />
                  Connected
                </span>
              </div>
            )}

            <div className="flex items-start gap-2">
              {/* Matches the label's 20px line box so the control centers on
                    the first line rather than the whole block. */}
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
          </div>
        </div>

        <div className="z-1 flex min-h-12 items-center rounded-b-xl bg-surface-dim pt-4 shadow-raised">
          <div className="flex-1 px-3 py-2">
            <p className="text-center type-caption-1 text-muted-foreground">
              You can disable this anytime in Settings &rarr; Bank accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
