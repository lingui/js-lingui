"use strict"

const bundleTypes = {
  UNIVERSAL: "UNIVERSAL",
  NODE: "NODE",
  NOOP: "NOOP"
}

const bundles = [
  {
    type: bundleTypes.UNIVERSAL,
    entry: "@lingui/core",
    externals: []
  },

  {
    type: bundleTypes.UNIVERSAL,
    entry: "@lingui/react",
    externals: ["@lingui/core"]
  },

  {
    type: bundleTypes.NODE,
    entry: "@lingui/babel-plugin-transform-js"
  },

  {
    type: bundleTypes.NODE,
    entry: "@lingui/babel-plugin-transform-react"
  },

  {
    type: bundleTypes.NODE,
    entry: "@lingui/react.macro"
  },

  {
    type: bundleTypes.NODE,
    entry: "@lingui/babel-plugin-extract-messages"
  },

  {
    type: bundleTypes.NOOP,
    entry: "@lingui/babel-preset-js"
  },

  {
    type: bundleTypes.NOOP,
    entry: "@lingui/babel-preset-react"
  },

  {
    type: bundleTypes.NODE,
    entry: "@lingui/cli"
  },

  {
    type: bundleTypes.NODE,
    entry: "@lingui/conf"
  },

  {
    type: bundleTypes.NODE,
    entry: "@lingui/loader"
  }
]

// Based on deep-freeze by substack (public domain)
function deepFreeze(o) {
  Object.freeze(o)
  Object.getOwnPropertyNames(o).forEach(function(prop) {
    if (
      o[prop] !== null &&
      (typeof o[prop] === "object" || typeof o[prop] === "function") &&
      !Object.isFrozen(o[prop])
    ) {
      deepFreeze(o[prop])
    }
  })
  return o
}

// Don't accidentally mutate config as part of the build
deepFreeze(bundles)

module.exports = {
  bundleTypes,
  bundles
}
