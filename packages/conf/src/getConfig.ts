import fs from "fs"
import { LinguiConfigNormalized } from "./types"
import { cosmiconfigSync, LoaderSync } from "cosmiconfig"
import path from "path"
import { makeConfig } from "./makeConfig"
import { createJiti } from "jiti"
import pico from "picocolors"

function configExists(path: string) {
  return path && fs.existsSync(path)
}

function JitiLoader(): LoaderSync {
  return (filepath) => {
    const jiti = createJiti(__filename)

    const mod = jiti(filepath)
    return mod?.default ?? mod
  }
}

const moduleName = "lingui"

const configExplorer = cosmiconfigSync(moduleName, {
  searchPlaces: [
    `${moduleName}.config.js`,
    `${moduleName}.config.cjs`,
    `${moduleName}.config.ts`,
    `${moduleName}.config.mjs`,
    "package.json",
    `.${moduleName}rc`,
    `.${moduleName}rc.json`,
    `.${moduleName}rc.yaml`,
    `.${moduleName}rc.yml`,
    `.${moduleName}rc.ts`,
    `.${moduleName}rc.js`,
  ],
  loaders: {
    ".js": JitiLoader(),
    ".ts": JitiLoader(),
    ".mjs": JitiLoader(),
  },
})

export function getConfig({
  cwd,
  configPath,
  skipValidation = false,
}: {
  cwd?: string
  configPath?: string
  skipValidation?: boolean
} = {}): LinguiConfigNormalized {
  const defaultRootDir = cwd || process.cwd()

  configPath = configPath || process.env.LINGUI_CONFIG

  const result = configExists(configPath)
    ? configExplorer.load(configPath)
    : configExplorer.search(defaultRootDir)

  if (!result) {
    console.error("Lingui was unable to find a config!\n")
    console.error(
      `Create ${pico.bold(
        "'lingui.config.js'"
      )} file with LinguiJS configuration in root of your project (next to package.json). See ${pico.underline(
        "https://lingui.dev/ref/conf"
      )}`
    )

    // gracefully stop further executing
    throw new Error("No Lingui config found")
  }

  const userConfig = result ? result.config : {}

  return makeConfig(
    {
      rootDir: result ? path.dirname(result.filepath) : defaultRootDir,
      ...userConfig,
    },
    { skipValidation, resolvedConfigPath: result.filepath }
  )
}
