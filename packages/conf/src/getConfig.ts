import fs from "fs"
import { LinguiConfigNormalized } from "./types"
import { lilconfigSync, LoaderSync } from "lilconfig"
import path from "path"
import { makeConfig } from "./makeConfig"
import { createJiti } from "jiti"
import { styleText } from "node:util"
import normalizePath from "normalize-path"

function configExists(path?: string): path is string {
  return !!path && fs.existsSync(path)
}

function JitiLoader(): LoaderSync {
  return (filepath) => {
    const jiti = createJiti(import.meta.url)

    const mod = jiti(filepath)
    return mod?.default ?? mod
  }
}

const moduleName = "lingui"

const configExplorer = lilconfigSync(moduleName, {
  searchPlaces: [
    `${moduleName}.config.js`,
    `${moduleName}.config.cjs`,
    `${moduleName}.config.ts`,
    `${moduleName}.config.mjs`,
    "package.json",
    `.${moduleName}rc`,
    `.${moduleName}rc.json`,
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

  let result

  try {
    result = configExists(configPath)
      ? configExplorer.load(configPath)
      : configExplorer.search(defaultRootDir)
  } catch (error) {
    // If lilconfig throws an error (e.g., directory doesn't exist), treat it as no config found
    result = null
  }

  if (!result) {
    console.error("Lingui was unable to find a config!\n")
    console.error(
      `Create ${styleText(
        "bold",
        "'lingui.config.js'",
      )} file with LinguiJS configuration in root of your project (next to package.json). See ${styleText(
        "underline",
        "https://lingui.dev/ref/conf",
      )}`,
    )

    // gracefully stop further executing
    throw new Error("No Lingui config found")
  }

  return makeConfig(
    {
      rootDir: result
        ? normalizePath(path.dirname(result.filepath))
        : defaultRootDir,
      ...result.config,
    },
    { skipValidation, resolvedConfigPath: result.filepath },
  )
}
