import os from "os"
import fsExtra from "fs-extra"
import path from "path"
import fs from "fs"

import {
  Catalog,
  MakeOptions,
  MakeTemplateOptions,
  MergeOptions,
} from "./api/catalog"
import { LinguiConfig, makeConfig } from "@lingui/conf"
import { ExtractedMessageType, MessageType } from "./api"

export function copyFixture(fixtureDir: string) {
  const tmpDir = fsExtra.mkdtempSync(
    path.join(os.tmpdir(), `lingui-test-${process.pid}`)
  )
  if (fsExtra.existsSync(fixtureDir)) {
    fsExtra.copySync(fixtureDir, tmpDir)
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

export const makeCatalog = (config: Partial<LinguiConfig> = {}) => {
  return new Catalog(
    {
      name: "messages",
      path: "{locale}/messages",
      include: [],
      exclude: [],
    },
    makeConfig(config, { skipValidation: true })
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
