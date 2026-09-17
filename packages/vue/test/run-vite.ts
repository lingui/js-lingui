import { build, createLogger, type PluginOption, type AliasOptions } from "vite"
import path from "path"
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from "fs"

export type RunViteOptions = {
  alias?: AliasOptions
  /**
   * Build the entry as a server bundle (templates compiled to `ssrRender`)
   */
  ssr?: boolean
  /**
   * Vite mode, `development` keeps Vue runtime warnings in the bundle
   */
  mode?: string
}

export async function runVite(
  fixturesPath: string,
  plugins: PluginOption[] = [],
  { alias = {}, ssr = false, mode = "production" }: RunViteOptions = {},
) {
  const oldCwd = process.cwd()
  const cwd = path.join(import.meta.dirname, fixturesPath)
  process.chdir(cwd)

  // Vitest can only import modules inside the project, so build into a
  // git-ignored directory next to the tests instead of `os.tmpdir()`.
  const tmpRoot = path.join(import.meta.dirname, ".tmp")
  mkdirSync(tmpRoot, { recursive: true })
  const outDir = mkdtempSync(path.join(tmpRoot, `build-${process.pid}-`))

  const logger = createLogger()

  const infoMsgs: string[] = []
  const warnMsgs: string[] = []

  logger.info = (msg) => {
    infoMsgs.push(msg)
  }

  logger.warn = (msg) => {
    warnMsgs.push(msg)
  }

  logger.error = (msg) => {
    warnMsgs.push(msg)
  }

  const entry = path.resolve(cwd, "entrypoint.ts")

  try {
    await build({
      customLogger: logger,
      mode,
      resolve: { alias },
      build: {
        emptyOutDir: true,
        minify: false,
        outDir,
        ...(ssr
          ? {
              ssr: entry,
              rollupOptions: {
                output: { format: "es", entryFileNames: "bundle.js" },
              },
            }
          : {
              lib: {
                entry,
                fileName: "bundle",
                formats: ["es"],
              },
            }),
      },
      plugins,
    })
  } finally {
    process.chdir(oldCwd)
  }

  const bundle = path.resolve(outDir, "bundle.js")

  if (!existsSync(bundle)) {
    throw new Error(
      `Vite build did not produce ${bundle}.\nOutput: ${readdirSync(outDir).join(", ")}\nInfo: ${infoMsgs.join("\n")}\nWarnings: ${warnMsgs.join("\n")}`,
    )
  }

  try {
    return {
      warn: warnMsgs.join("\n"),
      info: infoMsgs.join("\n"),
      code: readFileSync(bundle, "utf8"),
      mod: await import(bundle),
    }
  } finally {
    rmSync(outDir, { recursive: true, force: true })
  }
}
