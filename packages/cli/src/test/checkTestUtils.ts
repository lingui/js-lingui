import fs from "fs"
import { LinguiConfig, makeConfig } from "@lingui/conf"
import { mockConsole } from "@lingui/test-utils"
import extractCommand from "../lingui-extract.js"

export function getTestConfig(
  rootDir: string,
  config: Partial<LinguiConfig> = {},
) {
  return makeConfig({
    locales: ["en", "pl"],
    sourceLocale: "en",
    rootDir,
    catalogs: [
      {
        path: "<rootDir>/locales/{locale}/messages",
        include: ["<rootDir>/src"],
        exclude: [],
      },
    ],
    ...config,
  })
}

export const workersOptions = {
  poolSize: 0,
}

export async function extractCatalogs(
  config: ReturnType<typeof getTestConfig>,
  options: { overwrite?: boolean; clean?: boolean } = {},
) {
  await mockConsole(async () => {
    await extractCommand(config, {
      verbose: false,
      clean: options.clean || false,
      overwrite: options.overwrite || false,
      workersOptions,
    })
  })
}

export async function replaceInFile(
  filename: string,
  searchValue: string,
  replaceValue: string,
) {
  const content = await fs.promises.readFile(filename, "utf-8")
  if (!content.includes(searchValue)) {
    throw new Error(`Expected to find "${searchValue}" in ${filename}`)
  }
  await fs.promises.writeFile(
    filename,
    content.replace(searchValue, replaceValue),
    "utf-8",
  )
}
