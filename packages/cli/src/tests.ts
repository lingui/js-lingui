import os from "os"
import fs from "fs-extra"
import path from "path"

import {
  Catalog,
  MakeOptions,
  MakeTemplateOptions,
  MergeOptions,
  ExtractedMessageType,
  MessageType,
} from "./api/catalog"
import { LinguiConfig, makeConfig } from "@lingui/conf"

export function copyFixture(fixtureDir: string) {
  const tmpDir = fs.mkdtempSync(
    path.join(os.tmpdir(), `lingui-test-${process.pid}`)
  )
  if (fs.existsSync(fixtureDir)) {
    fs.copySync(fixtureDir, tmpDir)
  }
  return tmpDir
}

export const defaultMakeOptions: MakeOptions = {
  verbose: false,
  clean: false,
  overwrite: false,
  locale: null,
  prevFormat: null,
  configPath: null,
  orderBy: "messageId",
}

export const defaultMakeTemplateOptions: MakeTemplateOptions = {
  verbose: false,
  configPath: null,
  orderBy: "messageId",
}

export const defaultMergeOptions: MergeOptions = {
  overwrite: false,
}

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
