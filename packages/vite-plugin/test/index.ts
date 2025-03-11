import path from "path"
import { exec as _exec } from "child_process"
import { mkdtempSync } from "fs"
import os from "os"
import { platform } from "node:os"

const skipOnWindows = platform() === "win32" ? describe.skip : describe

describe("vite-plugin", () => {
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
      expect(e.stderr).toContain(
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
      expect(e.stderr).toContain("Missing 1 translation(s):")
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
      expect(e.stderr).toContain("Compilation error for 2 translation(s)")
    }
  })

  it("Should NOT fail build if there are message compilation errors when failOnCompileError = false", async () => {
    const res = await runVite(
      `fail-on-compile-errors/failOnCompileErrorFalse.vite.config.ts`
    )

    expect(res.stderr).toContain("Compilation error for 2 translation(s)")
  })
})

async function runVite(configPath: string) {
  // we could not use Vite directly using nodejs api because Vite is native ESM module
  // and Jest should be reconfigured completely to be able to require such modules
  const packageJsonPath = require.resolve("vite/package.json")
  const packageJson = require("vite/package.json")
  const viteExecutable = path.resolve(
    path.dirname(packageJsonPath),
    packageJson.bin.vite
  )

  const outDir = mkdtempSync(
    path.join(os.tmpdir(), `lingui-test-${process.pid}`)
  )
  const command =
    "node " +
    viteExecutable +
    ` build -c ` +
    path.resolve(__dirname, configPath) +
    ` --emptyOutDir --outDir ${outDir}`
  const res = await exec(
    command,
    path.dirname(path.resolve(__dirname, configPath))
  )

  return {
    mod: await import(path.resolve(outDir, "bundle.js")),
    stdout: res.stdout,
    stderr: res.stderr,
  }
}

function exec(cmd: string, cwd: string) {
  return new Promise<{ stdout: string; stderr: string; error?: unknown }>(
    (resolve, reject) => {
      _exec(
        cmd,
        {
          env: process.env,
          cwd,
        },
        (error, stdout, stderr) => {
          stdout = stdout.trim()
          stderr = stderr.trim()

          if (error === null) {
            resolve({ stdout, stderr })
          } else {
            reject({ error, stdout, stderr })
          }
        }
      )
    }
  )
}
