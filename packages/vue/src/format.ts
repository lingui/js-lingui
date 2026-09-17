import {
  Fragment,
  h,
  isVNode,
  type Component,
  type VNode,
  type VNodeArrayChildren,
  type VNodeChild,
} from "vue"
import { toArray } from "./utils"

/**
 * A value that can be used as an inline element placeholder in a translation:
 *
 * - a VNode (e.g. `<a href="/docs" />` in JSX, or the content of a named slot
 *   in a template) whose children are replaced with the translated content,
 * - a component (object or functional) rendered with the translated content
 *   as its default slot,
 * - a tag name rendered with the translated content as children.
 */
export type TransElement = VNode | Component | string

// match <tag>paired</tag> and <tag/> unpaired tags
const tagRe = /<([a-zA-Z0-9]+)>([\s\S]*?)<\/\1>|<([a-zA-Z0-9]+)\/>/

const voidElementTags: Record<string, true> = {
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

/**
 * Copy over the VNode metadata that `h()` cannot receive through props: the
 * scoped CSS ids of the component that created `source` (`<style scoped>`),
 * its directives (`v-show`, custom directives) and its `ref` bound to the
 * owner instance. Without this, a placeholder re-created inside the `Trans`
 * render would lose `data-v-*` attributes and its ref would land on `Trans`.
 */
function withVNodeMeta(source: VNode, target: VNode): VNode {
  target.scopeId = source.scopeId
  // `slotScopeIds` is marked @internal by Vue and stripped from its typings
  ;(target as VNodeWithSlotScopeIds).slotScopeIds = (
    source as VNodeWithSlotScopeIds
  ).slotScopeIds
  target.dirs = source.dirs
  target.ref = source.ref
  return target
}

type VNodeWithSlotScopeIds = VNode & { slotScopeIds: string[] | null }

/**
 * Re-create `element` with `children` as its content. When `children` is
 * `undefined` (unpaired `<0/>` placeholder) the element is rendered as-is.
 */
function renderElement(
  element: TransElement,
  children: VNodeChild | undefined,
): VNodeChild {
  if (isVNode(element)) {
    if (children === undefined) {
      return element
    }

    const type = element.type
    const props: Record<string, unknown> = { ...element.props }
    if (element.key != null) {
      props.key = element.key
    }

    if (typeof type === "string") {
      if (voidElementTags[type]) {
        console.error(
          `<${type} /> is a void element tag and must not have children`,
        )
        return children
      }
      return withVNodeMeta(element, h(type, props, toArray(children)))
    }

    if (type === Fragment) {
      return withVNodeMeta(element, h(Fragment, props, toArray(children)))
    }

    return withVNodeMeta(
      element,
      h(type as Component, props, { default: () => toArray(children) }),
    )
  }

  if (typeof element === "string") {
    return children === undefined
      ? h(element)
      : h(element, null, toArray(children))
  }

  return children === undefined
    ? h(element)
    : h(element, null, { default: () => toArray(children) })
}

/**
 * `formatElements` - parse string and return tree of Vue VNodes
 *
 * `value` is a string to be formatted with <tag>Paired<tag/> or <tag/> (unpaired)
 * placeholders. `elements` is a map of VNodes/components whose indexes
 * correspond to element indexes in the formatted string.
 */
function formatElements(
  value: string,
  elements: Record<string, TransElement> = {},
): VNodeChild {
  const parts = value.split(tagRe)
  // no inline elements, return
  if (parts.length === 1) return value

  const tree: VNodeArrayChildren = []

  const before = parts.shift()

  if (before) tree.push(before)

  for (const [index, children, after] of getElements(parts)) {
    const element = index === undefined ? undefined : elements[index]
    const formattedChildren = children
      ? formatElements(children, elements)
      : undefined

    if (element === undefined) {
      console.error(
        `Can't use element at index '${index}' as it is not declared in the original translation`,
      )

      if (formattedChildren !== undefined) {
        tree.push(formattedChildren)
      }
    } else {
      tree.push(renderElement(element, formattedChildren))
    }

    if (after) tree.push(after)
  }

  return tree.length === 1 ? (tree[0] as VNodeChild) : tree
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
