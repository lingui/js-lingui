import { program } from "commander"

import {
  getConfig,
  LinguiConfigNormalized,
  ExtractedCatalogType,
  ExperimentalExtractorBundler,
} from "@lingui/conf"
import nodepath from "path"
import { getFormat } from "./api/formats/index.js"
import fs from "fs/promises"
import normalizePath from "normalize-path"

import { createEsbuildBundler } from "./extract-experimental/bundlers/esbuild.js"
import { globSync } from "node:fs"
import { styleText } from "node:util"
import {
  resolveWorkersOptions,
  WorkersOptions,
} from "./api/resolveWorkersOptions.js"
import { extractFromChunk } from "./extract-experimental/extractFromChunk.js"
import {
  writeCatalogs,
  writeTemplate,
} from "./extract-experimental/writeCatalogs.js"
import { createExtractExperimentalWorkerPool } from "./api/workerPools.js"
import { buildChunkGraph } from "./extract-experimental/buildChunkGraph.js"
import { mergeExtractedMessage } from "./api/catalog/extractFromFiles.js"
import ora from "ora"
import ms from "ms"

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
  const startTime = Date.now()

  const extractorConfig = linguiConfig.experimental?.extractor

  if (!extractorConfig) {
    throw new Error(
      "The configuration for experimental extractor is empty. Please read the docs.",
    )
  }

  console.log(
    styleText(
      "yellow",
      [
        "You have using an experimental feature",
        "Experimental features are not covered by semver, and may cause unexpected or broken application behavior." +
          " Use at your own risk.",
        "",
      ].join("\n"),
    ),
  )

  // important to initialize ora before worker pool, otherwise it causes
  // MaxListenersExceededWarning when workers >= 10
  const spinner = ora()

  // Phase: Resolve entry points
  spinner.start("Resolving entry points...")
  let phaseStart = Date.now()
  const entryPoints = globSync(extractorConfig.entries)

  if (entryPoints.length === 0) {
    spinner.warn(`No entry points found (${ms(Date.now() - phaseStart)})`)
    return true
  }

  const displayEntries = entryPoints
    .map((e) => normalizePath(nodepath.relative(linguiConfig.rootDir, e)))
    .slice(0, 10)
  const moreCount = entryPoints.length - displayEntries.length
  const entrySummary =
    displayEntries.join(", ") + (moreCount > 0 ? ` and ${moreCount} more` : "")
  spinner.succeed(
    `Found ${entryPoints.length} entry point(s) (${ms(Date.now() - phaseStart)}): ${entrySummary}`,
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

  let bundler: ExperimentalExtractorBundler
  if (extractorConfig.bundler) {
    bundler = extractorConfig.bundler
  } else {
    bundler = createEsbuildBundler({
      includeDeps: extractorConfig.includeDeps,
      excludeExtensions: extractorConfig.excludeExtensions,
      resolveEsbuildOptions: extractorConfig.resolveEsbuildOptions,
    })
  }

  // Phase: Bundling
  spinner.start("Bundling...")
  phaseStart = Date.now()
  const bundleResult = await bundler.bundle(entryPoints, tempDir, linguiConfig)
  spinner.succeed(`Bundling done (${ms(Date.now() - phaseStart)})`)

  const resolvedChunks = buildChunkGraph(bundleResult.chunks)

  const stats: { entry: string; content: string }[] = []

  let commandSuccess = true

  // Phase: Extract messages from each chunk
  spinner.start("Extracting messages...")
  phaseStart = Date.now()
  const messagesByEntry = new Map<string, ExtractedCatalogType>()

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
        resolvedChunks.map(async ({ filePath, entryPoints }) => {
          const { messages, success } = await pool.run(
            resolvedConfigPath,
            filePath,
          )

          if (!success) {
            commandSuccess = false
          }

          for (const entryPoint of entryPoints) {
            if (!messagesByEntry.has(entryPoint)) {
              messagesByEntry.set(entryPoint, {})
            }

            messages.forEach((message) => {
              mergeExtractedMessage(
                message,
                messagesByEntry.get(entryPoint)!,
                linguiConfig,
              )
            })
          }
        }),
      )
    } finally {
      await pool.destroy()
    }
  } else {
    await Promise.all(
      resolvedChunks.map(async ({ filePath, entryPoints }) => {
        const { messages, success } = await extractFromChunk(
          filePath,
          linguiConfig,
        )

        if (!success) {
          commandSuccess = false
        }

        for (const entryPoint of entryPoints) {
          if (!messagesByEntry.has(entryPoint)) {
            messagesByEntry.set(entryPoint, {})
          }

          messages.forEach((message) => {
            mergeExtractedMessage(
              message,
              messagesByEntry.get(entryPoint)!,
              linguiConfig,
            )
          })
        }
      }),
    )
  }
  spinner.succeed(`Extracting done (${ms(Date.now() - phaseStart)})`)

  // Phase: Write catalogs per entry point
  spinner.start("Writing catalogs...")
  phaseStart = Date.now()
  const format = await getFormat(linguiConfig.format, linguiConfig.sourceLocale)
  const locales = options.locales || linguiConfig.locales

  for (const [entryPoint, messages] of messagesByEntry) {
    let stat: string

    if (options.template) {
      stat = (
        await writeTemplate({
          linguiConfig,
          clean: options.clean || false,
          format,
          messages,
          entryPoint,
          outputPattern: extractorConfig.output,
        })
      ).statMessage
    } else {
      stat = (
        await writeCatalogs({
          locales,
          linguiConfig,
          clean: options.clean || false,
          format,
          messages,
          entryPoint,
          overwrite: options.overwrite || false,
          outputPattern: extractorConfig.output,
        })
      ).statMessage
    }

    stats.push({
      entry: normalizePath(nodepath.relative(linguiConfig.rootDir, entryPoint)),
      content: stat,
    })
  }
  spinner.succeed(`Writing catalogs done (${ms(Date.now() - phaseStart)})`)

  // cleanup temp directory
  await fs.rm(tempDir, { recursive: true, force: true })

  stats
    .sort((a, b) => a.entry.localeCompare(b.entry))
    .forEach(({ entry, content }) => {
      console.log([`Catalog statistics for ${entry}:`, content, ""].join("\n"))
    })

  const totalTime = Date.now() - startTime
  if (commandSuccess) {
    console.log(
      styleText(
        "green",
        `Extraction completed successfully in ${ms(totalTime)}`,
      ),
    )
  } else {
    console.log(
      styleText("red", `Extraction completed with errors in ${ms(totalTime)}`),
    )
  }

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

if (import.meta.main) {
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
