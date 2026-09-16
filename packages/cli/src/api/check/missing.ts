import { getMissingTranslationFindings } from "../catalog/translations.js"
import { runBounded } from "../runBounded.js"
import { createMissingWorkerPool, MissingWorkerPool } from "../workerPools.js"
import { CheckContext, CheckDefinition, finalizeCheckResult } from "./types.js"
import { getMissingBehaviorDescription } from "../messages.js"
import type { MissingTranslationFinding } from "../catalog/translations.js"

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
      ctx.catalogs.map((catalog) => ({
        locale,
        catalog,
      })),
    )

    const resolvedConfigPath = ctx.config.resolvedConfigPath
    let workerPool: MissingWorkerPool | undefined

    if (ctx.workersOptions.poolSize > 0 && resolvedConfigPath) {
      workerPool = createMissingWorkerPool(ctx.workersOptions)
    }

    let findings: MissingTranslationFinding[]

    try {
      findings = (
        await runBounded(
          tasks,
          ctx.workersOptions.poolSize,
          async ({ locale, catalog }) =>
            workerPool
              ? workerPool.run(
                  catalog.path,
                  locale,
                  ctx.missingBehavior,
                  resolvedConfigPath!,
                )
              : getMissingTranslationFindings(
                  catalog,
                  locale,
                  ctx.missingBehavior,
                ),
        )
      ).flat()
    } finally {
      if (workerPool) {
        await workerPool.destroy()
      }
    }

    const missingBehaviorDescription = getMissingBehaviorDescription(
      ctx.missingBehavior,
    )

    return finalizeCheckResult(
      "missing",
      findings,
      `No missing translations found ${missingBehaviorDescription}.`,
      (count) =>
        `Found ${count} missing translation(s) ${missingBehaviorDescription}.`,
    )
  },
}
