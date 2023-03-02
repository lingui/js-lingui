import fs from "fs"
import { LinguiConfigNormalized } from "./types"
import { cosmiconfigSync, LoaderSync } from "cosmiconfig"
import path from "path"
import { makeConfig } from "./makeConfig"
import type { JITIOptions } from "jiti/dist/types"

function configExists(path: string) {
  return path && fs.existsSync(path)
}

function JitiLoader(): LoaderSync {
  return (filepath, content) => {
    const opts: JITIOptions = {
      interopDefault: true,
    }
    const jiti = require("jiti")(__filename, opts)
    return jiti(filepath)
  }
}

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
  const moduleName = "lingui"

  const configExplorer = cosmiconfigSync(moduleName, {
    searchPlaces: [
      `${moduleName}.config.js`,
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
      ".ts": JitiLoader(),
      ".mjs": JitiLoader(),
    },
  })

  configPath = configPath || process.env.LINGUI_CONFIG

  const result = configExists(configPath)
    ? configExplorer.load(configPath)
    : configExplorer.search(defaultRootDir)
  const userConfig = result ? result.config : {}

  return makeConfig(
    {
      rootDir: result ? path.dirname(result.filepath) : defaultRootDir,
      ...userConfig,
    },
    { skipValidation }
  )
}
