import { type Bank } from "@/lib/banks"
import { cn } from "@/lib/utils"

/** An institution's logo, clipped to the rounded tile the flow sets it in. */
export function BankMark({
  bank,
  className,
}: {
  bank: Bank
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg",
        className
      )}
    >
      <img src={bank.logo} alt="" className="size-full object-cover" />
    </span>
  )
}
