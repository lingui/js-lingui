"use strict"

const path = require("path")
const { UNIVERSAL } = require("./bundles").bundleTypes

// For any external that is used in a DEV-only condition, explicitly
// specify whether it has side effects during import or not. This lets
// us know whether we can safely omit them when they are unused.
const HAS_NO_SIDE_EFFECTS_ON_IMPORT = false
// const HAS_SIDE_EFFECTS_ON_IMPORT = true;
const importSideEffects = Object.freeze({
  "@babel/runtime/core-js/object/get-own-property-names": HAS_NO_SIDE_EFFECTS_ON_IMPORT,
  deepFreezeAndThrowOnMutationInDev: HAS_NO_SIDE_EFFECTS_ON_IMPORT
})

// Bundles exporting globals that other modules rely on.
const knownGlobals = Object.freeze({
  react: "React"
})

// Given ['react'] in bundle externals, returns { 'react': 'React' }.
function getPeerGlobals(externals = [], bundleType) {
  const peerGlobals = {}
  externals.forEach(name => {
    if (!knownGlobals[name] && bundleType === UNIVERSAL) {
      throw new Error("Cannot build UMD without a global name for: " + name)
    }
    peerGlobals[name] = knownGlobals[name]
  })
  return peerGlobals
}

// Determines node_modules packages that are safe to assume will exist.
function getDependencies(bundleType, entry) {
  const packageJson = require(path.basename(
    path.dirname(require.resolve(entry))
  ) + "/package.json")
  // Both deps and peerDeps are assumed as accessible.
  return Array.from(
    new Set([
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.peerDependencies || {})
    ])
  )
}

function getImportSideEffects() {
  return importSideEffects
}

module.exports = {
  getImportSideEffects,
  getPeerGlobals,
  getDependencies
}
