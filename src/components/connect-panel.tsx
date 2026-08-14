import { Button } from "@/components/ui/button"
import { rise, type StepPosition } from "@/lib/motion"
import { cn } from "@/lib/utils"

export function ConnectPanel({
  position,
  onConnect,
}: {
  position: StepPosition
  onConnect: () => void
}) {
  return (
    // Bottom-aligned at desktop, as drawn; natural flow below that, where
    // there is no illustration to align against.
    <div className="flex h-full flex-col gap-3 p-6 lg:justify-between">
      <div className="flex flex-col items-start gap-2">
        <span
          className={cn(
            "rounded-full bg-warn-container px-2 py-1 type-caption-1-emphasized text-on-warn-container",
            rise(position)
          )}
        >
          No bank connected yet
        </span>

        <h2
          className={cn(
            "type-title-1-emphasized text-balance text-foreground",
            rise(position, "delay-75")
          )}
        >
          See if you qualify for the Nav Credit Builder Card
        </h2>

        <p
          className={cn(
            "type-body-1 text-muted-foreground",
            rise(position, "delay-150")
          )}
        >
          Your limit is based on your business&rsquo;s revenue and other
          underwriting criteria. It is reviewed regularly and can increase as
          your business grows. No business or personal credit checks required.
        </p>
      </div>

      <Button
        onClick={onConnect}
        className={cn(
          "h-12 w-full rounded-[6px] brand-sheen type-body-1-emphasized shadow-brand-raised hover:bg-primary hover:brightness-105",
          rise(position, "delay-200")
        )}
      >
        Connect bank accounts
      </Button>
    </div>
  )
}
