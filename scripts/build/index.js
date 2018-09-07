const argv = require("minimist")(process.argv.slice(2))
const ora = require("ora")
const chalk = require("chalk")

const Modules = require("./modules")
const Bundles = require("./bundles")
const Packaging = require("./packaging")
const Stats = require("./stats")
const { asyncCopyTo, asyncRimRaf, asyncExecuteCommand } = require("./utils")

const rollup = require("./rollup")
const babel = require("./babel")
const noop = require("./noop")

const { UNIVERSAL, NODE, NOOP } = Bundles.bundleTypes

const builders = {
  [UNIVERSAL]: rollup,
  [NODE]: babel,
  [NOOP]: noop
}

const requestedEntries = (argv._[0] || "")
  .split(",")
  .map(name => name.toLowerCase())

function shouldSkipBundle(bundle, bundleType) {
  if (requestedEntries.length > 0) {
    const isAskingForDifferentEntries = requestedEntries.every(
      requestedName => bundle.entry.indexOf(requestedName) === -1
    )
    if (isAskingForDifferentEntries) {
      return true
    }
  }
  return false
}

async function copyFlowTypes(name) {
  // Windows isn't supported in flow gen-flow-files
  if (process.platform === "win32") return

  const srcDir = `packages/${name}/src`
  const outDir = `build/packages/${name}`

  const msg = chalk.white.bold(`@lingui/${name}`) + chalk.dim(` (flow types)`)
  const spinner = ora(msg).start()

  await asyncExecuteCommand(
    `yarn flow-copy-source -i *.test.js ${srcDir} ${outDir}`
  )
  spinner.succeed()
}

async function buildEverything() {
  await asyncRimRaf("build")

  // Run them serially for better console output
  // and to avoid any potential race conditions.
  for (const bundle of Bundles.bundles) {
    if (shouldSkipBundle(bundle, bundle.type)) continue

    const builder = builders[bundle.type]
    if (!builder) {
      console.log("Unknown type")
      continue
    }

    await builder(bundle)
    if (bundle.type === UNIVERSAL || bundle.type === NODE) {
      const name = bundle.entry.replace("@lingui/", "")
      await copyFlowTypes(name)
    }
  }

  console.log(Stats.printResults())
  Stats.saveResults()

  await Packaging.prepareNpmPackages()
}

buildEverything()
