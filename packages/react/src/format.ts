import React from "react"

// match <0>paired</0> and <1/> unpaired tags
const tagRe = /<(\d+)>(.*?)<\/\1>|<(\d+)\/>/
const nlRe = /(?:\r\n|\r|\n)/g

/**
 * `formatElements` - parse string and return tree of react elements
 *
 * `value` is string to be formatted with <0>Paired<0/> or <0/> (unpaired)
 * placeholders. `elements` is a array of react elements which indexes
 * correspond to element indexes in formatted string
 */
function formatElements(
  value: string,
  elements: { [key: string]: React.ReactElement<any> } = {}
): string | Array<any> {
  const parts = value.replace(nlRe, "").split(tagRe)

  // no inline elements, return
  if (parts.length === 1) return value

  const tree = []

  const before = parts.shift()
  if (before) tree.push(before)

  for (const [index, children, after] of getElements(parts)) {
    const element = elements[index]
    tree.push(
      React.cloneElement(
        element,
        { key: index },

        // format children for pair tags
        // unpaired tags might have children if it's a component passed as a variable
        children ? formatElements(children, elements) : element.props.children
      )
    )

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
function getElements(parts) {
  if (!parts.length) return []

  const [paired, children, unpaired, after] = parts.slice(0, 4)

  return [[parseInt(paired || unpaired), children || "", after]].concat(
    getElements(parts.slice(4, parts.length))
  )
}

export { formatElements }
