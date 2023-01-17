import {BundleDef} from "./bundles"
import {getPackageDir} from "./utils"

import * as fs from "fs"
import * as path from "path"
import dts from 'rollup-plugin-dts'

import {ModuleFormat, rollup, RollupBuild, RollupError, RollupOptions, RollupWarning} from "rollup"
import babel from "@rollup/plugin-babel"
import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
import babelConfig from './babel.config';

import ora from "ora";
import chalk from "chalk";

const codeFrame = require("@babel/code-frame")

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

function getFilename(bundle: BundleDef) {
  const filename = bundle.label || 'index'
  return `${filename}.js`
}

function handleRollupWarning(warning: RollupWarning, dts: boolean) {
  if (warning.code === "UNRESOLVED_IMPORT") {
    console.error(warning.message)
    process.exit(1)
  }
  if (warning.code === "EMPTY_BUNDLE" && dts) {
    return;
  }

  console.warn(warning.message || warning)
}

function handleRollupError(error: RollupError) {
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
    console.error(error.frame)
  }
}

function getInput(bundle: BundleDef): string {
  const packageDir = path.join(getPackageDir(bundle.packageName))
  return path.resolve(packageDir, bundle.entry || 'index.js')
}

async function generateTypings(bundle: BundleDef) {
  const packageDir = path.join(getPackageDir(bundle.packageName))
  const buildDir = path.join(packageDir, "build")

  const name = bundle.label || "index"
  const rollupConfig: RollupOptions = {
    input: getInput(bundle),
    onwarn: (warn) => handleRollupWarning(warn, true),
    plugins: [dts({
      compilerOptions: {
        allowJs: true
      }
    })]
  }

  const logKey = `${chalk.white.bold(bundle.packageName)} ${chalk.white.dim('(typings)')}`

  const spinner = ora(logKey).start()

  try {
    const rollupBundle = await rollup(rollupConfig)
    await rollupBundle.write({
      file: `${buildDir}/${name}.d.ts`,
      format: 'es',
      validate: false
    })
    await rollupBundle.close();
  } catch (error) {
    spinner.fail()
    handleRollupError(error)
    throw error
  }

  spinner.succeed()
}

async function build(bundle: BundleDef) {
  const filename = getFilename(bundle)

  const rollupConfig: RollupOptions = {
    input: getInput(bundle),

    external: (id: string) => {
      return /node_modules/.test(id) || (bundle.externals || []).some((pkg) => id.includes(pkg))
    },
    onwarn: (warn) => handleRollupWarning(warn, false),
    plugins: [
      // Use Node resolution mechanism.
      resolve({
        extensions
      }),

      // Compile to ES5.
      babel({
        ...babelConfig(false),
        babelrc: false,
        configFile: false,
        exclude: "node_modules/**",
        extensions,
        babelHelpers: "runtime"
      }),
      // We still need CommonJS for external deps like object-assign.
      commonjs()
    ]
  };


  let rollupBundle: RollupBuild

  const logKey = chalk.white.bold([bundle.packageName, bundle.label].filter(Boolean).join("/"))
  const spinner = ora(logKey).start()

  try {
    rollupBundle = await rollup(rollupConfig)
  } catch (error) {
    spinner.fail()
    handleRollupError(error)
    throw error
  }

  const outputs: ModuleFormat[] = ['esm', 'cjs'];

  for (const format of outputs) {
    await rollupBundle.write({
      file: getPackageDir(bundle.packageName, 'build', format, filename),
      format,
      sourcemap: true
    })
  }

  await rollupBundle.close()

  spinner.succeed()
}

export default async function (bundle: BundleDef) {
  await build(bundle)
  await generateTypings(bundle);
}
