import chalk from "chalk"
import chokidar from "chokidar"
import fs from "fs"
import { program } from "commander"
import * as plurals from "make-plural"

import { getConfig, LinguiConfigNormalized } from "@lingui/conf"

import { createCompiledCatalog } from "./api/compile"
import { helpRun } from "./api/help"
import { getCatalogs, getFormat } from "./api"
import { TranslationMissingEvent } from "./api/catalog/getTranslationsForCatalog"
import { getCatalogForMerge } from "./api/catalog/getCatalogs"

export type CliCompileOptions = {
  verbose?: boolean
  allowEmpty?: boolean
  typescript?: boolean
  watch?: boolean
  namespace?: string
}

export function command(
  config: LinguiConfigNormalized,
  options: CliCompileOptions
) {
  const catalogs = getCatalogs(config)

  // Check config.compile.merge if catalogs for current locale are to be merged into a single compiled file
  const doMerge = !!config.catalogsMergePath
  let mergedCatalogs = {}

  console.log("Compiling message catalogs…")

  for (const locale of config.locales) {
    const [language] = locale.split(/[_-]/)
    // todo: this validation should be in @lingui/conf
    // todo: validate locales according bcp47, instead of plurals
    if (locale !== config.pseudoLocale && !(plurals as any)[language]) {
      console.error(
        chalk.red(
          `Error: Invalid locale ${chalk.bold(locale)} (missing plural rules)!`
        )
      )
      console.error()
    }

    for (const catalog of catalogs) {
      const missingMessages: TranslationMissingEvent[] = []

      const messages = catalog.getTranslations(locale, {
        fallbackLocales: config.fallbackLocales,
        sourceLocale: config.sourceLocale,
        onMissing: (missing) => {
          missingMessages.push(missing)
        },
      })

      if (!options.allowEmpty && missingMessages.length > 0) {
        console.error(
          chalk.red(
            `Error: Failed to compile catalog for locale ${chalk.bold(locale)}!`
          )
        )

        if (options.verbose) {
          console.error(chalk.red("Missing translations:"))
          missingMessages.forEach((missing) => {
            const source =
              missing.source || missing.source === missing.id
                ? `: (${missing.source})`
                : ""

            console.error(`${missing.id}${source}`)
          })
        } else {
          console.error(
            chalk.red(`Missing ${missingMessages.length} translation(s)`)
          )
        }
        console.error()
        return false
      }

      if (doMerge) {
        mergedCatalogs = { ...mergedCatalogs, ...messages }
      } else {
        const namespace = options.typescript
          ? "ts"
          : options.namespace || config.compileNamespace
        const compiledCatalog = createCompiledCatalog(locale, messages, {
          strict: false,
          namespace,
          pseudoLocale: config.pseudoLocale,
          compilerBabelOptions: config.compilerBabelOptions,
        })

        const compiledPath = catalog.writeCompiled(
          locale,
          compiledCatalog,
          namespace
        )

        if (options.typescript) {
          const typescriptPath = compiledPath.replace(/\.ts?$/, "") + ".d.ts"
          fs.writeFileSync(
            typescriptPath,
            `import { Messages } from '@lingui/core';
          declare const messages: Messages;
          export { messages };
          `
          )
        }

        options.verbose &&
          console.error(chalk.green(`${locale} ⇒ ${compiledPath}`))
      }
    }

    if (doMerge) {
      const compileCatalog = getCatalogForMerge(config)
      const namespace = options.namespace || config.compileNamespace
      const compiledCatalog = createCompiledCatalog(locale, mergedCatalogs, {
        strict: false,
        namespace: namespace,
        pseudoLocale: config.pseudoLocale,
        compilerBabelOptions: config.compilerBabelOptions,
      })
      const compiledPath = compileCatalog.writeCompiled(
        locale,
        compiledCatalog,
        namespace
      )
      options.verbose && console.log(chalk.green(`${locale} ⇒ ${compiledPath}`))
    }
  }
  return true
}

type CliOptions = {
  verbose?: boolean
  allowEmpty?: boolean
  typescript?: boolean
  watch?: boolean
  namespace?: string
  strict?: string
  config?: string
  debounce?: number
}

if (require.main === module) {
  program
    .description(
      "Add compile message catalogs and add language data (plurals) to compiled bundle."
    )
    .option("--config <path>", "Path to the config file")
    .option("--strict", "Disable defaults for missing translations")
    .option("--verbose", "Verbose output")
    .option("--typescript", "Create Typescript definition for compiled bundle")
    .option(
      "--namespace <namespace>",
      "Specify namespace for compiled bundle. Ex: cjs(default) -> module.exports, es -> export, window.test -> window.test"
    )
    .option("--watch", "Enables Watch Mode")
    .option(
      "--debounce <delay>",
      "Debounces compilation for given amount of milliseconds"
    )
    .on("--help", function () {
      console.log("\n  Examples:\n")
      console.log(
        "    # Compile translations and use defaults or message IDs for missing translations"
      )
      console.log(`    $ ${helpRun("compile")}`)
      console.log("")
      console.log("    # Compile translations but fail when there are missing")
      console.log("    # translations (don't replace missing translations with")
      console.log("    # default messages or message IDs)")
      console.log(`    $ ${helpRun("compile --strict")}`)
    })
    .parse(process.argv)

  const options = program.opts<CliOptions>()

  const config = getConfig({ configPath: options.config })

  const compile = () =>
    command(config, {
      verbose: options.watch || options.verbose || false,
      allowEmpty: !options.strict,
      typescript:
        options.typescript || config.compileNamespace === "ts" || false,
      namespace: options.namespace, // we want this to be undefined if user does not specify so default can be used
    })

  let debounceTimer: NodeJS.Timer
  const dispatchCompile = () => {
    // Skip debouncing if not enabled
    if (!options.debounce) return compile()

    // CLear the previous timer if there is any, and schedule the next
    debounceTimer && clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => compile(), options.debounce)
  }

  // Check if Watch Mode is enabled
  if (options.watch) {
    console.info(chalk.bold("Initializing Watch Mode..."))

    const catalogs = getCatalogs(config)
    let paths: string[] = []
    const catalogExtension = getFormat(config.format).catalogExtension

    config.locales.forEach((locale) => {
      catalogs.forEach((catalog) => {
        paths.push(
          `${catalog.path
            .replace(/{locale}/g, locale)
            .replace(/{name}/g, "*")}${catalogExtension}`
        )
      })
    })

    const watcher = chokidar.watch(paths, {
      persistent: true,
    })

    const onReady = () => {
      console.info(chalk.green.bold("Watcher is ready!"))
      watcher
        .on("add", () => dispatchCompile())
        .on("change", () => dispatchCompile())
    }

    watcher.on("ready", () => onReady())
  } else {
    const results = compile()

    if (!results) {
      process.exit(1)
    }

    console.log("Done!")
  }
}
