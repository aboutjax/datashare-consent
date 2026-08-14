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
  confirming: "-translate-y-6 rotate-10",
  checking: "-translate-y-11 rotate-6",
}

/** The card-on-a-shelf illustration behind every step — one continuous
 *  backdrop, with only the card's climb marking the progress. */
export function ShelfIllustration({ step }: { step: Step }) {
  return (
    <div className="relative hidden min-w-0 flex-1 self-stretch overflow-hidden bg-primary-surface lg:block">
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

      <div className="absolute top-1/2 left-1/2 flex w-[420px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-[17.68px]">
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
                      larger radius to cut those corners away. */}
                  <div className="h-[203px] w-[326px] overflow-hidden rounded-xl shadow-artwork">
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
  )
}
