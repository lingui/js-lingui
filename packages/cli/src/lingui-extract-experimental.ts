import { program } from "commander"

import { getConfig, LinguiConfigNormalized } from "@lingui/conf"
import nodepath from "path"
import { getFormat } from "./api/formats/index.js"
import fs from "fs/promises"
import normalizePath from "normalize-path"

import { bundleSource } from "./extract-experimental/bundleSource.js"
import { getEntryPoints } from "./extract-experimental/getEntryPoints.js"
import pico from "picocolors"
import {
  resolveWorkersOptions,
  WorkersOptions,
} from "./api/resolveWorkersOptions.js"
import { extractFromBundleAndWrite } from "./extract-experimental/extractFromBundleAndWrite.js"
import { createExtractExperimentalWorkerPool } from "./api/workerPools.js"
import esMain from "es-main"

type CliExtractTemplateOptions = {
  verbose?: boolean
  files?: string[]
  template?: boolean
  locales?: string[]
  overwrite?: boolean
  clean?: boolean
  workersOptions: WorkersOptions
}

export default async function command(
  linguiConfig: LinguiConfigNormalized,
  options: CliExtractTemplateOptions,
): Promise<boolean> {
  options.verbose && console.log("Extracting messages from source files…")

  const extractorConfig = linguiConfig.experimental?.extractor

  if (!extractorConfig) {
    throw new Error(
      "The configuration for experimental extractor is empty. Please read the docs.",
    )
  }

  console.log(
    pico.yellow(
      [
        "You have using an experimental feature",
        "Experimental features are not covered by semver, and may cause unexpected or broken application behavior." +
          " Use at your own risk.",
        "",
      ].join("\n"),
    ),
  )

  // unfortunately we can't use os.tmpdir() in this case
  // on windows it might create a folder on a different disk then source code is stored
  // (tmpdir would be always on C: but code could be stored on D:)
  // and then relative path in sourcemaps produced by esbuild will be broken.
  // sourcemaps itself doesn't allow to have absolute windows path, because they are not URL compatible.
  // that's why we store esbuild bundles in .lingui folder
  const tmpPrefix = ".lingui/"
  await fs.mkdir(tmpPrefix, { recursive: true })
  const tempDir = await fs.mkdtemp(tmpPrefix)
  await fs.rm(tempDir, { recursive: true, force: true })

  const bundleResult = await bundleSource(
    linguiConfig,
    extractorConfig,
    getEntryPoints(extractorConfig.entries),
    tempDir,
    linguiConfig.rootDir,
  )
  const stats: { entry: string; content: string }[] = []

  let commandSuccess = true

  if (options.workersOptions.poolSize) {
    const resolvedConfigPath = linguiConfig.resolvedConfigPath
    if (!resolvedConfigPath) {
      throw new Error(
        "Multithreading is only supported when lingui config loaded from file system, not passed by API",
      )
    }

    options.verbose &&
      console.log(`Use worker pool of size ${options.workersOptions.poolSize}`)

    const pool = createExtractExperimentalWorkerPool({
      poolSize: options.workersOptions.poolSize,
    })

    try {
      await Promise.all(
        Object.keys(bundleResult.outputs).map(async (outFile) => {
          const { entryPoint } = bundleResult.outputs[outFile]!

          const result = await pool.run([
            resolvedConfigPath,
            entryPoint!,
            outFile,
            extractorConfig.output,
            options.template || false,
            options.locales || linguiConfig.locales,
            options.clean || false,
            options.overwrite || false,
          ])

          commandSuccess &&= result.success

          if (result.success) {
            stats.push({
              entry: normalizePath(
                nodepath.relative(linguiConfig.rootDir, entryPoint!),
              ),
              content: result.stat,
            })
          }
        }),
      )
    } finally {
      await pool.destroy()
    }
  } else {
    const format = await getFormat(
      linguiConfig.format,
      linguiConfig.formatOptions,
      linguiConfig.sourceLocale,
    )

    for (const outFile of Object.keys(bundleResult.outputs)) {
      const { entryPoint } = bundleResult.outputs[outFile]!

      const result = await extractFromBundleAndWrite({
        entryPoint: entryPoint!,
        bundleFile: outFile,
        outputPattern: extractorConfig.output,
        format,
        linguiConfig,
        locales: options.locales || linguiConfig.locales,
        overwrite: options.overwrite || false,
        clean: options.clean || false,
        template: options.template || false,
      })

      commandSuccess &&= result.success

      if (result.success) {
        stats.push({
          entry: normalizePath(
            nodepath.relative(linguiConfig.rootDir, entryPoint!),
          ),
          content: result.stat,
        })
      }
    }
  }

  // cleanup temp directory
  await fs.rm(tempDir, { recursive: true, force: true })

  stats
    .sort((a, b) => a.entry.localeCompare(b.entry))
    .forEach(({ entry, content }) => {
      console.log([`Catalog statistics for ${entry}:`, content, ""].join("\n"))
    })

  return commandSuccess
}

type CliArgs = {
  config?: string
  verbose?: boolean
  template?: boolean
  locale?: string
  overwrite?: boolean
  clean?: boolean
  workers?: number
}

if (esMain(import.meta)) {
  program
    .option("--config <path>", "Path to the config file")
    .option("--template", "Extract to template")
    .option("--overwrite", "Overwrite translations for source locale")
    .option("--clean", "Remove obsolete translations")
    .option("--locale <locale, [...]>", "Only extract the specified locales")
    .option("--verbose", "Verbose output")
    .option(
      "--workers <n>",
      "Number of worker threads to use (default: CPU count - 1, capped at 8). Pass `--workers 1` to disable worker threads and run everything in a single process",
    )
    .parse(process.argv)

  const options = program.opts<CliArgs>()

  const config = getConfig({
    configPath: options.config,
  })

  const result = command(config, {
    verbose: options.verbose || false,
    template: options.template,
    locales: options.locale?.split(","),
    overwrite: options.overwrite,
    clean: options.clean,
    workersOptions: resolveWorkersOptions(options),
  }).then(() => {
    if (!result) process.exit(1)
  })
}
