const argv = require("minimist")(process.argv.slice(2))

import {BundleType, bundles, BundleDef} from "./bundles"
import {prepareNpmPackages} from "./packaging"
import {asyncRimRaf} from "./utils"

import rollup from "./rollup"
import babel from "./babel"
import noop from "./noop"
import customBuilder from "./custom"

const builders = {
  [BundleType.UNIVERSAL]: rollup,
  [BundleType.NODE]: babel,
  [BundleType.NOOP]: noop,
  [BundleType.CUSTOM]: customBuilder
}

const requestedEntries = (argv._[0] || "")
  .split(",")
  .map(name => name.toLowerCase())

function shouldSkipBundle(bundle: BundleDef) {
  if (requestedEntries.length > 0) {
    const isAskingForDifferentEntries = requestedEntries.every(
      requestedName => !bundle.packageName.includes(requestedName)
    )
    if (isAskingForDifferentEntries) {
      return true
    }
  }
  return false
}

async function buildEverything() {
  await asyncRimRaf("packages/**/build")

  // Run them serially for better console output
  // and to avoid any potential race conditions.
  for (const bundle of bundles) {
    if (shouldSkipBundle(bundle)) continue

    const builder = builders[bundle.type]
    if (!builder) {
      console.log("Unknown type")
      continue
    }

    await builder(bundle)
  }

  await prepareNpmPackages()
}

buildEverything()
