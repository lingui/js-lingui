import * as R from "ramda"

/**
 * Custom zip method which takes length of the larger array
 * (usually zip functions use the `smaller` length, discarding values in larger array)
 */
export function zip<A, B>(a: A[], b: B[]): [A, B][] {
  return R.range(0, Math.max(a.length, b.length)).map((index) => [
    a[index],
    b[index],
  ])
}

export const makeCounter = (index = 0) => () => index++
