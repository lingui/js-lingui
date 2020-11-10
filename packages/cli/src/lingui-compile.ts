import chalk from "chalk"
import fs from "fs"
import * as R from "ramda"
import program from "commander"
import * as plurals from "make-plural"

import { getConfig } from "@lingui/conf"

import { getCatalogs } from "./api/catalog"
import { createCompiledCatalog } from "./api/compile"
import { helpRun } from "./api/help"

const noMessages: (catalogs: Object[]) => boolean = R.pipe(
  R.map(R.isEmpty),
  R.values,
  R.all(R.equals<any>(true))
)

function command(config, options) {
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
      process.exit(1)
    }

    catalogs.forEach((catalog) => {
      const messages = catalog.getTranslations(
        locale,
        {
          fallbackLocales: config.fallbackLocales,
          sourceLocale: config.sourceLocale,
        }
      )

      if (!options.allowEmpty) {
        const missing = R.values(messages)

        if (missing.some(R.isNil)) {
          console.error(
            chalk.red(
              `Error: Failed to compile catalog for locale ${chalk.bold(
                locale
              )}!`
            )
          )

          if (options.verbose) {
            console.error(chalk.red("Missing translations:"))
            missing.forEach((msgId) => console.log(msgId))
          } else {
            console.error(chalk.red(`Missing ${missing.length} translation(s)`))
          }
          console.error()
          process.exit(1)
        }
      }

      if (doMerge) {
        mergedCatalogs = { ...mergedCatalogs, ...messages }
      } else {
        const namespace = options.namespace || config.compileNamespace
        const compiledCatalog = createCompiledCatalog(locale, messages, {
          strict: false,
          namespace,
          pseudoLocale: config.pseudoLocale,
        })

        const compiledPath = catalog.writeCompiled(
          locale,
          compiledCatalog,
          namespace
        )

        if (options.typescript) {
          const typescriptPath = compiledPath.replace(/\.jsx?$/, "") + ".d.ts"
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
    .on("--help", function () {
      console.log("\n  Examples:\n")
      console.log(
        "    # Compile translations and use defaults or message IDs for missing translations"
      )
      console.log(`    $ ${helpRun("compile")}`)
      console.log("")
      console.log("    # Compile translations but fail when there're missing")
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

  const results = command(config, {
    verbose: program.verbose || false,
    allowEmpty: !program.strict,
    typescript: program.typescript || false,
    namespace: program.namespace, // we want this to be undefined if user does not specify so default can be used
  })

  if (!results) {
    process.exit(1)
  }

  console.log("Done!")
}
