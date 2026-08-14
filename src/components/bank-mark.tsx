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
        // The plate needs an edge of its own: white on the white dialog card
        // would otherwise leave the logo floating with no tile around it.
        inset && "bg-white ring-1 ring-border ring-inset",
        className
      )}
    >
      <img
        src={bank.logo}
        alt=""
        // Sizing the inset mark by width keeps the margin proportional as
        // callers resize the tile; percentage padding would resolve against
        // the row instead of the tile.
        className={inset ? "h-auto w-[84%]" : "size-full object-cover"}
      />
    </span>
  )
}
