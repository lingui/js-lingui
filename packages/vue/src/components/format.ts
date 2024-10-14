import { h, type Slot } from "vue"

//

// match <tag>paired</tag> and <tag/> unpaired tags
const tagRe = /<([a-zA-Z0-9]+)>(.*?)<\/\1>|<([a-zA-Z0-9]+)\/>/u
const nlRe = /(?:\r\n|\r|\n)/gu

type Element = ReturnType<typeof h> | ReturnType<Slot>
type Node = Element | string | undefined

/*
 * `getElements` - return array of element indices and element children
 *
 * `parts` is array of [pairedIndex, children, unpairedIndex, textAfter, ...]
 * where:
 * - `pairedIndex` is index of paired element (undef for unpaired)
 * - `children` are children of paired element (undef for unpaired)
 * - `unpairedIndex` is index of unpaired element (undef for paired)
 * - `textAfter` is string after all elements (empty string, if there's nothing)
 *
 * `parts` length is always a multiple of 4
 *
 * Returns: Array<[elementIndex, children, after]>
 */
function getElements(
  parts: string[]
): Array<readonly [string | undefined, string, string | undefined]> {
  if (!parts.length) return []

  const [paired, children, unpaired, after] = parts.slice(0, 4)

  const triple = [paired || unpaired, children || "", after] as const
  return [triple].concat(getElements(parts.slice(4, parts.length)))
}

/**
 * `formatElements` - parse string and return tree of vue elements
 *
 * `value` is string to be formatted with <tag>Paired<tag/> or <tag/> (unpaired)
 * placeholders. `elements` is a array of vue slots which indexes
 * correspond to element indexes in formatted string
 */
export function formatElements(
  value: string,
  elements: { [key: string]: Slot | undefined } = {}
): Array<Node> {
  const parts = value.replace(nlRe, "").split(tagRe)

  // no inline elements, return
  if (parts.length === 1) return [value]

  const tree: Array<Node> = []

  const before = parts.shift()
  if (before) tree.push(before)

  for (const [index, children, after] of getElements(parts)) {
    const slot = typeof index !== "undefined" ? elements[index] : undefined
    let element: Element

    if (!slot) {
      console.error(
        `Can't use slot at index '${index}' as it is not declared in the original translation`
      )
      // ignore problematic element but push its children and elements after it
      element = h("span", children)
    } else {
      // slots display props with text interpolation
      // only way to do recursive thing is to give a component that will render
      // our subchildren / subslot
      const childrenInComponent = {
        setup: () => () => formatElements(children, elements),
      }
      element = slot({
        children: childrenInComponent,
      })
    }

    tree.push(element)

    if (after) tree.push(after)
  }

  return tree
}
