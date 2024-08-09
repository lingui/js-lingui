import { program } from "commander"

import { getConfig, LinguiConfigNormalized } from "@lingui/conf"
import nodepath from "path"
import { getFormat } from "./api/formats"
import fs from "fs/promises"
import { extractFromFiles } from "./api/catalog/extractFromFiles"
import normalizePath from "normalize-path"

import { bundleSource } from "./extract-experimental/bundleSource"
import {
  writeCatalogs,
  writeTemplate,
} from "./extract-experimental/writeCatalogs"
import { getEntryPoints } from "./extract-experimental/getEntryPoints"
import chalk from "chalk"
import {
  extractFromFileWithBabel,
  getBabelParserOptions,
} from "./api/extractors/babel"

export type CliExtractTemplateOptions = {
  verbose: boolean
  files?: string[]
  template?: boolean
  locales?: string[]
  overwrite?: boolean
  clean?: boolean
}

export default async function command(
  linguiConfig: LinguiConfigNormalized,
  options: Partial<CliExtractTemplateOptions>
): Promise<boolean> {
  options.verbose && console.log("Extracting messages from source files…")

  const config = linguiConfig.experimental?.extractor

  if (!config) {
    throw new Error(
      "The configuration for experimental extractor is empty. Please read the docs."
    )
  }

  console.log(
    chalk.yellow(
      [
        "You have using an experimental feature",
        "Experimental features are not covered by semver, and may cause unexpected or broken application behavior." +
          " Use at your own risk.",
        "",
      ].join("\n")
    )
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
    getEntryPoints(config.entries),
    tempDir,
    linguiConfig.rootDir
  )
  const stats: { entry: string; content: string }[] = []

  let commandSuccess = true

  const format = await getFormat(
    linguiConfig.format,
    linguiConfig.formatOptions,
    linguiConfig.sourceLocale
  )

  linguiConfig.extractors = [
    {
      match(_filename: string) {
        return true
      },

      async extract(filename, code, onMessageExtracted, ctx) {
        const parserOptions = ctx.linguiConfig.extractorParserOptions

        return extractFromFileWithBabel(
          filename,
          code,
          onMessageExtracted,
          ctx,
          {
            plugins: getBabelParserOptions(filename, parserOptions),
          },
          true
        )
      },
    },
  ]

  for (const outFile of Object.keys(bundleResult.metafile.outputs)) {
    const messages = await extractFromFiles([outFile], linguiConfig)

    const { entryPoint } = bundleResult.metafile.outputs[outFile]

    let output: string

    if (!messages) {
      commandSuccess = false
      continue
    }

    if (options.template) {
      output = (
        await writeTemplate({
          linguiConfig,
          clean: options.clean,
          format,
          messages,
          entryPoint,
          outputPattern: config.output,
        })
      ).statMessage
    } else {
      output = (
        await writeCatalogs({
          locales: options.locales || linguiConfig.locales,
          linguiConfig,
          clean: options.clean,
          format,
          messages,
          entryPoint,
          overwrite: options.overwrite,
          outputPattern: config.output,
        })
      ).statMessage
    }

    stats.push({
      entry: normalizePath(nodepath.relative(linguiConfig.rootDir, entryPoint)),
      content: output,
    })
  }

  // cleanup temp directory
  await fs.rm(tempDir, { recursive: true, force: true })

  stats.forEach(({ entry, content }) => {
    console.log([`Catalog statistics for ${entry}:`, content, ""].join("\n"))
  })

  return commandSuccess
}

type CliOptions = {
  config?: string
  verbose?: boolean
  template?: boolean
  locale?: string
  overwrite?: boolean
  clean?: boolean
}

if (require.main === module) {
  program
    .option("--config <path>", "Path to the config file")
    .option("--template", "Extract to template")
    .option("--overwrite", "Overwrite translations for source locale")
    .option("--clean", "Remove obsolete translations")
    .option("--locale <locale, [...]>", "Only extract the specified locales")
    .option("--verbose", "Verbose output")
    .parse(process.argv)

  const options = program.opts<CliOptions>()

  const config = getConfig({
    configPath: options.config,
  })

  const result = command(config, {
    verbose: options.verbose || false,
    template: options.template,
    locales: options.locale?.split(","),
    overwrite: options.overwrite,
    clean: options.clean,
  }).then(() => {
    if (!result) process.exit(1)
  })
}
