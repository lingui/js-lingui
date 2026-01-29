import path from "path"
import { mkdtempSync } from "fs"
import os from "os"
import { platform } from "node:os"
import { describe } from "vitest"
import { build, createLogger } from "vite"
import lingui, { LinguiPluginOpts } from "../src"
import macrosPlugin from "vite-plugin-babel-macros"

describe.skipIf(platform() === "win32")("vite-plugin", () => {
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
      await runVite(`no-macro-error`)
    } catch (e) {
      expect((e as Error).message).toContain(
        'The macro you imported from "@lingui/core/macro" is being executed outside the context of compilation.',
      )
    }
  })
  it("should not report error when macro correctly used", async () => {
    const { mod } = await runVite(`macro-usage`, {}, true)
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
      await runVite(`dynamic-macro-error`, {}, true)
    } catch (e) {
      expect((e as Error).message).toContain(
        'The macro you imported from "@lingui/core/macro" cannot be dynamically imported.',
      )
    }
  })
})

async function runVite(
  fixturesPath: string,
  pluginConfig: LinguiPluginOpts = {},
  useMacroPlugin = false,
) {
  const oldCwd = process.cwd()
  const cwd = path.join(import.meta.dirname, fixturesPath)
  process.chdir(cwd)

  const outDir = mkdtempSync(
    path.join(os.tmpdir(), `lingui-test-${process.pid}`),
  )

  const logger = createLogger()

  const infoMsgs: string[] = []
  const warnMsgs: string[] = []

  logger.info = (msg, options) => {
    infoMsgs.push(msg)
  }

  logger.warn = (msg, options) => {
    warnMsgs.push(msg)
  }

  logger.error = (msg, options) => {
    warnMsgs.push(msg)
  }

  try {
    await build({
      customLogger: logger,
      build: {
        emptyOutDir: true,
        lib: {
          entry: path.resolve(
            import.meta.dirname,
            fixturesPath,
            "entrypoint.js",
          ),
          fileName: "bundle",
          formats: ["es"],
        },
        outDir,
      },
      plugins: [
        lingui({
          cwd,
          ...pluginConfig,
        }),

        useMacroPlugin ? macrosPlugin() : [],
      ],
    })
  } finally {
    process.chdir(oldCwd)
  }

  return {
    warn: warnMsgs.join("\n"),
    info: infoMsgs.join("\n"),
    mod: await import(path.resolve(outDir, "bundle.js")),
  }
}
