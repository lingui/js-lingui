import path from "path"
import { mkdtempSync } from "fs"
import os from "os"
import { platform } from "node:os"
import { describe } from "vitest"
import { build, createLogger } from "vite"

describe.skipIf(platform() === "win32")("vite-plugin", () => {
  it("should return compiled catalog", async () => {
    const { mod } = await runVite(`po-format/vite.config.ts`)
    expect((await mod.load()).messages).toMatchSnapshot()
  })

  it("should return compiled catalog json", async () => {
    const { mod } = await runVite(`json-format/vite.config.ts`)

    expect((await mod.load()).messages).toMatchSnapshot()
  })

  it("should report error when macro used without a plugin", async () => {
    expect.assertions(1)
    try {
      await runVite(`no-macro-error/vite.config.ts`)
    } catch (e) {
      expect(e.message).toContain(
        'The macro you imported from "@lingui/core/macro" is being executed outside the context of compilation.'
      )
    }
  })
  it("should not report error when macro correctly used", async () => {
    const { mod } = await runVite(`macro-usage/vite.config.ts`)
    expect(await mod.load()).toMatchSnapshot()
  })

  it("should report missing error when failOnMissing = true", async () => {
    expect.assertions(1)
    try {
      await runVite(`fail-on-missing/vite.config.ts`)
    } catch (e) {
      expect(e.message).toContain("Missing 1 translation(s):")
    }
  })

  it("should NOT report missing messages for pseudo locale when failOnMissing = true", async () => {
    await expect(
      runVite(`fail-on-missing-pseudo/vite.config.ts`)
    ).resolves.toBeTruthy()
  })

  it("Should fail build if there are message compilation errors when failOnCompileError = true", async () => {
    expect.assertions(1)
    try {
      await runVite(`fail-on-compile-errors/vite.config.ts`)
    } catch (e) {
      expect(e.message).toContain("Compilation error for 2 translation(s)")
    }
  })

  it("Should NOT fail build if there are message compilation errors when failOnCompileError = false", async () => {
    const res = await runVite(
      `fail-on-compile-errors/failOnCompileErrorFalse.vite.config.ts`
    )

    expect(res.warn).toContain("Compilation error for 2 translation(s)")
  })

  it("should report error when @lingui/macro is dynamically imported", async () => {
    expect.assertions(1)
    try {
      await runVite(`dynamic-macro-error/vite.config.ts`)
    } catch (e) {
      expect(e.message).toContain(
        'The macro you imported from "@lingui/core/macro" cannot be dynamically imported.'
      )
    }
  })
})

async function runVite(configPath: string) {
  const oldCwd = process.cwd()
  //
  process.chdir(path.join(import.meta.dirname, path.dirname(configPath)))

  const outDir = mkdtempSync(
    path.join(os.tmpdir(), `lingui-test-${process.pid}`)
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

  try {
    await build({
      configFile: path.resolve(import.meta.dirname, configPath),
      customLogger: logger,
      build: {
        emptyOutDir: true,
        outDir,
      },
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
