import { type PointerEvent } from "react"

import { type Step } from "@/lib/motion"
import { cn } from "@/lib/utils"

const cardImage = "/assets/card-visa-business.png"
const parafinLogo = "/assets/parafin-logo.png"
export const ellipseTop = "/assets/ellipse-top.svg"
export const ellipseBottom = "/assets/ellipse-bottom.svg"
const cardShelfLine = "/assets/line-card.svg"
const navText = "/assets/nav-text.svg"
const navIcon = "/assets/nav-icon.svg"

/**
 * The steps this illustration still climbs through. `offer` is deliberately
 * not one of them — see `offer-illustration.tsx` for why it gets its own
 * composition instead of a fourth rung on this one.
 */
type ShelfStep = Exclude<Step, "offer">

/**
 * How far the card has climbed out of the shelf at each step. It rises and
 * straightens as the application progresses, so the artwork tracks how real
 * the card has become. Even at the last step it stays tucked in: the card is
 * still being underwritten, so showing all of it would promise an approval
 * that has not happened yet.
 */
const emergence: Record<ShelfStep, string> = {
  connect: "translate-y-12 rotate-15",
  consent: "translate-y-0 rotate-15",
  reviewing: "-translate-y-11 rotate-6",
}

/**
 * The same climb, for the card in the band at the head of the narrow layout.
 * The offsets are a share of the card's own height, because that composition
 * is sized off the panel's width.
 *
 * The band is only ever showing the top of the card, so the climb is what
 * decides how much of it there is: a corner at the first step, half of it at
 * the second, and at the last the whole face, square to the reader and a
 * tenth larger. That last step is the only one that scales — it is the card
 * finally being looked at head on rather than glimpsed.
 */
const headerEmergence: Record<ShelfStep, string> = {
  connect: "translate-y-0 rotate-15 scale-100",
  consent: "-translate-y-[11.2%] rotate-15 scale-100",
  reviewing: "-translate-y-[44.4%] rotate-0 scale-110",
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
const balance: Record<ShelfStep, string> = {
  connect: "-translate-y-[20.6px]",
  consent: "translate-y-[3.4px]",
  reviewing: "translate-y-[14.2px]",
}

/** How far the card turns when the cursor is at the edge of its face. Small,
 *  because the card is already sitting at an angle: the turn has to read
 *  against a shape the eye has learned, not compete with it. */
const MAX_TILT = 6

/**
 * Hands the cursor to the card's surface — where the highlight falls, and how
 * far the card turns to meet it. Written straight to the element rather than
 * held in state: this runs on every pointermove, and re-rendering the
 * illustration at that rate would fight the step transitions running
 * alongside it.
 *
 * `offsetX/offsetY` are measured in the card's own box, after the tilt has
 * been undone, so both the highlight and the turn work in the card's frame
 * without the component having to know the angle it is drawn at.
 *
 * The corner the cursor is over is the one that comes forward, so the face
 * turns towards the pointer and the highlight sits on the part now angled
 * most directly at the viewer. Pushing that corner away instead would put the
 * highlight on the part of the card that had just turned from the light.
 */
function trackPointer(event: PointerEvent<HTMLDivElement>) {
  const card = event.currentTarget
  const { offsetX, offsetY } = event.nativeEvent
  const fromCenterX = offsetX / card.clientWidth - 0.5
  const fromCenterY = offsetY / card.clientHeight - 0.5

  card.style.setProperty("--sheen-x", `${offsetX}px`)
  card.style.setProperty("--sheen-y", `${offsetY}px`)
  card.style.setProperty("--tilt-x", `${fromCenterY * 2 * MAX_TILT}deg`)
  card.style.setProperty("--tilt-y", `${fromCenterX * -2 * MAX_TILT}deg`)
}

/**
 * The card itself: the artwork, the highlight the pointer moves across it,
 * and the lift it takes when it — or the button its climb ends in — is
 * reached for. Size and corner come from the caller, because the wide and the
 * narrow composition draw the same card at different scales.
 *
 * Hover lives here rather than on whatever positions the card, because that
 * parent owns the step climb: sharing one element would make the two
 * transforms fight.
 *
 * Reaching for the connect button lifts it too, a shorter 6px against the 8px
 * of touching the card itself — the same gesture at the distance it is being
 * made from, and a first inch of the climb the step ends in. Focus counts as
 * reaching: tabbing to the button shows it as well.
 */
export function CardFace({ className }: { className?: string }) {
  return (
    <div
      onPointerMove={trackPointer}
      className={cn(
        // `hover:` needs no gating of its own — Tailwind v4 already emits it
        // under `@media (hover: hover)`. The `group-has-` variant does: its
        // `:hover` sits inside arbitrary syntax the compiler does not read,
        // so on touch it would fire on tap and strand the card mid-lift.
        "card-sheen overflow-hidden shadow-artwork hover:-translate-y-2 group-has-[[data-card-hint]:focus-visible]:-translate-y-1.5 hover-hover:group-has-[[data-card-hint]:hover]:-translate-y-1.5 motion-reduce:hover:translate-y-0 motion-reduce:group-has-[[data-card-hint]:is(:hover,:focus-visible)]:translate-y-0",
        className
      )}
    >
      <img
        src={cardImage}
        alt="Nav Credit Builder Card"
        /* Never the hit target, so the sheen offsets are always measured from
           the card's own corner rather than from whatever the pointer landed
           on. */
        className="pointer-events-none size-full object-cover"
      />
    </div>
  )
}

/**
 * The two marks, at whatever size the caller asks for. Every measurement
 * inside is in `em`, so the lockup is scaled by setting a font size rather
 * than by keeping a second set of numbers for the smaller layout.
 */
export function BrandLockup({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-[0.7em]", className)}>
      {/* Sized rather than stretched between insets: preflight gives an image
          `height: auto`, which over-constrains a top-and-bottom box and leaves
          the mark at whatever size it was drawn at — right at one scale only,
          and by accident. */}
      <div className="relative h-[1em] w-[3.43em]">
        <img
          src={navIcon}
          alt=""
          className="absolute top-0 left-0 h-full w-[29.2%] object-contain"
        />
        <img
          src={navText}
          alt="Nav"
          className="absolute top-[1%] left-[33.5%] h-[99%] w-[66.1%] object-contain"
        />
      </div>
      <div className="h-[0.83em] w-px bg-outline-variant" />
      <img
        src={parafinLogo}
        alt="Parafin"
        className="h-[1.01em] w-[3.96em] object-contain"
      />
    </div>
  )
}

/**
 * The artwork as the narrow layout carries it: a full-bleed band across the
 * head of the panel, with the card rising out of its lower edge and the two
 * names on a pill in the corner. It is what the wide layout's column becomes
 * when there is no room beside the copy to stand it in.
 *
 * The band is a window rather than a frame. The card is centred well below
 * the lower edge, so only the top of it is ever on show and the rest is
 * somewhere to climb from. Its depth is a fixed share of the panel's width,
 * which keeps it the same band on every step — the copy underneath absorbs
 * whatever each step's action needs instead. Every measurement inside is a
 * share of that band, so the composition holds at any width the narrow layout
 * is given.
 */
export function CardHeader({ step }: { step: ShelfStep }) {
  return (
    <div className="relative aspect-[375/164] w-full overflow-hidden lg:hidden">
      {/* Both tints are centred outside the band, as they are outside the
          panel in the wide layout: what lands inside is the falloff, never the
          shape. Positioned by their own centre so the offsets stay legible at
          this size — the artwork is several times wider than the band it
          tints. */}
      <img
        src={ellipseBottom}
        alt=""
        className="pointer-events-none absolute top-[155%] left-[23.7%] w-[174%] max-w-none -translate-x-1/2 -translate-y-1/2"
      />
      <img
        src={ellipseTop}
        alt=""
        className="pointer-events-none absolute top-0 left-[125.5%] w-[240%] max-w-none -translate-x-1/2 -translate-y-1/2"
      />

      <div
        className={cn(
          "absolute top-[68.9%] left-[8.8%] aspect-[310.89/195.86] w-[82.9%] transition-[translate,rotate,scale] duration-700 ease-out motion-reduce:transition-none",
          headerEmergence[step]
        )}
      >
        <CardFace className="size-full rounded-xl" />
      </div>

      {/* Over the artwork rather than beside it, so it needs a surface of its
          own to stay legible against the card — a pill the tints and the card
          show through, dimmed and blurred. */}
      <div className="absolute top-4 right-4 rounded-full border border-black/12 bg-white/90 px-4 py-2 backdrop-blur-[2px]">
        <BrandLockup className="text-[14px]" />
      </div>
    </div>
  )
}

/** The card-on-a-shelf illustration beside every step — one continuous
 *  backdrop, with only the card's climb marking the progress. */
export function ShelfIllustration({ step }: { step: ShelfStep }) {
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
                      larger radius to cut those corners away. Sitting inside
                      the tilt, its hover offset runs along the card's own
                      axis, so it slides out of the shelf instead of straight
                      up the screen. */}
                    <CardFace className="h-[203px] w-[326px] rounded-xl" />
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

          <BrandLockup className="p-[26.5px] text-[25.42px]" />
        </div>
      </div>
    </div>
  )
}
