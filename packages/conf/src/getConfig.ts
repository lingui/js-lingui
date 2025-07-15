import fs from "fs"
import { LinguiConfigNormalized } from "./types"
import { lilconfigSync, LoaderSync } from "lilconfig"
import yaml from "yaml"
import path from "path"
import { makeConfig } from "./makeConfig"
import type { JITIOptions } from "jiti/dist/types"
import pico from "picocolors"

function configExists(path: string) {
  return path && fs.existsSync(path)
}

function JitiLoader(): LoaderSync {
  return (filepath) => {
    const opts: JITIOptions = {
      interopDefault: true,
    }
    const jiti = require("jiti")(__filename, opts)
    return jiti(filepath)
  }
}

function YamlLoader(): LoaderSync {
  return (_, content) => {
    console.warn(
      "YAML config support is deprecated and will be removed in future versions."
    )
    return yaml.parse(content)
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
    `.${moduleName}rc.yaml`,
    `.${moduleName}rc.yml`,
    `.${moduleName}rc.ts`,
    `.${moduleName}rc.js`,
  ],
  loaders: {
    ".js": JitiLoader(),
    ".ts": JitiLoader(),
    ".mjs": JitiLoader(),
    ".yaml": YamlLoader(),
    ".yml": YamlLoader(),
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
    { skipValidation }
  )
}
