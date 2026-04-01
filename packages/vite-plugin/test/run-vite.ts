import { build, createLogger, PluginOption } from "vite"
import path from "path"
import { mkdtempSync } from "fs"
import os from "os"

export async function runVite(
  fixturesPath: string,
  plugins: PluginOption[] = [],
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
      plugins,
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
