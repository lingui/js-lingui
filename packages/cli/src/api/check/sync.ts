import nodepath from "path"
import normalizePath from "normalize-path"
import { Catalog, cleanObsolete, order } from "../catalog.js"
import { runBounded } from "../runBounded.js"
import { createExtractWorkerPool, ExtractWorkerPool } from "../workerPools.js"
import { readFile } from "../utils.js"
import {
  CatalogOutOfSyncFinding,
  ExtractFailedFinding,
  CheckDefinition,
  CheckContext,
} from "./types.js"

async function getCatalogSyncFindings(
  catalog: Catalog,
  ctx: CheckContext,
  workerPool?: ExtractWorkerPool,
): Promise<Array<CatalogOutOfSyncFinding | ExtractFailedFinding>> {
  const nextCatalog = await catalog.collect({ workerPool })

  if (!nextCatalog) {
    return [
      {
        code: "extract_failed",
        message: `Failed to extract messages for catalog ${catalog.path}`,
        catalogPath: normalizePath(
          nodepath.relative(ctx.config.rootDir, catalog.path),
        ),
      },
    ]
  }

  const prevCatalogs = await catalog.readAll(ctx.locales)
  const mergedCatalogs = catalog.merge(prevCatalogs, nextCatalog, {
    overwrite: ctx.overwrite,
  })
  const findings = await runBounded(
    ctx.locales,
    ctx.workersOptions.poolSize,
    async (locale): Promise<CatalogOutOfSyncFinding | undefined> => {
      const filename = catalog.getFilename(locale)
      const catalogPath = normalizePath(
        nodepath.relative(ctx.config.rootDir, filename),
      )
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
          ? `Catalog ${catalogPath} is out of sync with extract output`
          : `Catalog ${catalogPath} is missing and would be created by extract`,
        locale,
        catalogPath,
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
        description: "Mirror extract --clean behavior when running sync check",
      },
      {
        name: "overwrite",
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
    const findings: Array<CatalogOutOfSyncFinding | ExtractFailedFinding> = []

    if (ctx.workersOptions.poolSize) {
      workerPool = createExtractWorkerPool(ctx.workersOptions)
    }

    try {
      for (const catalog of ctx.catalogs) {
        findings.push(
          ...(await getCatalogSyncFindings(catalog, ctx, workerPool)),
        )
      }
    } finally {
      if (workerPool) {
        await workerPool.destroy()
      }
    }

    return {
      name: "sync",
      passed: findings.length === 0,
      findings,
      summary:
        findings.length === 0
          ? "Catalogs are in sync with extract output."
          : `Found ${findings.length} out-of-sync catalog file(s).`,
    }
  },
}
