import { Button } from "@/components/ui/button"
import { rise, type StepPosition } from "@/lib/motion"
import { cn } from "@/lib/utils"

export function CheckingPanel({ position }: { position: StepPosition }) {
  return (
    <div className="flex h-full flex-col justify-between gap-3 p-6">
      {/* Takes the slack at desktop so the button sits on the bottom edge,
          level with the illustration's lower boundary. */}
      <div className="flex flex-col gap-1 lg:flex-1">
        <div
          className={cn("flex items-center gap-2", rise(position, "delay-150"))}
        >
          <span className="relative flex size-2 shrink-0">
            <span className="size-2 rounded-full bg-primary ring-5 ring-primary-surface" />
            <span className="absolute inset-0 z-1 rounded-full bg-primary/30 motion-safe:animate-ping" />
          </span>
          <p className="type-caption-1-uppercase text-primary">
            Checking your eligibility
          </p>
        </div>

        {/* Held to the width that wraps the line as drawn. */}
        <h2
          className={cn(
            "max-w-[336px] type-title-1-emphasized text-foreground",
            rise(position, "delay-200")
          )}
        >
          A credit limit that grows with your business
        </h2>

        <p
          className={cn(
            "type-body-1 text-muted-foreground",
            rise(position, "delay-[250ms]")
          )}
        >
          We review your eligibility automatically. Connecting more bank
          accounts gives us a fuller picture of your revenue and may help you
          qualify.
        </p>
      </div>

      {/* Demoted to a neutral button: the primary action is already done. */}
      <Button
        className={cn(
          "h-12 w-full rounded-[6px] bg-surface-container-highest type-body-1-emphasized text-foreground shadow-raised hover:bg-secondary",
          rise(position, "delay-300")
        )}
      >
        Manage bank connections
      </Button>
    </div>
  )
}
