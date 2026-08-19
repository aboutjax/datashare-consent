import { useEffect, useRef, useState, type ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotionConfig } from "motion/react"

// import { SwapPhrase } from "@/components/step-copy"
import { Button } from "@/components/ui/button"
import { type BankConnection } from "@/lib/banks"
import { usePendingCopyMotion } from "@/lib/step-motion"
import { cn } from "@/lib/utils"

/**
 * The line fused to the bottom of the bento. A `note` is an aside about what
 * the reader is about to do; `pending` is the state of something already set
 * in motion, so it takes the brand tint and the middle of the line;
 * `highlight` takes the same tint as `pending` but holds a static line
 * rather than cycling — the offer's expiry is a fact, not a process.
 */
export type BentoBanner = {
  tone: "note" | "pending" | "highlight"
  text: string
}

/** The steps a lender walks through to underwrite a small-business loan, in
 *  the order they happen. Each is a real check, not a placeholder — the list
 *  is what makes the wait read as a process rather than a spinner, and the
 *  order is what makes the process read as a story: money in, money steady,
 *  money enough, money compared, money offered. */
const underwritingSteps = [
  "Checking your eligibility...",
  "Reviewing your bank transactions...",
  "Analyzing your revenue patterns...",
  "Calculating your average monthly deposits...",
  "Assessing your cash flow stability...",
  "Verifying your business account history...",
  "Evaluating your repayment capacity...",
  "Comparing against similar businesses...",
  "Determining your credit limit...",
  "Completing your risk assessment...",
]

/**
 * The block that closes every step once a bank is linked: the connection the
 * step is talking about, then whatever that step asks for.
 *
 * Mounted once, by the card rather than by a step, and never unmounted after
 * the bank is linked. The steps crossfade above it; if each one drew its own
 * copy, the connection would fade out and back in on every swap — two
 * half-transparent copies of the same unchanged fact. Anchored here it simply
 * stays, and only the action inside it is exchanged.
 *
 * Bento fused with the banner: the bento is always the box in front — it
 * carries the overlap, sitting 16px into the banner on whichever side the
 * two meet — so the banner reads as behind the card in both directions
 * rather than swapping which one the reader's eye lands on first.
 */
export function ActionBento({
  connections,
  onAddBank,
  stepKey,
  banner,
  bannerPosition = "bottom",
  children,
}: {
  /** Every bank linked so far — plural because "Add another bank" can leave
   *  more than one behind, and the count below has to add all of them up
   *  rather than describe just the latest. Omitted where the step doesn't
   *  itemize the connection at all — `reviewing` folds the count into the
   *  banner instead, so the row here would just repeat it. */
  connections?: BankConnection[]
  /** What "Add another bank" does, next to the connected count. Undefined
   *  where that offer doesn't apply — a deep link past `connect` shows a
   *  stand-in connection, not one the reader can add to. */
  onAddBank?: () => void
  /** Changes when the action does, which is what swaps it. */
  stepKey: string
  /** Undefined where the step has nothing to append to the box: `connect`
   *  and `reviewing` state their own terms in the bento already, and a note
   *  fused underneath would be a second, smaller thing competing with the
   *  content above. */
  banner?: BentoBanner
  /** `bottom` reads as an aside about the action just above it; `top` reads
   *  as the fact that action is scoped to — `reviewing` leads with what the
   *  wait is based on rather than closing with a reminder of it. */
  bannerPosition?: "top" | "bottom"
  children: ReactNode
}) {
  const [content, box] = useContentHeight(stepKey)
  const top = bannerPosition === "top"

  const bento = (
    <div
      className={cn(
        "z-2 overflow-hidden rounded-2xl bg-card shadow-raised",
        banner && (top ? "-mt-4" : "-mb-4")
      )}
    >
      <motion.div
        initial={false}
        animate={{ height: box?.height ?? "auto" }}
        transition={box?.animate ? undefined : { duration: 0 }}
        className="overflow-hidden"
      >
        {/* Positioned so that an action on its way out, which motion lifts
            out of the flow, keeps the offsets it already had. */}
        <div ref={content} className="relative flex flex-col gap-4 p-4">
          {connections && connections.length > 0 && (
            <ConnectedAccounts connections={connections} onAddBank={onAddBank} />
          )}

          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={stepKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.15 } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="flex flex-col gap-4"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )

  const bannerBlock = banner && (
    // The tint changes in CSS rather than by swapping the box: two boxes
    // would stack their shadows through the crossfade. Only the line
    // inside it is exchanged.
    <div
      className={cn(
        "relative z-1 flex min-h-12 items-center overflow-hidden shadow-raised transition-colors duration-500 ease-out motion-reduce:transition-none",
        banner.tone === "note" ? "bg-surface-dim" : "bg-primary-surface",
        top ? "rounded-t-xl pb-4" : "rounded-b-xl pt-4"
      )}
    >
      {/* Fades in and out with the tone rather than mounting with the
          banner, so the movement starts when the wait does and stops the
          moment there is nothing left to wait for. */}
      <AnimatePresence initial={false}>
        {banner.tone === "pending" && (
          <motion.div
            key="stripes"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 pending-stripes-fade"
          >
            {/* Overhangs the banner by more than one stripe period, so the
                trailing edge never travels into view. */}
            <div className="absolute -inset-x-8 inset-y-0 pending-stripes motion-reduce:animate-none" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex-1 py-2 pr-2.5 pl-3">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={stepKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.15 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className={cn(
              "text-balance",
              banner.tone === "note"
                ? "text-left type-caption-1 text-muted-foreground"
                : "text-center type-caption-1-emphasized text-on-primary-container"
            )}
          >
            {banner.tone === "pending" ? <PendingMessage /> : banner.text}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="isolate flex flex-col"
    >
      {top ? (
        <>
          {bannerBlock}
          {bento}
        </>
      ) : (
        <>
          {bento}
          {bannerBlock}
        </>
      )}
    </motion.div>
  )
}

/**
 * The natural height of whatever it is given, watched, along with whether the
 * last change to it was one worth easing through.
 *
 * Animating the real height rather than reaching for motion's `layout` prop:
 * `layout` fakes a resize with a transform, so the block would look right
 * while the card around it snapped to the new height in a single frame and
 * clipped the banner on the way. Nor does the fake cross the flow — it is
 * applied per element that opts in, and this resize has to travel through
 * three of them: everything inside the block would need counter-scaling to
 * survive the squash, the banner is a sibling rather than a child, and the
 * card two levels up is what actually moves on the narrow layout. A height
 * that actually changes keeps every box in the flow, and the card follows the
 * block down.
 */
function useContentHeight(stepKey: string) {
  const ref = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState<{ height: number; animate: boolean }>()
  const reduced = useReducedMotionConfig()

  // The step the last measurement belonged to, seeded with the one the block
  // mounted on so its first reading settles silently. A resize that is not a
  // step change — a webfont swapping in and rewrapping the consent label, the
  // window being dragged — is not a transition, and easing through it would
  // leave the block lagging behind the card that has already resized round it.
  const measuredAt = useRef(stepKey)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // `observe` measures immediately, and by then `popLayout` has lifted the
    // outgoing action out of the flow — so the first reading after a step
    // change is already the height the block is settling to.
    const observer = new ResizeObserver(([entry]) => {
      setBox({
        // The entry's own reading rather than `offsetHeight`, which rounds to
        // whole pixels and can leave the box half a pixel short of its
        // content — enough to jitter between two measurements of one height.
        height: entry.borderBoxSize[0].blockSize,
        animate: !reduced && measuredAt.current !== stepKey,
      })
      measuredAt.current = stepKey
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [stepKey, reduced])

  return [ref, box] as const
}

/** What the sharing covers, named at the level the reader can act on: how
 *  many accounts are in, not which ones — the institution and its masked
 *  numbers are Plaid's business, not a fact this step needs to restate.
 *  Summed across every bank linked so far, so a second trip through Plaid
 *  raises the count rather than replacing it. */
function ConnectedAccounts({
  connections,
  onAddBank,
}: {
  connections: BankConnection[]
  onAddBank?: () => void
}) {
  const count = connections.reduce(
    (total, connection) => total + connection.accounts.length,
    0
  )

  return (
    <div className="flex items-center gap-2">
      <p className="min-w-0 flex-1 truncate type-body-1-emphasized text-foreground">
        {count === 1
          ? "1 connected bank account"
          : `${count} connected bank accounts`}
      </p>

      <Button
        size="sm"
        onClick={onAddBank}
        className="h-7 shrink-0 rounded-[6px] bg-surface-container-highest px-2 type-caption-1-emphasized text-foreground shadow-raised hover:bg-secondary"
      >
        Add another bank
      </Button>
    </div>
  )
}

/**
 * Cycles through the underwriting steps on whichever `animate-text` spec the
 * pending dials hold. The parent `motion.p` is keyed by the step, so this
 * mounts fresh each time the pending banner appears and the cycle starts from
 * the top.
 *
 * Each phrase schedules its own replacement rather than riding a fixed
 * interval: how long it takes to arrive depends on the effect, the split, and
 * its own length, and only after it has arrived does the reading time start.
 * `popLayout` is what lets the swap overlap — the leaving phrase is taken out
 * of the flow, so the arriving one can hold the same slot while it is still
 * on screen.
 */
function PendingMessage() {
  const contract = usePendingCopyMotion()
  const [swap, setSwap] = useState({ index: 0, delayMs: 0 })
  const phrase = underwritingSteps[swap.index]

  useEffect(() => {
    const timer = window.setTimeout(
      () =>
        setSwap({
          index: (swap.index + 1) % underwritingSteps.length,
          delayMs: contract.enterDelayMs(phrase),
        }),
      contract.restMs(phrase, swap.delayMs)
    )
    return () => window.clearTimeout(timer)
  }, [swap, phrase, contract])

  return (
    <AnimatePresence mode="popLayout">
      <span>Reviewing your eligibility...</span>
      {/* <SwapPhrase
        key={swap.index}
        text={phrase}
        motion={contract}
        delay={swap.delayMs / 1000}
      /> */}
    </AnimatePresence>
  )
}
