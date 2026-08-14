import { type Bank } from "@/lib/banks"
import { cn } from "@/lib/utils"

/** The tinted initials that stand in for an institution's logo. */
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
        "flex size-10 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white",
        bank.tint,
        className
      )}
    >
      {bank.mark}
    </span>
  )
}
