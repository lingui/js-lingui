import { compileTemplate } from "vue/compiler-sfc"
import { transformer } from "../compiler"
import { parse } from "@vue/compiler-sfc"
import { BindingTypes } from "@vue/compiler-core"

export function run(source: string) {
  const code = source.trim().startsWith("<script")
    ? source
    : `<template>${source}</template>`

  const { descriptor } = parse(code, {
    sourceMap: true,
    filename: "App.vue",
    ignoreEmpty: true,
  })

  return compileTemplate({
    filename: "App.vue",
    id: "app",
    source: descriptor.template?.src!,
    ast: descriptor.template?.ast,

    compilerOptions: {
      bindingMetadata: {
        Trans: BindingTypes.SETUP_MAYBE_REF,
      },
      nodeTransforms: [transformer],
    },
  })
}
