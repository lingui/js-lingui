import {
  createMissingTranslationFinding,
  getCatalogTranslationsWithMissing,
  MissingTranslationFinding,
} from "../catalog/translations.js"
import { Catalog } from "../catalog.js"
import { runBounded } from "../runBounded.js"
import { CheckContext, CheckDefinition } from "./types.js"
import type { MissingBehavior } from "../catalog/getTranslationsForCatalog.js"
import { getMissingBehaviorDescription } from "../messages.js"

export async function getMissingTranslationFindings(
  catalog: Catalog,
  locale: string,
  missingBehavior: MissingBehavior = "resolved",
): Promise<MissingTranslationFinding[]> {
  if (locale === catalog.config.pseudoLocale) {
    return []
  }

  const { missing } = await getCatalogTranslationsWithMissing(
    catalog,
    locale,
    missingBehavior,
  )

  return missing.map((entry) =>
    createMissingTranslationFinding(catalog, locale, entry),
  )
}

export const missingCheck: CheckDefinition = {
  name: "missing",
  description:
    "Verify that message catalogs have no missing translations after fallbackLocales are applied.",
  cli: {
    options: [
      {
        name: "mode",
        runOption: "missingBehavior",
        description:
          "Missing translation behavior: resolved (after fallbackLocales) or catalog (before fallbackLocales)",
      },
    ],
    examples: [
      {
        description: "Check for missing translations after fallbackLocales",
        command: "check missing",
      },
      {
        description: "Check target catalogs before fallbackLocales",
        command: "check missing --mode catalog",
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
          getMissingTranslationFindings(catalog, locale, ctx.missingBehavior),
      )
    ).flat()
    const missingBehaviorDescription = getMissingBehaviorDescription(
      ctx.missingBehavior,
    )

    return {
      name: "missing",
      passed: findings.length === 0,
      findings,
      summary:
        findings.length === 0
          ? `No missing translations found ${missingBehaviorDescription}.`
          : `Found ${findings.length} missing translation(s) ${missingBehaviorDescription}.`,
    }
  },
}
