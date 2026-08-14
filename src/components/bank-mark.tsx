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
  const inset = bank.logoFit === "contain"

  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg",
        // Percentage padding keeps the inset proportional as callers resize the tile.
        inset && "bg-white p-[8%]",
        className
      )}
    >
      <img
        src={bank.logo}
        alt=""
        className={cn("size-full", inset ? "object-contain" : "object-cover")}
      />
    </span>
  )
}
