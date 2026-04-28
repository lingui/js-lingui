import { describe } from "vitest"
import { lingui, LinguiPluginOpts } from "../src"
import { runVite as _runVite } from "./run-vite"
import macrosPlugin from "vite-plugin-babel-macros"

describe("vite-plugin", () => {
  it("should return compiled catalog", async () => {
    const { mod } = await runVite(`po-format`)
    expect((await mod.load()).messages).toMatchSnapshot()
  })

  it("should return compiled catalog json", async () => {
    const { mod } = await runVite(`json-format`)

    expect((await mod.load()).messages).toMatchSnapshot()
  })

  it("should report error when macro used without a plugin", async () => {
    expect.assertions(1)
    try {
      await runVite(
        `no-macro-error`,
        {},
        { useVitePlugin: false, useMacroPlugin: false },
      )
    } catch (e) {
      expect((e as Error).message).toContain(
        'The macro you imported from "@lingui/core/macro" is being executed outside the context of compilation.',
      )
    }
  })
  it("should not report error when macro correctly used", async () => {
    const { mod } = await runVite(`macro-usage`, {}, { useMacroPlugin: true })
    expect(await mod.load()).toMatchSnapshot()
  })

  it("should report missing error when failOnMissing = true", async () => {
    expect.assertions(1)
    try {
      await runVite(`fail-on-missing`, {
        failOnMissing: true,
      })
    } catch (e) {
      expect((e as Error).message).toContain("Missing 1 translation(s):")
    }
  })

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
      expect((e as Error).message).toContain(
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
      expect((e as Error).message).toMatchInlineSnapshot(`
        "The macro you imported from "@lingui/core/macro" is being executed outside the context of compilation. 
        This indicates that you don't configured correctly one of the "babel-plugin-macros" / "@lingui/swc-plugin" / "babel-plugin-lingui-macro" 
        Additionally, dynamic imports — e.g., \`await import('@lingui/core/macro')\` — are not supported."
      `)
    }
  })
})

async function runVite(
  fixturesPath: string,
  pluginConfig: LinguiPluginOpts = {},
  {
    useMacroPlugin = false,
    useVitePlugin = true,
  }: { useMacroPlugin?: boolean; useVitePlugin?: boolean } = {},
) {
  return _runVite(fixturesPath, [
    useVitePlugin ? lingui(pluginConfig) : null,
    useMacroPlugin ? macrosPlugin() : null,
  ])
}
