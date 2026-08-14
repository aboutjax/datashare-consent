import { Button } from "@/components/ui/button"
import { rise, type StepPosition } from "@/lib/motion"
import { cn } from "@/lib/utils"

const planeBg = "/assets/plane-bg.svg"
const planeLineArt = "/assets/plane-lineart.png"

export function ConfirmationPanel({
  position,
  onSubmit,
}: {
  position: StepPosition
  onSubmit: () => void
}) {
  return (
    // Bottom-aligned at desktop, as drawn; natural flow below that, where
    // there is no illustration to align against.
    <div className="flex h-full flex-col gap-3 p-6 lg:justify-between">
      <div className="flex flex-col gap-2">
        {/* Hand-drawn plane, with the purple wash filling its fold. The
              wash is a wrapper the insets can size: on the image itself the
              intrinsic dimensions would win and it would spill out. */}
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
          Your bank data is shared with Parafin. They&rsquo;ll review it to
          check what you qualify for. If an offer&rsquo;s available, we&rsquo;ll
          notify you.
        </p>
      </div>

      <Button
        onClick={onSubmit}
        className={cn(
          "h-12 w-full rounded-[6px] brand-sheen type-body-1-emphasized shadow-brand-raised hover:bg-primary hover:brightness-105",
          rise(position, "delay-300")
        )}
      >
        Okay
      </Button>
    </div>
  )
}
