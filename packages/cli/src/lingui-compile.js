// @flow
import chalk from "chalk"
import fs from "fs"
import R from "ramda"
import program from "commander"
import plurals from "make-plural"

import { getConfig } from "@lingui/conf"

import configureCatalog from "./api/catalog"
import { createCompiledCatalog } from "./api/compile"
import { helpRun } from "./api/help"

function command(config, options) {
  const catalog = configureCatalog(config)
  const locales = catalog.getLocales()

  if (!locales.length) {
    console.log("No locales defined!\n")
    console.log(
      `(use "${chalk.yellow(helpRun("add-locale <locale>"))}" to add one)`
    )
    return false
  }

  const catalogs = R.mergeAll(
    locales.map(locale => ({ [locale]: catalog.read(locale) }))
  )

  const noMessages = R.compose(
    R.all(R.equals(true)),
    R.values,
    R.map(R.isEmpty)
  )
  if (noMessages(catalogs)) {
    console.log("Nothing to compile, message catalogs are empty!\n")
    console.log(
      `(use "${chalk.yellow(
        helpRun("extract")
      )}" to extract messages from source files)`
    )
    return false
  }

  console.log("Compiling message catalogs…")

  return locales.map(locale => {
    const [language] = locale.split(/[_-]/)
    if (!plurals[language]) {
      console.log(
        chalk.red(
          `Error: Invalid locale ${chalk.bold(locale)} (missing plural rules)!`
        )
      )
      console.log()
      return false
    }

    const messages = R.mergeAll(
      Object.keys(catalogs[locale]).map(key => ({
        [key]: catalog.getTranslation(catalogs, locale, key, {
          fallbackLocale: config.fallbackLocale,
          sourceLocale: config.sourceLocale
        })
      }))
    )

    if (!options.allowEmpty && config.sourceLocale !== locale) {
      const missing = R.keys(messages).filter(
        key => messages[key] === undefined
      )

      if (missing.length) {
        console.log(
          chalk.red(
            `Error: Failed to compile catalog for locale ${chalk.bold(locale)}!`
          )
        )

        if (options.verbose) {
          console.log(chalk.red("Missing translations:"))
          missing.forEach(msgId => console.log(msgId))
        } else {
          console.log(chalk.red(`Missing ${missing.length} translation(s)`))
        }
        console.log()
        return false
      }
    }

    const compiledCatalog = createCompiledCatalog(
      locale,
      messages,
      false,
      options.namespace || config.compileNamespace,
      config.pseudoLocale
    )
    const compiledPath = catalog.writeCompiled(locale, compiledCatalog)
    if (options.typescript) {
      const typescriptPath = compiledPath.replace(/\.js$/, "") + ".d.ts"
      fs.writeFileSync(
        typescriptPath,
        `import { Catalog } from '@lingui/core';
declare const catalog: Catalog;
export = catalog;
`
      )
    }

    options.verbose && console.log(chalk.green(`${locale} ⇒ ${compiledPath}`))
    return compiledPath
  })
}

if (require.main === module) {
  program
    .description(
      "Add compile message catalogs and add language data (plurals) to compiled bundle."
    )
    .option("--strict", "Disable defaults for missing translations")
    .option("--verbose", "Verbose output")
    .option("--format <format>", "Format of message catalog")
    .option("--typescript", "Create Typescript definition for compiled bundle")
    .option(
      "--namespace <namespace>",
      "Specify namespace for compiled bundle. Ex: cjs(default) -> module.exports, window.test -> window.test"
    )
    .on("--help", function() {
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

  const config = getConfig()

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
    namespace: program.namespace // we want this to be undefined if user does not specify so default can be used
  })

  if (!results || results.some(res => !res)) {
    process.exit(1)
  }

  console.log("Done!")
}
