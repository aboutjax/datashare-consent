import { plans, steps, type Plan, type Step } from "@/lib/motion"
import { cn } from "@/lib/utils"

/** Labels for each step, in the order they are walked through. */
const labels: Record<Step, string> = {
  connect: "Connect",
  consent: "Consent",
  reviewing: "Reviewing",
  offer: "Offer",
}

/**
 * Quick-jump links to every step in the flow, so any step can be opened
 * without clicking through the ones before it. The active step reads as
 * the one on screen; the rest read as the ones around it.
 *
 * The offer step has two flavors — `free` and `prime` — and the nav carries
 * a second row of links for them, shown only when the offer step is the one
 * on screen. They share the same shape as the step links so the two rows
 * read as one control with two levels.
 */
export function StepNav({
  step,
  goTo,
  plan,
  goToPlan,
}: {
  step: Step
  goTo: (next: Step) => void
  plan: Plan
  goToPlan: (next: Plan) => void
}) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex flex-col gap-1 bg-background/80 px-4 py-2 backdrop-blur-md sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1 rounded-xl bg-surface-container-low p-1">
        {steps.map((each) => {
          const active = each === step
          return (
            <button
              key={each}
              type="button"
              onClick={() => goTo(each)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "h-7 flex-1 rounded-lg px-2.5 text-sm font-medium transition-colors duration-200 ease-out",
                active
                  ? "bg-card text-foreground shadow-raised"
                  : "text-muted-foreground hover:bg-surface-container hover:text-foreground"
              )}
            >
              {labels[each]}
            </button>
          )
        })}
      </nav>

      {step === "offer" && (
        <nav className="flex items-center gap-1 rounded-xl bg-surface-container-low p-1">
          {plans.map((each) => {
            const active = each === plan
            return (
              <button
                key={each}
                type="button"
                onClick={() => goToPlan(each)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "h-7 flex-1 rounded-lg px-2.5 text-sm font-medium capitalize transition-colors duration-200 ease-out",
                  active
                    ? "bg-card text-foreground shadow-raised"
                    : "text-muted-foreground hover:bg-surface-container hover:text-foreground"
                )}
              >
                {each}
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}
