import fs from "fs"
import { LinguiConfigNormalized } from "./types"
import { cosmiconfigSync, LoaderSync } from "cosmiconfig"
import path from "path"
import { makeConfig } from "./makeConfig"

function configExists(path: string) {
  return path && fs.existsSync(path)
}

function TypeScriptLoader(): LoaderSync {
  let loaderInstance: LoaderSync
  return (filepath, content) => {
    if (!loaderInstance) {
      const { TypeScriptLoader } =
        require("cosmiconfig-typescript-loader") as typeof import("cosmiconfig-typescript-loader")
      loaderInstance = TypeScriptLoader()
    }

    return loaderInstance(filepath, content)
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
      "package.json",
      `.${moduleName}rc`,
      `.${moduleName}rc.json`,
      `.${moduleName}rc.yaml`,
      `.${moduleName}rc.yml`,
      `.${moduleName}rc.ts`,
      `.${moduleName}rc.js`,
      `${moduleName}.config.ts`,
      `${moduleName}.config.js`,
    ],
    loaders: {
      ".ts": TypeScriptLoader(),
    },
  })

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
