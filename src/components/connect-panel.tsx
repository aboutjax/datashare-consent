import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { rise, type StepPosition } from "@/lib/motion"
import { cn } from "@/lib/utils"

export function ConnectPanel({ position }: { position: StepPosition }) {
  return (
    <div className="flex flex-col items-start gap-2">
      <Badge variant="warn" className={rise(position)}>
        No bank connected yet
      </Badge>

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
        underwriting criteria. It is reviewed regularly and can increase as your
        business grows. No business or personal credit checks required.
      </p>
    </div>
  )
}

/** The only step whose action stands on its own: there is no connection to
 *  head it yet, so it is a bare button rather than the anchored bento. */
export function ConnectAction({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex w-full flex-col gap-2">
      <Button
        onClick={onConnect}
        className="h-12 w-full rounded-[6px] brand-sheen type-body-1-emphasized shadow-brand-raised hover:bg-primary hover:brightness-105"
      >
        Connect bank accounts
      </Button>
      <p className="w-full text-center type-caption-1 text-muted-foreground">
        Bank-grade encryption via Plaid. We only read your transaction history.
      </p>
    </div>
  )
}
