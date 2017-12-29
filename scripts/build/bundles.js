"use strict"

const bundleTypes = {
  UNIVERSAL: "UNIVERSAL",
  NODE: "NODE",
  NOOP: "NOOP"
}

const bundles = [
  {
    type: bundleTypes.UNIVERSAL,
    entry: "lingui-i18n",
    externals: []
  },

  {
    label: 'lingui-i18n-dev',
    type: bundleTypes.UNIVERSAL,
    entry: "lingui-i18n/dev",
    externals: []
  },

  {
    type: bundleTypes.UNIVERSAL,
    entry: "lingui-react",
    externals: ["lingui-i18n"]
  },

  {
    type: bundleTypes.NODE,
    entry: "babel-plugin-lingui-transform-js"
  },

  {
    type: bundleTypes.NODE,
    entry: "babel-plugin-lingui-transform-react"
  },

  {
    type: bundleTypes.NODE,
    entry: "babel-plugin-lingui-extract-messages"
  },

  {
    type: bundleTypes.NOOP,
    entry: "babel-preset-lingui-js"
  },

  {
    type: bundleTypes.NOOP,
    entry: "babel-preset-lingui-react"
  },

  {
    type: bundleTypes.NODE,
    entry: "lingui-cli"
  },

  {
    type: bundleTypes.NODE,
    entry: "lingui-conf"
  },

  {
    type: bundleTypes.NODE,
    entry: "lingui-loader"
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
