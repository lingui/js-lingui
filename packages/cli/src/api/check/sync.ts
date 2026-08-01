import { Catalog, cleanObsolete, order } from "../catalog.js"
import { runBounded } from "../runBounded.js"
import { createExtractWorkerPool, ExtractWorkerPool } from "../workerPools.js"
import { readFile, toRootRelativePath } from "../utils.js"
import {
  CatalogOutOfSyncFinding,
  ExtractFailedFinding,
  CheckDefinition,
  CheckContext,
  finalizeCheckResult,
} from "./types.js"

async function getCatalogSyncFindings(
  catalog: Catalog,
  ctx: CheckContext,
  workerPool?: ExtractWorkerPool,
): Promise<Array<CatalogOutOfSyncFinding | ExtractFailedFinding>> {
  const [nextCatalog, prevCatalogs] = await Promise.all([
    catalog.collect({ workerPool }),
    catalog.readAll(ctx.locales),
  ])

  if (!nextCatalog) {
    return [
      {
        code: "extract_failed",
        message: `Failed to extract messages for catalog ${catalog.path}`,
        catalogPath: toRootRelativePath(ctx.config.rootDir, catalog.path),
        severity: "error",
      },
    ]
  }

  const mergedCatalogs = catalog.merge(prevCatalogs, nextCatalog, {
    overwrite: ctx.overwrite,
  })
  const findings = await runBounded(
    ctx.locales,
    ctx.workersOptions.poolSize,
    async (locale): Promise<CatalogOutOfSyncFinding | undefined> => {
      const filename = catalog.getFilename(locale)
      const catalogPath = toRootRelativePath(ctx.config.rootDir, filename)
      let nextLocaleCatalog = mergedCatalogs[locale]!

      if (ctx.clean) {
        nextLocaleCatalog = cleanObsolete(nextLocaleCatalog)
      }

      const existing = await readFile(filename)
      const expected = await catalog.format.serialize(
        filename,
        order(ctx.config.orderBy, nextLocaleCatalog),
        locale,
        existing,
      )

      if (existing === expected) {
        return undefined
      }

      return {
        code: "catalog_out_of_sync",
        message: existing
          ? "Catalog is out of sync with extract output"
          : "Catalog is missing and would be created by extract",
        locale,
        catalogPath,
        severity: "error",
      }
    },
  )

  return findings.filter(
    (finding): finding is CatalogOutOfSyncFinding => finding !== undefined,
  )
}

export const syncCheck: CheckDefinition = {
  name: "sync",
  description:
    "Verify that locale catalogs are already synchronized with what lingui extract would write.",
  cli: {
    options: [
      {
        name: "clean",
        runOption: "clean",
        description: "Mirror extract --clean behavior when running sync check",
      },
      {
        name: "overwrite",
        runOption: "overwrite",
        description:
          "Mirror extract --overwrite behavior when running sync check",
      },
    ],
    examples: [
      {
        description: "Check that catalogs are in sync with extract output",
        command: "check sync",
      },
    ],
  },
  async run(ctx: CheckContext) {
    let workerPool: ExtractWorkerPool | undefined

    if (ctx.workersOptions.poolSize) {
      workerPool = createExtractWorkerPool(ctx.workersOptions)
    }

    let findings: Array<CatalogOutOfSyncFinding | ExtractFailedFinding>

    try {
      findings = (
        await runBounded(ctx.catalogs, ctx.workersOptions.poolSize, (catalog) =>
          getCatalogSyncFindings(catalog, ctx, workerPool),
        )
      ).flat()
    } finally {
      if (workerPool) {
        await workerPool.destroy()
      }
    }

    return finalizeCheckResult(
      "sync",
      findings,
      "Catalogs are in sync with extract output.",
      (count) => `Found ${count} out-of-sync catalog file(s).`,
    )
  },
}
