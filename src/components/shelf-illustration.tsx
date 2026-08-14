import { type Step } from "@/lib/motion"
import { cn } from "@/lib/utils"

const cardImage = "/assets/card-visa-business.png"
const parafinLogo = "/assets/parafin-logo.png"
const ellipseTop = "/assets/ellipse-top.svg"
const ellipseBottom = "/assets/ellipse-bottom.svg"
const cardShelfLine = "/assets/line-card.svg"
const navText = "/assets/nav-text.svg"
const navIcon = "/assets/nav-icon.svg"

/**
 * How far the card has climbed out of the shelf at each step. It rises and
 * straightens as the application progresses, so the artwork tracks how real
 * the card has become. Even at the last step it stays tucked in: the card is
 * still being underwritten, so showing all of it would promise an approval
 * that has not happened yet.
 */
const emergence: Record<Step, string> = {
  connect: "translate-y-12 rotate-15",
  consent: "translate-y-0 rotate-15",
  confirming: "-translate-y-11 rotate-6",
}

/**
 * Holds the artwork on the panel's center line while the card climbs. The
 * layout box never changes size — the card moves by transform and is clipped
 * at the shelf — so what actually grows is the ink: the top corner of the
 * tilted card rises about 70px between the first step and the last while the
 * logo lockups stay put, so the composition drifts off center by half of that
 * at either end. Each value is the gap, for its step, between the middle of
 * the layout box and the middle of the ink the eye actually sees — the card's
 * top corner down to the bottom of the lockups.
 */
const balance: Record<Step, string> = {
  connect: "-translate-y-[20.6px]",
  consent: "translate-y-[3.4px]",
  confirming: "translate-y-[14.2px]",
}

/** The card-on-a-shelf illustration behind every step — one continuous
 *  backdrop, with only the card's climb marking the progress. */
export function ShelfIllustration({ step }: { step: Step }) {
  return (
    <div className="relative z-0 hidden min-w-0 flex-1 self-stretch overflow-visible lg:block">
      <img
        src={ellipseTop}
        alt=""
        className="pointer-events-none absolute -top-[300px] -right-[300px] size-[600px] max-w-none"
      />
      <img
        src={ellipseBottom}
        alt=""
        className="pointer-events-none absolute -bottom-[300px] -left-[300px] size-[600px] max-w-none"
      />

      {/* Two elements, not one: the outer holds the panel centering, the inner
          the per-step correction. A single element would have to fold the
          -50% and the nudge into one translate, and the two would fight. */}
      <div className="absolute top-1/2 left-1/2 w-[420px] -translate-x-1/2 -translate-y-1/2">
        <div
          className={cn(
            "flex flex-col items-center gap-[17.68px] transition-[translate] duration-700 ease-out motion-reduce:transition-none",
            balance[step]
          )}
        >
          <div className="flex flex-col items-center gap-[1.1px]">
            <div className="relative h-[168px] w-[420px]">
              {/* The clip reaches above the layout box so a risen card is only
                ever cut off at the shelf line, never at its top corner. It is
                absolute so that headroom costs no space in the column. */}
              <div className="absolute inset-x-0 -top-[100px] bottom-0 overflow-hidden">
                <div className="absolute -bottom-[132px] left-1/2 flex h-[280px] w-[367px] -translate-x-1/2 items-center justify-center">
                  <div
                    className={cn(
                      "transition-[translate,rotate] duration-700 ease-out motion-reduce:transition-none",
                      emergence[step]
                    )}
                  >
                    {/* The export bakes a light background into the card's own
                      rounded corners, so the wrapper clips at a slightly
                      larger radius to cut those corners away.

                      Hover lives here rather than on the parent because the
                      parent owns the step climb: sharing one element would
                      make the two transforms fight. Sitting inside the tilt,
                      the offset runs along the card's own axis, so it slides
                      out of the shelf instead of straight up the screen. */}
                    <div className="h-[203px] w-[326px] overflow-hidden rounded-xl shadow-artwork transition-[translate] duration-200 ease-out motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                      <img
                        src={cardImage}
                        alt="Nav Credit Builder Card"
                        className="size-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <img
              src={cardShelfLine}
              alt=""
              className="pointer-events-none w-[391.26px] mix-blend-multiply"
            />
          </div>

          <div className="flex items-center gap-[17.68px] p-[26.5px]">
            <div className="relative h-[25.42px] w-[87.07px]">
              <img
                src={navIcon}
                alt=""
                className="absolute inset-y-0 right-[70.8%] left-0"
              />
              <img
                src={navText}
                alt="Nav"
                className="absolute top-[1%] right-[0.4%] bottom-0 left-[33.5%]"
              />
            </div>
            <div className="h-[21px] w-px bg-outline-variant" />
            <img
              src={parafinLogo}
              alt="Parafin"
              className="h-[25.79px] w-[100.58px] object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
