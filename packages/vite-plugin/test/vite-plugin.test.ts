import { describe, vi } from "vitest"
import { getCatalogs } from "@lingui/cli/api"
import { lingui, LinguiPluginOpts } from "../src"
import { runVite as _runVite } from "./run-vite"
import macrosPlugin from "vite-plugin-babel-macros"
import path from "path"
import { mockConsole } from "@lingui/test-utils"

vi.mock(import("@lingui/cli/api"), async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, getCatalogs: vi.fn(actual.getCatalogs) }
})

const getCatalogsMock = vi.mocked(getCatalogs)

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

describe("vite-plugin", () => {
  it("should return compiled catalog", async () => {
    const { mod } = await runVite(`po-format`)
    expect((await mod.load()).messages).toMatchSnapshot()
  })

  it("should return compiled catalog json", async () => {
    const { mod } = await runVite(`json-format`)

    expect((await mod.load()).messages).toMatchSnapshot()
  }, 10000)

  it("should report error when macro used without a plugin", async () => {
    expect.assertions(1)
    try {
      await runVite(
        `no-macro-error`,
        {},
        { useVitePlugin: false, useMacroPlugin: false },
      )
    } catch (e) {
      expect(getErrorMessage(e)).toContain(
        'The macro you imported from "@lingui/core/macro" is being executed outside the context of compilation.',
      )
    }
  })
  it("should not report error when macro correctly used", async () => {
    const { mod } = await runVite(`macro-usage`, {}, { useMacroPlugin: true })
    expect(await mod.load()).toMatchSnapshot()
  })

  it("should correctly process with native transformer", async () => {
    const { mod } = await runVite(`macro-usage`, { macroTransform: true })
    expect(await mod.load()).toMatchSnapshot()
  })

  it("should process a TSX module whose id carries a query with native transformer", async () => {
    const { mod } = await runVite(`query-id`, { macroTransform: true })
    expect(await mod.load()).toBe("Ola")
  })

  it("should process with native transformer when macro.jsxRuntime = solid", async () => {
    const { mod } = await runVite(`solid-runtime`, { macroTransform: true })
    expect(await mod.load()).toBe("Ola")
  })

  it("should correctly process with native transformer - PRODUCTION", async () => {
    const oldEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "production"
    const { mod } = await runVite(`macro-usage`, { macroTransform: true })
    process.env.NODE_ENV = oldEnv

    expect.assertions(2)
    await mockConsole(async (console) => {
      expect(await mod.load()).toMatchSnapshot()
      expect(console.warn).toHaveBeenCalled()
    })
  })

  it("should report missing error when failOnMissing = true", async () => {
    expect.assertions(1)
    try {
      await runVite(`fail-on-missing`, {
        failOnMissing: true,
      })
    } catch (e) {
      expect(getErrorMessage(e)).toContain(
        "Missing 1 translation(s) after applying fallbackLocales:",
      )
    }
  })

  it("should not report missing error when fallbackLocales resolve translation and failOnMissing = true", async () => {
    await expect(
      runVite(`fail-on-missing-fallback`, {
        failOnMissing: true,
      }),
    ).resolves.toBeTruthy()
  }, 10000)

  it('should not report missing error when fallbackLocales resolve translation and failOnMissing = "resolved"', async () => {
    await expect(
      runVite(`fail-on-missing-fallback`, {
        failOnMissing: "resolved",
      }),
    ).resolves.toBeTruthy()
  }, 10000)

  it('should report missing error when fallbackLocales resolve translation and failOnMissing = "catalog"', async () => {
    expect.assertions(2)
    try {
      await runVite(`fail-on-missing-fallback`, {
        failOnMissing: "catalog",
      })
    } catch (e) {
      expect(getErrorMessage(e)).toContain(
        "Missing 1 translation(s) before applying fallbackLocales:",
      )
      expect(getErrorMessage(e)).toContain('failOnMissing="catalog"')
    }
  }, 10000)

  it("should NOT report missing messages for pseudo locale when failOnMissing = true", async () => {
    await expect(
      runVite(`fail-on-missing-pseudo`, {
        failOnMissing: true,
      }),
    ).resolves.toBeTruthy()
  })

  it("Should fail build if there are message compilation errors when failOnCompileError = true", async () => {
    expect.assertions(1)
    try {
      await runVite(`fail-on-compile-errors`, {
        failOnCompileError: true,
      })
    } catch (e) {
      expect(getErrorMessage(e)).toContain(
        "Compilation error for 2 translation(s)",
      )
    }
  })

  it("Should NOT fail build if there are message compilation errors when failOnCompileError = false", async () => {
    const res = await runVite(`fail-on-compile-errors`, {
      failOnCompileError: false,
    })

    expect(res.warn).toContain("Compilation error for 2 translation(s)")
  })

  it("should report error when @lingui/core/macro is dynamically imported", async () => {
    expect.assertions(1)
    try {
      const { mod } = await runVite(
        `dynamic-macro-error`,
        {},
        { useMacroPlugin: true },
      )
      await mod.load()
    } catch (e) {
      expect(getErrorMessage(e)).toMatchInlineSnapshot(`
        "The macro you imported from "@lingui/core/macro" is being executed outside the context of compilation. 
        This indicates that you don't configured correctly one of the "babel-plugin-macros" / "@lingui/swc-plugin" / "babel-plugin-lingui-macro" 
        Additionally, dynamic imports — e.g., \`await import('@lingui/core/macro')\` — are not supported."
      `)
    }
  })

  describe("catalogs resolution", () => {
    beforeEach(() => {
      getCatalogsMock.mockClear()
    })

    it("should resolve catalogs once per build regardless of the number of imported catalogs", async () => {
      const { mod } = await runVite(`multiple-catalogs`)

      expect(getCatalogsMock).toHaveBeenCalledTimes(1)
      expect(await mod.load()).toMatchSnapshot()
    })

    it("should reuse resolved catalogs between catalog modules", async () => {
      const hooks = setupLoadCatalogHooks(`po-format`)

      await hooks.transform("locale/en.po")
      await hooks.transform("locale/en.po?lingui")

      expect(getCatalogsMock).toHaveBeenCalledTimes(1)
    })

    it("should resolve catalogs again after watchChange and buildStart", async () => {
      const hooks = setupLoadCatalogHooks(`po-format`)

      await hooks.transform("locale/en.po")
      await hooks.watchChange("locale/new.po")
      await hooks.transform("locale/en.po")

      expect(getCatalogsMock).toHaveBeenCalledTimes(2)

      await hooks.buildStart()
      await hooks.transform("locale/en.po")

      expect(getCatalogsMock).toHaveBeenCalledTimes(3)
    })

    it("should not cache a failed catalogs resolution", async () => {
      const hooks = setupLoadCatalogHooks(`po-format`)
      getCatalogsMock.mockRejectedValueOnce(new Error("Invalid catalog path"))

      await expect(hooks.transform("locale/en.po")).rejects.toThrow(
        "Invalid catalog path",
      )
      await expect(hooks.transform("locale/en.po")).resolves.toMatchObject({
        code: expect.stringContaining("messages"),
      })

      expect(getCatalogsMock).toHaveBeenCalledTimes(2)
    })

    it("should resolve catalogs again when a module doesn't match the cached catalogs", async () => {
      const hooks = setupLoadCatalogHooks(`po-format`)
      // e.g. a catalog created after the list was cached
      getCatalogsMock.mockResolvedValueOnce([])

      await expect(hooks.transform("locale/en.po")).resolves.toMatchObject({
        code: expect.stringContaining("messages"),
      })

      expect(getCatalogsMock).toHaveBeenCalledTimes(2)
    })

    it("should report error when a module doesn't match any catalog", async () => {
      const hooks = setupLoadCatalogHooks(`po-format`)

      await expect(hooks.transform("other/en.po")).rejects.toThrow(
        "is not matched to any of your catalogs paths",
      )
    })
  })
})

/**
 * Call hooks of the catalog loader plugin directly, without a Vite build
 */
function setupLoadCatalogHooks(fixturesPath: string) {
  const cwd = path.join(import.meta.dirname, fixturesPath)
  const plugins = lingui({ cwd })
  const getPlugin = (name: string) => plugins.find((p) => p.name === name)!

  const context = { addWatchFile: vi.fn(), warn: vi.fn() }
  const callHook = (hook: unknown, ...args: unknown[]) => {
    const handler = typeof hook === "function" ? hook : (hook as any).handler
    return handler.call(context, ...args)
  }

  callHook(getPlugin("vite-plugin-lingui-get-config").configResolved)
  const loadCatalog = getPlugin("vite-plugin-lingui-load-catalog")

  return {
    transform: async (file: string) =>
      callHook(loadCatalog.transform, "", path.join(cwd, file)),
    watchChange: async (file: string) =>
      callHook(loadCatalog.watchChange, path.join(cwd, file), {
        event: "create",
      }),
    buildStart: async () => callHook(loadCatalog.buildStart),
  }
}

async function runVite(
  fixturesPath: string,
  pluginConfig: LinguiPluginOpts = {},
  {
    useMacroPlugin = false,
    useVitePlugin = true,
  }: { useMacroPlugin?: boolean; useVitePlugin?: boolean } = {},
) {
  const cwd = path.join(import.meta.dirname, fixturesPath)

  return _runVite(fixturesPath, [
    useVitePlugin ? lingui({ ...pluginConfig, cwd }) : null,
    useMacroPlugin ? macrosPlugin() : null,
  ])
}
