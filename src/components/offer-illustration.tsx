import {
  BrandLockup,
  CardFace,
  ellipseBottom,
  ellipseTop,
} from "@/components/shelf-illustration"

/**
 * The illustration once the card has actually left the shelf.
 *
 * `reviewing`'s copy sends the reader away entirely — "we'll email you…
 * you can close this page" — so the offer is not the next rung of the same
 * climb; it's what an email link opens onto, on a different day, in a tab
 * that never carried the shelf at all. Stretching the shelf's clip window to
 * also fit a fully emerged, untilted card is what produced the crop: that
 * rig's clip is sized to hide most of a card still climbing, not to frame
 * one that has already arrived. A card resting on nothing is a different
 * composition, not a further step of the one before it, so it gets its own —
 * built from the shelf's own card and lockup so the two still read as the
 * same object.
 *
 * Both compositions are the ink centred on the frame: the wide layout
 * doesn't lean the way the climbing steps do, because nothing here is
 * reaching towards an action beside it, and the narrow band shows the same
 * square-on face `reviewing` already settled into — there is nothing left
 * for arriving here to reveal.
 */

export function OfferHeader() {
  return (
    <div className="relative aspect-[375/164] w-full overflow-hidden lg:hidden">
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

      <div className="absolute top-[24.5%] left-1/2 aspect-[310.89/195.86] w-[91.2%] -translate-x-1/2">
        <CardFace className="size-full rounded-xl" />
      </div>

      <div className="absolute top-4 right-4 rounded-full border border-black/12 bg-white/90 px-4 py-2 backdrop-blur-[2px]">
        <BrandLockup className="text-[14px]" />
      </div>
    </div>
  )
}

export function OfferIllustration() {
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

      {/* One translate centres the whole block — card and lockup together —
          on the column, rather than the shelf's two-part correction: there
          is no lean to counteract here. */}
      <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <CardFace className="h-[203px] w-[326px] rounded-xl" />
        <BrandLockup className="p-[26.5px] text-[25.42px]" />
      </div>
    </div>
  )
}
