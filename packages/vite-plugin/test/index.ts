import path from "path"
import { exec as _exec } from "child_process"
import { mkdtempSync } from "fs"
import os from "os"

const skipOnWindows = os.platform() === "win32" ? it.skip : it

describe("vite-plugin", () => {
  skipOnWindows("should return compiled catalog", async () => {
    const mod = await runVite(`po-format/vite.config.ts`)
    expect((await mod.load()).messages).toMatchSnapshot()
  })

  skipOnWindows("should return compiled catalog json", async () => {
    const mod = await runVite(`json-format/vite.config.ts`)

    expect((await mod.load()).messages).toMatchSnapshot()
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
    viteExecutable +
    ` build -c ` +
    path.resolve(__dirname, configPath) +
    ` --emptyOutDir --outDir ${outDir}`
  await exec(command)

  return await import(path.resolve(outDir, "bundle.js"))
}

function exec(cmd: string) {
  const _options = {
    env: process.env,
  }
  return new Promise((resolve, reject) => {
    _exec(cmd, _options, (error, stdout, stderr) => {
      stdout = stdout.trim()
      stderr = stderr.trim()

      if (error === null) {
        resolve({ stdout, stderr })
      } else {
        reject({ error, stdout, stderr })
        console.error(stdout)
        console.error(stderr)
      }
    })
  })
}
