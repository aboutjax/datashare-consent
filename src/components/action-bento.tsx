import { useEffect, useRef, useState, type ReactNode } from "react"
import { CheckIcon } from "lucide-react"
import { AnimatePresence, motion, useReducedMotionConfig } from "motion/react"

import { BankMark } from "@/components/bank-mark"
// import { SwapPhrase } from "@/components/step-copy"
import { Badge } from "@/components/ui/badge"
import { type BankConnection } from "@/lib/banks"
import { usePendingCopyMotion } from "@/lib/step-motion"
import { cn } from "@/lib/utils"

/**
 * The line fused to the bottom of the bento. A `note` is an aside about what
 * the reader is about to do; `pending` is the state of something already set
 * in motion, so it takes the brand tint and the middle of the line.
 */
export type BentoBanner = {
  tone: "note" | "pending"
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
 * Bento fused with the banner: the bento overlaps the banner by 16px so the
 * two share an edge and read as one unit.
 */
export function ActionBento({
  connection,
  stepKey,
  banner,
  children,
}: {
  connection?: BankConnection | null
  /** Changes when the action does, which is what swaps it. */
  stepKey: string
  banner: BentoBanner
  children: ReactNode
}) {
  const [content, box] = useContentHeight(stepKey)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="isolate flex flex-col"
    >
      <div className="z-2 -mb-4 overflow-hidden rounded-2xl bg-card shadow-raised">
        <motion.div
          initial={false}
          animate={{ height: box?.height ?? "auto" }}
          transition={box?.animate ? undefined : { duration: 0 }}
          className="overflow-hidden"
        >
          {/* Positioned so that an action on its way out, which motion lifts
              out of the flow, keeps the offsets it already had. */}
          <div ref={content} className="relative flex flex-col gap-4 p-4">
            {connection && <ConnectedAccounts connection={connection} />}

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

      {/* The tint changes in CSS rather than by swapping the box: two boxes
          would stack their shadows through the crossfade. Only the line
          inside it is exchanged. */}
      <div
        className={cn(
          "relative z-1 flex min-h-12 items-center overflow-hidden rounded-b-xl pt-4 shadow-raised transition-colors duration-500 ease-out motion-reduce:transition-none",
          banner.tone === "pending" ? "bg-primary-surface" : "bg-surface-dim"
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
                banner.tone === "pending"
                  ? "text-center type-caption-1-emphasized text-on-primary-container"
                  : "text-left type-caption-1 text-muted-foreground"
              )}
            >
              {banner.tone === "pending" ? <PendingMessage /> : banner.text}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
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

/** What the sharing covers, named: the accounts the reader handed over, so no
 *  step asks about banking in the abstract. */
function ConnectedAccounts({ connection }: { connection: BankConnection }) {
  return (
    <div className="flex items-center">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {/* The white ring is what separates one mark from the next once the
            flow can link more than one institution and they overlap. */}
        <BankMark
          bank={connection.bank}
          className="size-6 rounded-lg ring-2 ring-card"
        />
        <div className="min-w-0">
          <p className="truncate type-body-1-emphasized text-foreground">
            {connection.bank.name}
          </p>
          <p className="truncate type-caption-1 text-muted-foreground">
            {connection.accounts.length === 1
              ? "1 account"
              : `${connection.accounts.length} accounts`}
            {" · "}
            {connection.accounts
              .map((account) => `\u2022\u2022${account.mask}`)
              .join(", ")}
          </p>
        </div>
      </div>

      <Badge variant="neutral">
        <CheckIcon data-icon="inline-start" />
        Connected
      </Badge>
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
