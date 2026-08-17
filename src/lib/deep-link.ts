import { plans, steps, type Plan, type Step } from "@/lib/motion"

/**
 * Deep linking for the flow: which step a link opens on, which plan flavor
 * the offer step should show, and which bank it should already show
 * connected if that step comes after `connect`. Read once from the URL a
 * page loads with, and (for the step and the plan) kept in sync as the flow
 * advances, so the address bar always names the panel on screen and can be
 * copied back to it.
 */

function params(): URLSearchParams {
  if (typeof window === "undefined") return new URLSearchParams()
  return new URLSearchParams(window.location.search)
}

/** The value a query param asks for, if it names one of `allowed`. Anything
 *  absent, or not one of them, falls back to the first rather than
 *  guessing. */
function oneOf<T extends string>(key: string, allowed: readonly T[]): T {
  const requested = params().get(key)
  return (allowed as readonly string[]).includes(requested ?? "")
    ? (requested as T)
    : allowed[0]
}

/** The step a `?step=` link asks to open on. */
export function stepFromUrl(): Step {
  return oneOf("step", steps)
}

/** The plan a `?plan=` link asks the offer step to show. */
export function planFromUrl(): Plan {
  return oneOf("plan", plans)
}

/** The bank a `?bank=` link asks to have connected. Only read once the flow
 *  lands past `connect`, since that step still asks the reader to link one
 *  themselves. `null` when absent, so the caller can fall back to its own
 *  default rather than this module knowing what that is. */
export function bankIdFromUrl(): string | null {
  return params().get("bank")
}

/**
 * Writes a value to a query param, replacing whatever it is currently
 * mirroring — the step as the flow advances, the plan as the dev dial
 * flips it — so reloading, or copying the URL, lands back on what was on
 * screen.
 *
 * `replaceState`, not a navigation: walking the flow forward, or trying the
 * other plan, is not a page the back button should have to unwind one step
 * at a time.
 */
function syncToUrl(key: string, value: string) {
  if (typeof window === "undefined") return
  const url = new URL(window.location.href)
  if (url.searchParams.get(key) === value) return
  url.searchParams.set(key, value)
  window.history.replaceState(window.history.state, "", url)
}

/** Keeps `?step=` in step with the flow. */
export function syncStepToUrl(step: Step) {
  syncToUrl("step", step)
}

/** Keeps `?plan=` in step with the offer's flavor. */
export function syncPlanToUrl(plan: Plan) {
  syncToUrl("plan", plan)
}
