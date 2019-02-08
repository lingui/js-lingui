"use strict"

const { rollup } = require("rollup")
const babel = require("rollup-plugin-babel")
const closure = require("rollup-plugin-closure-compiler")
const commonjs = require("rollup-plugin-commonjs")
const resolve = require("rollup-plugin-node-resolve")
const prettier = require("rollup-plugin-prettier")
const replace = require("rollup-plugin-replace")
const ora = require("ora")
// const stripBanner = require("rollup-plugin-strip-banner")
const chalk = require("chalk")
const path = require("path")
const fs = require("fs")
const argv = require("minimist")(process.argv.slice(2))
const Stats = require("./stats")
const sizes = require("./plugins/sizes")
const codeFrame = require("babel-code-frame")
const babelConfig = require("./babel.config")

const Modules = require("./modules")
const Bundles = require("./bundles")
const Packaging = require("./packaging")

const UMD_DEV = "UMD_DEV"
const UMD_PROD = "UMD_PROD"
const NODE_DEV = "NODE_DEV"
const NODE_PROD = "NODE_PROD"

// Errors in promises should be fatal.
let loggedErrors = new Set()
process.on("unhandledRejection", err => {
  if (loggedErrors.has(err)) {
    // No need to print it twice.
    process.exit(1)
  }
  throw err
})

const { UNIVERSAL, NODE } = Bundles.bundleTypes

const forcePrettyOutput = argv.pretty
const shouldExtractErrors = argv["extract-errors"]

const closureOptions = {
  compilationLevel: "SIMPLE",
  languageIn: "ECMASCRIPT5_STRICT",
  languageOut: "ECMASCRIPT5_STRICT",
  env: "CUSTOM",
  warningLevel: "QUIET",
  applyInputSourceMaps: false,
  useTypesForOptimization: false,
  processCommonJsModules: false
}

function getBabelConfig(updateBabelOptions, bundleType, filename) {
  return Object.assign({}, babelConfig({ modules: false }), {
    babelrc: false,
    exclude: "node_modules/**",
    extensions: [".js", ".ts"],
    runtimeHelpers: true
  })
}

function getRollupOutputOptions(outputPath, format, globals, globalName) {
  return {
    file: outputPath,
    format,
    globals,
    interop: true, // might be turned off with Babel 7, please review
    name: globalName,
    sourcemap: false
  }
}

function getFormat(bundleType) {
  switch (bundleType) {
    case UMD_DEV:
    case UMD_PROD:
      return `umd`
    case NODE_DEV:
    case NODE_PROD:
      return `cjs`
  }
}

function getFilename(bundle, bundleType) {
  const filename = bundle.label || bundle.entry
  switch (bundleType) {
    case NODE_DEV:
    case UMD_DEV:
      return `${filename}.development.js`
    case UMD_PROD:
    case NODE_PROD:
      return `${filename}.production.min.js`
  }
}

function isProductionBundleType(bundleType) {
  switch (bundleType) {
    case UMD_DEV:
    case NODE_DEV:
      return false
    case UMD_PROD:
    case NODE_PROD:
      return true
    default:
      throw new Error(`Unknown type: ${bundleType}`)
  }
}

function getPlugins(
  entry,
  externals,
  updateBabelOptions,
  filename,
  bundleType,
  globalName,
  moduleType,
  modulesToStub
) {
  // const findAndRecordErrorCodes = extractErrorCodes(errorCodeOpts)
  const isProduction = isProductionBundleType(bundleType)
  const isInGlobalScope = bundleType === UMD_DEV || bundleType === UMD_PROD
  const shouldStayReadable = forcePrettyOutput
  return [
    // Use Node resolution mechanism.
    resolve({
      extensions: [".js", ".ts"]
    }),

    // Compile to ES5.
    babel(getBabelConfig(updateBabelOptions, bundleType)),
    // Turn __DEV__ and process.env checks into constants.
    replace({
      "process.env.NODE_ENV": isProduction ? "'production'" : "'development'"
    }),

    // We still need CommonJS for external deps like object-assign.
    commonjs(),

    // Apply dead code elimination and/or minification.
    isProduction &&
      closure(
        Object.assign({}, closureOptions, {
          // Don't let it create global variables in the browser.
          // https://github.com/facebook/react/issues/10909
          assumeFunctionWrapper: !isInGlobalScope,
          // Works because `google-closure-compiler-js` is forked in Yarn lockfile.
          // We can remove this if GCC merges my PR:
          // https://github.com/google/closure-compiler/pull/2707
          // and then the compiled version is released via `google-closure-compiler-js`.
          renaming: !shouldStayReadable
        })
      ),

    // Add the whitespace back if necessary.
    shouldStayReadable && prettier(),

    // Record bundle size.
    sizes({
      getSize: (size, gzip) => {
        const key = `${filename} (${bundleType})`
        Stats.currentBuildResults.bundleSizes[key] = {
          size,
          gzip
        }
      }
    })
  ].filter(Boolean)
}

function handleRollupWarning(warning) {
  if (warning.code === "UNRESOLVED_IMPORT") {
    console.error(warning.message)
    process.exit(1)
  }
  if (warning.code === "UNUSED_EXTERNAL_IMPORT") {
    const match = warning.message.match(/external module '([^']+)'/)
    if (!match || typeof match[1] !== "string") {
      throw new Error("Could not parse a Rollup warning. " + "Fix this method.")
    }
    const importSideEffects = Modules.getImportSideEffects()
    const externalModule = match[1]
    if (typeof importSideEffects[externalModule] !== "boolean") {
      throw new Error(
        'An external module "' +
          externalModule +
          '" is used in a DEV-only code path ' +
          "but we do not know if it is safe to omit an unused require() to it in production. " +
          "Please add it to the `importSideEffects` list in `scripts/rollup/modules.js`."
      )
    }
    // Don't warn. We will remove side effectless require() in a later pass.
    return
  }
  console.warn(warning.message || warning)
}

function handleRollupError(error) {
  loggedErrors.add(error)
  if (!error.code) {
    console.error(error)
    return
  }
  console.error(
    `\x1b[31m-- ${error.code}${error.plugin ? ` (${error.plugin})` : ""} --`
  )
  console.error(error.message)

  if (error.loc == null) return

  const { file, line, column } = error.loc
  if (file) {
    // This looks like an error from Rollup, e.g. missing export.
    // We'll use the accurate line numbers provided by Rollup but
    // use Babel code frame because it looks nicer.
    const rawLines = fs.readFileSync(file, "utf-8")
    // column + 1 is required due to rollup counting column start position from 0
    // whereas babel-code-frame counts from 1
    const frame = codeFrame(rawLines, line, column + 1, {
      highlightCode: true
    })
    console.error(frame)
  } else {
    // This looks like an error from a plugin (e.g. Babel).
    // In this case we'll resort to displaying the provided code frame
    // because we can't be sure the reported location is accurate.
    console.error(error.codeFrame)
  }
}

async function build(bundle, bundleType) {
  const filename = getFilename(bundle, bundleType)
  const logKey =
    chalk.white.bold(filename) + chalk.dim(` (${bundleType.toLowerCase()})`)
  const format = getFormat(bundleType)
  const packageName = Packaging.getPackageName(bundle.entry)

  let resolvedEntry = require.resolve(bundle.entry)

  const shouldBundleDependencies =
    bundleType === UMD_DEV || bundleType === UMD_PROD
  const peerGlobals = Modules.getPeerGlobals(
    bundle.externals,
    bundle.moduleType
  )
  let externals = Object.keys(peerGlobals)
  if (!shouldBundleDependencies) {
    const deps = Modules.getDependencies(bundleType, bundle.entry)
    externals = externals.concat(deps)
  }

  const importSideEffects = Modules.getImportSideEffects()
  const pureExternalModules = Object.keys(importSideEffects).filter(
    module => !importSideEffects[module]
  )

  const rollupConfig = {
    input: resolvedEntry,
    treeshake: {
      pureExternalModules
    },
    external(id) {
      const containsThisModule = pkg => id === pkg || id.startsWith(pkg + "/")
      const isProvidedByDependency = externals.some(containsThisModule)
      if (!shouldBundleDependencies && isProvidedByDependency) {
        return true
      }
      return !!peerGlobals[id]
    },
    onwarn: handleRollupWarning,
    plugins: getPlugins(
      bundle.entry,
      externals,
      bundle.babel,
      filename,
      bundleType,
      bundle.global,
      bundle.moduleType,
      bundle.modulesToStub
    )
  }
  const [mainOutputPath, ...otherOutputPaths] = Packaging.getBundleOutputPaths(
    "UNIVERSAL",
    filename,
    packageName
  )
  const rollupOutputOptions = getRollupOutputOptions(
    mainOutputPath,
    format,
    peerGlobals,
    bundle.global
  )

  const spinner = ora(logKey).start()
  try {
    const result = await rollup(rollupConfig)
    await result.write(rollupOutputOptions)
  } catch (error) {
    spinner.fail()
    handleRollupError(error)
    throw error
  }
  for (let i = 0; i < otherOutputPaths.length; i++) {
    await asyncCopyTo(mainOutputPath, otherOutputPaths[i])
  }
  spinner.succeed()
}

module.exports = async function(bundle) {
  await build(bundle, NODE_DEV)
  await build(bundle, NODE_PROD)
  // await build(bundle, UMD_DEV)
  // await build(bundle, UMD_PROD)
}
