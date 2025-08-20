import { writeCompiled } from "../catalog"
import { LinguiConfigNormalized } from "@lingui/conf"
import pico from "picocolors"
import { getCatalogs, getMergedCatalogPath } from "../catalog/getCatalogs"
import { CliCompileOptions } from "../../lingui-compile"
import { ProgramExit } from "./ProgramExit"
import { createCompiledCatalog } from "../compile"

import normalizePath from "normalize-path"
import nodepath from "path"
import { createCompilationErrorMessage } from "../messages"
import { getTranslationsForCatalog } from "../catalog/getTranslationsForCatalog"

export async function compileLocale(
  locale: string,
  options: CliCompileOptions,
  config: LinguiConfigNormalized,
  doMerge: boolean
) {
  const catalogs = await getCatalogs(config)

  let mergedCatalogs: Record<string, string> = {}

  await Promise.all(
    catalogs.map(async (catalog) => {
      const { messages, missing: missingMessages } =
        await getTranslationsForCatalog(catalog, locale, {
          fallbackLocales: config.fallbackLocales,
          sourceLocale: config.sourceLocale,
        })

      if (
        !options.allowEmpty &&
        locale !== config.pseudoLocale &&
        missingMessages.length > 0
      ) {
        console.error(
          pico.red(
            `Error: Failed to compile catalog for locale ${pico.bold(locale)}!`
          )
        )

        if (options.verbose) {
          console.error(pico.red("Missing translations:"))
          missingMessages.forEach((missing) => {
            const source =
              missing.source || missing.source === missing.id
                ? `: (${missing.source})`
                : ""

            console.error(`${missing.id}${source}`)
          })
        } else {
          console.error(
            pico.red(`Missing ${missingMessages.length} translation(s)`)
          )
        }
        console.error()
        throw new ProgramExit()
      }

      if (doMerge) {
        mergedCatalogs = { ...mergedCatalogs, ...messages }
      } else {
        if (
          !(await compileAndWrite(
            locale,
            config,
            options,
            catalog.path,
            messages
          ))
        ) {
          throw new ProgramExit()
        }
      }
    })
  )

  if (doMerge) {
    const result = await compileAndWrite(
      locale,
      config,
      options,
      await getMergedCatalogPath(config),
      mergedCatalogs
    )

    if (!result) {
      throw new ProgramExit()
    }
  }
}

async function compileAndWrite(
  locale: string,
  config: LinguiConfigNormalized,
  options: CliCompileOptions,
  writePath: string,
  messages: Record<string, string>
): Promise<boolean> {
  const namespace = options.typescript
    ? "ts"
    : options.namespace || config.compileNamespace
  const { source: compiledCatalog, errors } = createCompiledCatalog(
    locale,
    messages,
    {
      strict: false,
      namespace,
      pseudoLocale: config.pseudoLocale,
      compilerBabelOptions: config.compilerBabelOptions,
    }
  )

  if (errors.length) {
    let message = createCompilationErrorMessage(locale, errors)

    if (options.failOnCompileError) {
      message += `These errors fail command execution because \`--strict\` option passed`
      console.error(pico.red(message))
      return false
    } else {
      message += `You can fail command execution on these errors by passing \`--strict\` option`
      console.error(pico.red(message))
    }
  }

  let compiledPath = await writeCompiled(
    writePath,
    locale,
    compiledCatalog,
    namespace
  )

  compiledPath = normalizePath(nodepath.relative(config.rootDir, compiledPath))

  options.verbose && console.error(pico.green(`${locale} ⇒ ${compiledPath}`))
  return true
}
