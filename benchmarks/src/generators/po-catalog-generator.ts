import path from "path"
import fs from "fs"
import { makeConfig } from "@lingui/conf"
import { formatter } from "@lingui/format-po"
import type { CatalogType } from "@lingui/conf"
import type { PresetConfig } from "../presets.js"
import { silenceConsole } from "../utils/silence.js"

function generateTranslation(text: string, locale: string): string {
  return `[${locale}] ${text}`
}

export async function generatePoCatalogs(
  fixturesDir: string,
  preset: PresetConfig,
): Promise<void> {
  const { default: extractTemplateCommand } =
    await import("@lingui/cli/commands/extract-template")

  const poFormatter = formatter({ origins: true })

  const config = makeConfig(
    {
      rootDir: fixturesDir,
      locales: preset.locales,
      sourceLocale: "en",
      catalogs: [
        {
          path: path.join(fixturesDir, "locale/{locale}/messages"),
          include: [path.join(fixturesDir, "src")],
          exclude: [],
        },
      ],
      format: poFormatter,
    },
    { skipValidation: true },
  )

  // Run actual extraction to get a template with real origins
  const revert = silenceConsole()

  await extractTemplateCommand(config, {
    verbose: false,
    workersOptions: { poolSize: 0 },
  })

  revert()

  // Read the generated template
  const templatePath = path.join(fixturesDir, "locale", "messages.pot")
  const templateContent = fs.readFileSync(templatePath, "utf-8")
  const templateCatalog: CatalogType = poFormatter.parse(templateContent, {
    locale: undefined,
    sourceLocale: "en",
    filename: templatePath,
  }) as CatalogType

  const entries = Object.entries(templateCatalog)
  const existingCount = Math.floor(entries.length * 0.9)

  // For each locale, write a catalog with 90% translated
  for (const locale of preset.locales) {
    const catalog: CatalogType = {}

    for (let i = 0; i < entries.length; i++) {
      const [id, msg] = entries[i]!
      const hasTranslation = i < existingCount

      catalog[id] = {
        ...msg,
        translation: hasTranslation
          ? locale === "en"
            ? msg.message || ""
            : generateTranslation(msg.message || id, locale)
          : "",
      }
    }

    const localeDir = path.join(fixturesDir, "locale", locale)
    fs.mkdirSync(localeDir, { recursive: true })

    const filename = path.join(localeDir, "messages.po")
    const content = poFormatter.serialize(catalog, {
      locale,
      sourceLocale: "en",
      filename,
      existing: undefined,
    })

    fs.writeFileSync(filename, content as string)
  }
}
