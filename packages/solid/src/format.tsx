import {
  createComponent,
  type JSXElement,
  type ParentComponent,
} from "solid-js"

// match <tag>paired</tag> and <tag/> unpaired tags
const tagRe = /<([a-zA-Z0-9]+)>([\s\S]*?)<\/\1>|<([a-zA-Z0-9]+)\/>/

/**
 * `formatElements` - parse string and return tree of Solid elements
 *
 * `value` is a string to be formatted with <tag>Paired<tag/> or <tag/> (unpaired)
 * placeholders. `elements` is a map of component factories whose indexes
 * correspond to element indexes in the formatted string.
 */
function formatElements(
  value: string,
  elements: Record<string, ParentComponent> = {},
): string | JSXElement | Array<JSXElement | string> {
  const parts = value.split(tagRe)
  // no inline elements, return
  if (parts.length === 1) return value

  const tree: Array<JSXElement | string> = []

  const before = parts.shift()

  if (before) tree.push(before)

  for (const [index, children, after] of getElements(parts)) {
    const element = index === undefined ? undefined : elements[index]
    const formattedChildren = children
      ? formatElements(children, elements)
      : undefined

    if (!element) {
      console.error(
        `Can't use element at index '${index}' as it is not declared in the original translation`,
      )

      if (formattedChildren !== undefined) {
        tree.push(formattedChildren)
      }
    } else {
      tree.push(
        createComponent(element, {
          children: formattedChildren,
        }),
      )
    }

    if (after) tree.push(after)
  }

  return tree.length === 1 ? tree[0]! : tree
}

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
  parts: string[],
): Array<readonly [string | undefined, string, string | undefined]> {
  if (!parts.length) return []

  const [paired, children, unpaired, after] = parts.slice(0, 4)
  const triple = [paired || unpaired, children || "", after] as const
  return [triple].concat(getElements(parts.slice(4, parts.length)))
}

export { formatElements }
