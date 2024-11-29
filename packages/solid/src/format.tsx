import { JSX } from "solid-js"

// match <tag>paired</tag> and <tag/> unpaired tags
const tagRe = /<([a-zA-Z0-9]+)>(.*?)<\/\1>|<([a-zA-Z0-9]+)\/>/
const nlRe = /(?:\r\n|\r|\n)/g

// For HTML, certain tags should omit their close tag. We keep a whitelist for
// those special-case tags.
const voidElementTags = {
  area: true,
  base: true,
  br: true,
  col: true,
  embed: true,
  hr: true,
  img: true,
  input: true,
  keygen: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true,
  menuitem: true,
}

function appendChildren(parent: HTMLElement, children: JSX.Element) {
  if (children == null)
    return
  if (Array.isArray(children)) {
    for (const node of (children as JSX.ArrayElement)) {
      appendChildren(parent, node)
    }
  } else if (children instanceof Node) {
    parent.appendChild(children as Node)
  } else if (typeof children === "string") {
    parent.appendChild(document.createTextNode(children))
  } else {
    console.error(`Invalid children type: ${typeof children}`, children)
  }
}

/**
 * `formatElements` - parse string and return tree of html elements
 *
 * `value` is string to be formatted with <tag>Paired<tag/> or <tag/> (unpaired)
 * placeholders. `elements` is a array of  html elements which indexes
 * correspond to element indexes in formatted string
 */
function formatElements(
  value: string,
  elements: { [key: string]: JSX.Element } = {}
): JSX.Element {
  const parts = value.replace(nlRe, "").split(tagRe)

  // no inline elements, return
  if (parts.length === 1) return value

  const tree: Array<JSX.Element | string> = []

  const before = parts.shift()
  if (before) tree.push(before)

  for (const [index, children, after] of getElements(parts)) {
    let element = typeof index !== "undefined" ? elements[index] : undefined

    if (!element) {
      console.error(`Can't use element at index '${index}' as it is not declared in the original translation`)
      // ignore problematic element but push its children and elements after it
      element = <></>
    } else if (children && (element instanceof Node) && (element as Node).nodeName.toLowerCase() in voidElementTags) {
      console.error(`${(element as Node).nodeName} is a void element tag therefore it must have no children`)
      // ignore problematic element but push its children and elements after it
      element = <></>
    }

    if (children) {
      if (element instanceof HTMLElement) {
        appendChildren(element as HTMLElement, formatElements(children, elements))
      } else {
        if (!Array.isArray(element))
          console.error(`Element is not HTMLElement, but have children:`, element)
        element = <>{element}{formatElements(children, elements)}</>
      }
    }

    tree.push(element)

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
  parts: string[]
): Array<readonly [string | undefined, string, string | undefined]> {
  if (!parts.length) return []

  const [paired, children, unpaired, after] = parts.slice(0, 4)

  const triple = [paired || unpaired, children || "", after] as const
  return [triple].concat(getElements(parts.slice(4, parts.length)))
}

export { formatElements }
