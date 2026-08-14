import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/** Steps of the Web Wayfinder type ramp, as `text-*` sizes. */
const TYPE_SIZES = [
  "display-1",
  "display-2",
  "title-1",
  "title-2",
  "title-3",
  "headline",
  "body-1",
  "body-2",
  "caption-1",
  "caption-2",
]

/** Complete named styles from the ramp, as `type-*` utilities. */
const TYPE_STYLES = [
  ...TYPE_SIZES,
  "display-1-emphasized",
  "display-2-emphasized",
  "title-1-emphasized",
  "title-2-emphasized",
  "title-3-emphasized",
  "body-1-emphasized",
  "body-2-emphasized",
  "caption-1-emphasized",
  "caption-1-uppercase",
  "caption-2-emphasized",
  "caption-2-uppercase",
]

const twMerge = extendTailwindMerge<"nav-type">({
  extend: {
    classGroups: {
      "font-size": [{ text: TYPE_SIZES }],
      "nav-type": [{ type: TYPE_STYLES }],
    },
    conflictingClassGroups: {
      // A `type-*` style sets family, size, line-height, tracking and weight at
      // once. Without this, the individual utilities baked into a component's
      // base classes survive the merge and win on CSS order, because Tailwind
      // emits single-property utilities after multi-property ones.
      "nav-type": [
        "font-family",
        "font-size",
        "font-weight",
        "leading",
        "tracking",
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
