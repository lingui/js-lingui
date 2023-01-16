import chalk from "chalk"
import chokidar from "chokidar"
import fs from "fs"
import * as R from "ramda"
import program from "commander"
import * as plurals from "make-plural"

import { getConfig, LinguiConfig } from "@lingui/conf"

import { getCatalogForMerge, getCatalogs } from "./api/catalog"
import { createCompiledCatalog } from "./api/compile"
import { helpRun } from "./api/help"
import { getFormat } from "./api"

const noMessages: (catalogs: Object[]) => boolean = R.pipe(
  R.map(R.isEmpty),
  R.values,
  R.all(R.equals<any>(true))
)

function command(config: LinguiConfig, options) {
  const catalogs = getCatalogs(config)

  if (noMessages(catalogs)) {
    console.error("Nothing to compile, message catalogs are empty!\n")
    console.error(
      `(use "${chalk.yellow(
        helpRun("extract")
      )}" to extract messages from source files)`
    )
    return false
  }

  // Check config.compile.merge if catalogs for current locale are to be merged into a single compiled file
  const doMerge = !!config.catalogsMergePath
  let mergedCatalogs = {}

  console.error("Compiling message catalogs…")

  config.locales.forEach((locale) => {
    const [language] = locale.split(/[_-]/)
    if (locale !== config.pseudoLocale && !plurals[language]) {
      console.log(
        chalk.red(
          `Error: Invalid locale ${chalk.bold(locale)} (missing plural rules)!`
        )
      )
      console.error()
    }

    catalogs.forEach((catalog) => {
      const messages = catalog.getTranslations(locale, {
        fallbackLocales: config.fallbackLocales,
        sourceLocale: config.sourceLocale,
      })

      if (!options.allowEmpty) {
        const missingMsgIds = R.pipe(R.pickBy(R.isNil), R.keys)(messages)

        if (missingMsgIds.length > 0) {
          console.error(
            chalk.red(
              `Error: Failed to compile catalog for locale ${chalk.bold(
                locale
              )}!`
            )
          )

          if (options.verbose) {
            console.error(chalk.red("Missing translations:"))
            missingMsgIds.forEach((msgId) => console.log(msgId))
          } else {
            console.error(
              chalk.red(`Missing ${missingMsgIds.length} translation(s)`)
            )
          }
          console.error()
          process.exit(1)
        }
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
    })

    if (doMerge) {
      const compileCatalog = getCatalogForMerge(config)
      const namespace = options.namespace || config.compileNamespace
      const compiledCatalog = createCompiledCatalog(locale, mergedCatalogs, {
        strict: false,
        namespace: namespace,
        pseudoLocale: config.pseudoLocale,
        compilerBabelOptions: config.compilerBabelOptions
      })
      const compiledPath = compileCatalog.writeCompiled(
        locale,
        compiledCatalog,
        namespace
      )
      options.verbose && console.log(chalk.green(`${locale} ⇒ ${compiledPath}`))
    }
  })
  return true
}

if (require.main === module) {
  program
    .description(
      "Add compile message catalogs and add language data (plurals) to compiled bundle."
    )
    .option("--config <path>", "Path to the config file")
    .option("--strict", "Disable defaults for missing translations")
    .option("--verbose", "Verbose output")
    .option("--format <format>", "Format of message catalog")
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

  const config = getConfig({ configPath: program.config })

  if (program.format) {
    const msg =
      "--format option is deprecated and will be removed in @lingui/cli@3.0.0." +
      " Please set format in configuration https://lingui.js.org/ref/conf.html#format"
    console.warn(msg)
    config.format = program.format
  }

  const compile = () =>
    command(config, {
      verbose: program.watch || program.verbose || false,
      allowEmpty: !program.strict,
      typescript:
        program.typescript || config.compileNamespace === "ts" || false,
      namespace: program.namespace, // we want this to be undefined if user does not specify so default can be used
    })

  let debounceTimer: NodeJS.Timer
  const dispatchCompile = () => {
    // Skip debouncing if not enabled
    if (!program.debounce) return compile()

    // CLear the previous timer if there is any, and schedule the next
    debounceTimer && clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => compile(), program.debounce)
  }

  // Check if Watch Mode is enabled
  if (program.watch) {
    const NAME = "{name}"
    const LOCALE = "{locale}"

    console.info(chalk.bold("Initializing Watch Mode..."))

    const catalogs = getCatalogs(config)
    let paths = []
    const catalogExtension = getFormat(config.format).catalogExtension

    config.locales.forEach((locale) => {
      catalogs.forEach((catalog) => {
        paths.push(
          `${catalog.path
            .replace(LOCALE, locale)
            .replace(NAME, "*")}${catalogExtension}`
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
