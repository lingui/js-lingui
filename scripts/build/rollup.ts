import {BundleDef, BundleType} from "./bundles"
import {asyncCopyTo, getPackageDir} from "./utils"
import * as Modules from "./modules"
import * as Packaging from "./packaging"
import * as Stats from "./stats"

import * as fs from "fs";
import * as path from "path";
import sizes from "./plugins/sizes";

const { rollup } = require("rollup")
const babel = require("rollup-plugin-babel")
const { terser } = require("rollup-plugin-terser")
const commonjs = require("rollup-plugin-commonjs")
const resolve = require("rollup-plugin-node-resolve")
const prettier = require("rollup-plugin-prettier")
const replace = require("rollup-plugin-replace")
const typescript = require("rollup-plugin-typescript2")
const ora = require("ora")
const chalk = require("chalk")
const argv = require("minimist")(process.argv.slice(2))
const codeFrame = require("babel-code-frame")
const babelConfig = require("./babel.config")

enum RollupBundleType {
  UMD_DEV= "UMD_DEV",
  UMD_PROD= "UMD_PROD",
  NODE_DEV= "NODE_DEV",
  NODE_PROD= "NODE_PROD",
  ESM_PROD= "ESM_PROD",
  ESM_DEV= "ESM_DEV",
}

const extensions = [".js", ".ts", ".tsx"]

// Errors in promises should be fatal.
let loggedErrors = new Set()
process.on("unhandledRejection", (err) => {
  if (loggedErrors.has(err)) {
    // No need to print it twice.
    process.exit(1)
  }
  throw err
})

const forcePrettyOutput = argv.pretty

function getBabelConfig() {
  return Object.assign({}, babelConfig({ modules: false }), {
    babelrc: false,
    exclude: "node_modules/**",
    extensions,
    runtimeHelpers: true,
  })
}

function getRollupOutputOptions(outputPath: string, format, globals, globalName) {
  return {
    file: outputPath,
    format,
    globals,
    interop: true, // might be turned off with Babel 7, please review
    name: globalName,
    sourcemap: true,
  }
}

function getFormat(bundleType: RollupBundleType) {
  switch (bundleType) {
    case RollupBundleType.UMD_DEV:
    case RollupBundleType.UMD_PROD:
      return 'umd'
    case RollupBundleType.NODE_DEV:
    case RollupBundleType.NODE_PROD:
      return 'cjs'
    case RollupBundleType.ESM_PROD:
    case RollupBundleType.ESM_DEV:
      return 'es'
  }
}

function getFilename(bundle: BundleDef, bundleType: RollupBundleType) {
  const filename = bundle.label || bundle.packageName
  switch (bundleType) {
    case RollupBundleType.NODE_DEV:
    case RollupBundleType.ESM_DEV:
    case RollupBundleType.UMD_DEV:
      return `${filename}.development.js`
    case RollupBundleType.UMD_PROD:
    case RollupBundleType.NODE_PROD:
    case RollupBundleType.ESM_PROD:
      return `${filename}.production.min.js`
  }
}

function isProductionBundleType(bundleType: RollupBundleType) {
  switch (bundleType) {
    case RollupBundleType.UMD_DEV:
    case RollupBundleType.NODE_DEV:
    case RollupBundleType.ESM_DEV:
      return false
    case RollupBundleType.UMD_PROD:
    case RollupBundleType.NODE_PROD:
    case RollupBundleType.ESM_PROD:
      return true
    default:
      throw new Error(`Unknown type: ${bundleType}`)
  }
}

function getPlugins(
  packageName: string,
  externals,
  updateBabelOptions,
  filename,
  bundleType: RollupBundleType,
) {
  const isProduction = isProductionBundleType(bundleType)
  const isInGlobalScope = bundleType === RollupBundleType.UMD_DEV || bundleType === RollupBundleType.UMD_PROD
  const shouldStayReadable = forcePrettyOutput

  const packageDir = path.join(getPackageDir(packageName), "src")

  return [
    // Use Node resolution mechanism.
    resolve({
      extensions,
    }),

    typescript({
      tsconfigOverride: {
        include: [`${packageDir}/**/*.ts`, `${packageDir}/**/*.tsx`],
        exclude: ["**/*.test.ts", "**/*.test.tsx"],
        compilerOptions: {
          rootDir: packageDir,
          declaration: true,
          declarationMap: true,
          mapRoot: "",
          paths: null,
          module: "esnext",
          target: "esnext",
        },
      },
    }),

    // Compile to ES5.
    babel(getBabelConfig()),
    // Turn process.env checks into constants.
    replace({
      "process.env.NODE_ENV": isProduction ? "'production'" : "'development'",
    }),

    // We still need CommonJS for external deps like object-assign.
    commonjs(),

    // Apply dead code elimination and/or minification.
    isProduction &&
    terser({
      output: { comments: false },
      compress: {
        keep_infinity: true,
        pure_getters: true,
        collapse_vars: false,
      },
      ecma: 5,
      toplevel: !isInGlobalScope,
      warnings: true,
    }),

    // Add the whitespace back if necessary.
    shouldStayReadable && prettier(),

    // Record bundle size.
    sizes({
      getSize: (name, size, gzip) => {
        const key = `@lingui/${name} (${bundleType})`
        Stats.currentBuildResults.bundleSizes[key] = {
          size,
          gzip,
        }
      },
    }),
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
      throw new Error("Could not parse a Rollup warning. Fix this method.")
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
      highlightCode: true,
    })
    console.error(frame)
  } else {
    // This looks like an error from a plugin (e.g. Babel).
    // In this case we'll resort to displaying the provided code frame
    // because we can't be sure the reported location is accurate.
    console.error(error.codeFrame)
  }
}


async function build(bundle: BundleDef, bundleType: RollupBundleType) {
  const filename = getFilename(bundle, bundleType)
  const logKey =
    chalk.white.bold(filename) + chalk.dim(` (${bundleType.toLowerCase()})`)
  const format = getFormat(bundleType)


  const shouldBundleDependencies =
    bundleType === RollupBundleType.UMD_DEV || bundleType === RollupBundleType.UMD_PROD
  const peerGlobals = Modules.getPeerGlobals(
    bundle.externals,
    bundle.moduleType
  )
  let externals = Object.keys(peerGlobals)
  if (!shouldBundleDependencies) {
    const deps = Modules.getDependencies(bundle.packageName)
    externals = externals.concat(deps)
  }

  const importSideEffects = Modules.getImportSideEffects()
  const moduleSideEffects = Object.keys(importSideEffects).filter(
    (module) => !importSideEffects[module]
  )

  const rollupConfig = {
    input: path.resolve(getPackageDir(bundle.packageName), bundle.entry || 'index.js'),
    treeshake: {
      moduleSideEffects,
    },
    external(id) {
      const containsThisModule = (pkg) => id === pkg || id.startsWith(pkg + "/")
      const isProvidedByDependency = externals.some(containsThisModule)
      if (!shouldBundleDependencies && isProvidedByDependency) {
        return true
      }
      return !!peerGlobals[id]
    },
    onwarn: handleRollupWarning,
    plugins: getPlugins(
      bundle.packageName,
      externals,
      bundle.babel,
      filename,
      bundleType,
    ),
  }
  const [mainOutputPath, ...otherOutputPaths] = Packaging.getBundleOutputPaths(
    bundleType === RollupBundleType.ESM_PROD || bundleType === RollupBundleType.ESM_DEV
      ? BundleType.ESM
      : BundleType.UNIVERSAL,
    filename,
    bundle.packageName
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

export default async function (bundle: BundleDef) {
  await build(bundle, RollupBundleType.NODE_DEV)
  await build(bundle, RollupBundleType.NODE_PROD)
  await build(bundle, RollupBundleType.ESM_DEV)
  await build(bundle, RollupBundleType.ESM_PROD)

  // await build(bundle, UMD_DEV)
  // await build(bundle, UMD_PROD)
}
