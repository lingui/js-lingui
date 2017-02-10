import { cloneElement } from 'react'

// match <0>paired</0> and <1/> unpaired tags
const tagRe = /<(\d+)>(.*)<\/\1>|<(\d+)\/>/

/**
 * `formatElements` - parse string and return tree of react elements
 *
 * `value` is string to be formatted with <0>Paired<0/> or <0/> (unpaired)
 * placeholders. `elements` is a array of react elements which indexes
 * correspond to element indexes in formatted string
 */
function formatElements (value, elements) {
  // TODO: warn if there're any unprocessed elements
  // TODO: warn if element at `index` doesn't exist

  const parts = value.split(tagRe)

  // no inline elements, return
  if (parts.length === 1) return value

  const tree = []

  const before = parts.shift()
  if (before) tree.push(before)

  for (const [index, children, after] of getElements(parts)) {
    tree.push(cloneElement(
      elements[index],
      { key: index },
      // unpaired tag shouldn't receive children (return null instead)
      children ? formatElements(children, elements) : null
    ))

    if (after) tree.push(after)
  }

  return tree
}

/*
 * `getElements` - return array of element indexes and element childrens
 *
 * `parts` is array of [pairedIndex, children, unpairedIndex, textAfter, ...]
 * where:
 * - `pairedIndex` is index of paired element (undef for unpaired)
 * - `children` are children of paired element (undef for unpaired)
 * - `unpairedIndex` is index of unpaired element (undef for paired)
 * - `textAfter` is string after all elements (empty string, if there's nothing)
 *
 * `parts` length is always multiply of 4
 *
 * Returns: Array<[elementIndex, children, after]>
 */
function getElements (parts) {
  if (!parts.length) return []

  const [paired, children = '', unpaired, after] = parts.slice(0, 4)

  return [
    [parseInt(paired || unpaired), children, after]
  ].concat(getElements(parts.slice(4, parts.length)))
}

export { formatElements }
