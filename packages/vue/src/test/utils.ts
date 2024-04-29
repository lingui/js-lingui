import { type TransformContext, type ElementNode } from "@vue/compiler-core"
import { compileTemplate } from "vue/compiler-sfc"

import { isElementNode } from "../common/predicates"

//

export function run(
  source: string,
  test: (node: ElementNode, context: TransformContext) => void
) {
  let count = 0
  let called = false
  const compiled = compileTemplate({
    filename: "App.vue",
    id: "app",
    source: source.startsWith("<script")
      ? source
      : `<template>${source}</template>`,
    compilerOptions: {
      nodeTransforms: [
        // will be called for each ast "node"
        // we want to run our test on the 1st real node
        (node, context) => {
          count++
          // 1st is SFC root
          // 2nd is template node
          // 3rd is our test
          if (count === 3) {
            if (isElementNode(node)) {
              test(node, context)
              called = true
            } else {
              throw new Error("wrong source")
            }
          }
        },
      ],
    },
  })
  if (!called) throw new Error("test never called, check your source")
  return compiled
}
