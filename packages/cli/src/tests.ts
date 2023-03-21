import os from "os"
import path from "path"
import fs from "fs"

import {
  Catalog,
  MakeOptions,
  MakeTemplateOptions,
  MergeOptions,
} from "./api/catalog"
import { LinguiConfig, makeConfig } from "@lingui/conf"
import { ExtractedMessageType, getFormat, MessageType } from "./api"

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
  verbose: false,
  clean: false,
  overwrite: false,
  locale: null,
  prevFormat: null,
  orderBy: "messageId",
}

export const defaultMakeTemplateOptions: MakeTemplateOptions = {
  verbose: false,
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
    obsolete: false,
    ...message,
  }
}

type Listing = { [filename: string]: string | Listing }

export function listingToHumanReadable(listing: Listing): string {
  const output: string[] = []
  Object.entries(listing).forEach(([filename, value]) => {
    if (typeof value === "string") {
      output.push("#######################")
      output.push(`Filename: ${filename}`)
      output.push("#######################")
      output.push("")
      output.push(normalizeLineEndings(value))
      output.push("")
    } else {
      output.push(...listingToHumanReadable(value))
    }
  })

  return output.join("\n")
}

/**
 * Create fixtures from provided listing in temp folder
 * Alternative for mock-fs which is also mocking nodejs require calls
 * @param listing
 */
export async function createFixtures(listing: Listing) {
  const tmpDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), `lingui-test-${process.pid}`)
  )

  async function create(listing: Listing) {
    for (const [filename, value] of Object.entries(listing)) {
      if (typeof value === "string") {
        await fs.promises.writeFile(path.join(tmpDir, filename), value)
      } else {
        await create(value)
      }
    }
  }

  await create(listing)
  return tmpDir
}

export function readFsToJson(
  directory: string,
  filter?: (filename: string) => boolean
): Listing {
  const out: Listing = {}

  fs.readdirSync(directory).map((filename) => {
    const filepath = path.join(directory, filename)

    if (fs.lstatSync(filepath).isDirectory()) {
      out[filename] = readFsToJson(filepath)
      return out
    }

    if (!filter || filter(filename)) {
      out[filename] = fs.readFileSync(filepath).toString()
    }
  })

  return out
}
