import {
  createMissingTranslationFinding,
  getCatalogTranslationsWithMissing,
  MissingTranslationFinding,
} from "../catalog/translations.js"
import { Catalog } from "../catalog.js"
import { runBounded } from "../runBounded.js"
import { CheckContext, CheckDefinition } from "./types.js"

export async function getMissingTranslationFindings(
  catalog: Catalog,
  locale: string,
): Promise<MissingTranslationFinding[]> {
  if (locale === catalog.config.pseudoLocale) {
    return []
  }

  const { missing } = await getCatalogTranslationsWithMissing(catalog, locale)

  return missing.map((entry) =>
    createMissingTranslationFinding(catalog, locale, entry),
  )
}

export const missingCheck: CheckDefinition = {
  name: "missing",
  description:
    "Verify that locale catalogs contain translations for every extracted message before fallbackLocales are applied.",
  cli: {
    options: [],
    examples: [
      {
        description: "Check for missing translations",
        command: "check missing",
      },
      {
        description: "Check missing translations verbosely for a locale",
        command: "check missing --locale pl --verbose",
      },
    ],
  },
  async run(ctx: CheckContext) {
    const tasks = ctx.locales.flatMap((locale) =>
      ctx.catalogs.map((catalog) => ({ locale, catalog })),
    )
    const findings = (
      await runBounded(
        tasks,
        ctx.workersOptions.poolSize,
        async ({ locale, catalog }) =>
          getMissingTranslationFindings(catalog, locale),
      )
    ).flat()

    return {
      name: "missing",
      passed: findings.length === 0,
      findings,
      summary:
        findings.length === 0
          ? "No missing translations found."
          : `Found ${findings.length} missing translation(s).`,
    }
  },
}
