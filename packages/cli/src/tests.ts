import os from "os"
import path from "path"
import fs from "fs"

import {
  Catalog,
  MakeOptions,
  MakeTemplateOptions,
  MergeOptions,
} from "./api/catalog.js"
import { LinguiConfig, makeConfig } from "@lingui/conf"
import { ExtractedMessageType, getFormat, MessageType } from "./api/index.js"

export async function copyFixture(fixtureDir: string) {
  const tmpDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), `lingui-test-${process.pid}`)
  )

  try {
    await fs.promises.cp(fixtureDir, tmpDir, { recursive: true })
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code != "ENOENT") {
      throw err
    }
  }
  return tmpDir
}

export const defaultMakeOptions: MakeOptions = {
  clean: false,
  overwrite: false,
  locale: undefined,
  orderBy: "messageId",
}

export const defaultMakeTemplateOptions: MakeTemplateOptions = {
  orderBy: "messageId",
}

export const defaultMergeOptions: MergeOptions = {
  overwrite: false,
}

// on windows line endings are different,
// so direct comparison to snapshot would file if not normalized
export const normalizeLineEndings = (str: string) =>
  str.replace(/\r?\n/g, "\r\n")

export const makeCatalog = async (_config: Partial<LinguiConfig> = {}) => {
  const config = makeConfig(_config, { skipValidation: true })

  return new Catalog(
    {
      name: "messages",
      path: "{locale}/messages",
      include: [],
      exclude: [],
      format: await getFormat(
        config.format,
        config.formatOptions,
        config.sourceLocale
      ),
    },
    config
  )
}

export function makePrevMessage(message = {}): MessageType {
  return {
    translation: "",
    ...makeNextMessage(message),
  }
}

export function makeNextMessage(message = {}): ExtractedMessageType {
  return {
    origin: [["catalog.test.ts", 1]],
    placeholders: {},
    comments: [],
    ...message,
  }
}

type Listing = { [filename: string]: string }

export function listingToHumanReadable(listing: Listing): string {
  const output: string[] = []
  Object.entries(listing).forEach(([filename, value]) => {
    output.push("#######################")
    output.push(`Filename: ${filename}`)
    output.push("#######################")
    output.push("")
    output.push(normalizeLineEndings(value))
    output.push("")
  })

  return output.join("\n")
}

/**
 * Create fixtures from provided listing in temp folder
 * Alternative for mock-fs which is also mocking nodejs require calls
 *
 * returns a path to tmp directory with fixtures
 */
export async function createFixtures(listing: Listing) {
  const tmpDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), `test-${process.pid}`)
  )

  for (const [filename, value] of Object.entries(listing)) {
    await fs.promises.mkdir(path.join(tmpDir, path.dirname(filename)), {
      recursive: true,
    })
    await fs.promises.writeFile(path.join(tmpDir, filename), value)
  }
  return tmpDir
}

/**
 * Print FS to the listing, handy to use with snapshots
 */
export function readFsToListing(
  directory: string,
  filter?: (filename: string) => boolean
): Record<string, string> {
  const out: Record<string, string> = {}

  function readDirRecursive(currentDir: string, parentPath = ""): void {
    const entries = fs.readdirSync(currentDir)

    entries.forEach((entry) => {
      const filepath = path.join(currentDir, entry)
      const relativePath = parentPath ? `${parentPath}/${entry}` : entry

      if (fs.lstatSync(filepath).isDirectory()) {
        readDirRecursive(filepath, relativePath)
      } else if (!filter || filter(entry)) {
        out[relativePath] = fs.readFileSync(filepath, "utf-8")
      }
    })
  }

  readDirRecursive(directory)
  return out
}

export function compareFolders(pathA: string, pathB: string) {
  const listingA = listingToHumanReadable(readFsToListing(pathA))
  const listingB = listingToHumanReadable(readFsToListing(pathB))

  expect(listingA).toBe(listingB)
}
