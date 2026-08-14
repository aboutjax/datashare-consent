import { Button } from "@/components/ui/button"
import { rise, type StepPosition } from "@/lib/motion"
import { cn } from "@/lib/utils"

const planeBg = "/assets/plane-bg.svg"
const planeLineArt = "/assets/plane-lineart.png"

/** The last step: the sharing is done, and the review it started runs on
 *  without the reader. Nothing here asks for anything. */
export function ConfirmationPanel({ position }: { position: StepPosition }) {
  return (
    <div className="flex flex-col gap-3">
      {/* Hand-drawn plane, with the purple wash filling its fold. The wash is
          a wrapper the insets can size: on the image itself the intrinsic
          dimensions would win and it would spill out. */}
      <div
        className={cn(
          "relative size-[112px] transition-[opacity,translate,rotate] duration-700 ease-out motion-reduce:transition-none",
          position === "active"
            ? "translate-x-0 translate-y-0 rotate-0 opacity-100 delay-100"
            : "-translate-x-2 translate-y-3 -rotate-6 opacity-0"
        )}
      >
        <div className="absolute inset-[18.17%_18.27%_35.61%_28.24%]">
          <img src={planeBg} alt="" className="size-full max-w-none" />
        </div>
        <img
          src={planeLineArt}
          alt=""
          className="absolute top-[15px] left-1/2 size-[83px] max-w-none -translate-x-1/2 object-cover"
        />
      </div>

      <div className="flex flex-col gap-2">
        <h2
          className={cn(
            "type-title-1-emphasized text-balance text-foreground",
            rise(position, "delay-200")
          )}
        >
          You&rsquo;re all set!
        </h2>
        <p
          className={cn(
            "type-body-2 text-muted-foreground",
            rise(position, "delay-[250ms]")
          )}
        >
          We review your eligibility automatically. Connecting more bank
          accounts gives us a fuller picture of your revenue and may help you
          qualify.
        </p>
      </div>
    </div>
  )
}

/** Neutral, and it leads nowhere in the flow: the review is already running,
 *  so the only thing left to offer is a way back to the connection. */
export function ConfirmationAction() {
  return (
    <Button
      size="lg"
      className="h-12 w-full rounded-[6px] bg-surface-container-highest type-body-2-emphasized text-foreground shadow-raised hover:bg-secondary"
    >
      Manage bank connections
    </Button>
  )
}
