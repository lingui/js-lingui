import type { VNodeArrayChildren, VNodeChild } from "vue"

export const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const toArray = (children: VNodeChild): VNodeArrayChildren =>
  Array.isArray(children) ? children : [children]
