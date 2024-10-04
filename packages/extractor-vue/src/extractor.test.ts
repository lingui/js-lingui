import { describe, expect, it } from "vitest";
import { makeConfig } from "@lingui/conf"
import fs from "fs"
import path from "path"
import { vueExtractor } from "."
import type { ExtractedMessage } from "@lingui/babel-plugin-extract-messages"

function normalizePath(entries: ExtractedMessage[]): ExtractedMessage[] {
  return entries.map((entry) => {
    const [filename, lineNumber, column] = entry.origin
    const projectRoot = process.cwd()

    return {
      ...entry,
      origin: [path.relative(projectRoot, filename ?? ""), lineNumber, column],
    }
  })
}

describe("vue extractor", () => {
  const linguiConfig = makeConfig({
    locales: ["en", "nb"],
    sourceLocale: "en",
    rootDir: ".",
    catalogs: [
      {
        path: "<rootDir>/{locale}",
        include: ["<rootDir>"],
        exclude: [],
      },
    ],
    extractorParserOptions: {
      tsExperimentalDecorators: false,
      flow: false,
    },
  })

  it("should ignore non vue files in extractor", async () => {
    const match = vueExtractor.match("test.js")

    expect(match).toBeFalsy()
  })

  it("should extract message from vue file", async () => {
    const filePath = path.resolve(__dirname, "fixtures/test.vue")
    const code = fs.readFileSync(filePath, "utf-8")

    let messages: ExtractedMessage[] = []

    await vueExtractor.extract(
      "test.vue",
      code,
      (res) => {
        messages.push(res)
      },
      {
        linguiConfig,
      }
    )

    messages = normalizePath(messages)

    expect(messages).toMatchSnapshot()
  })

  it("should extract message from functional component", async () => {
    const filePath = path.resolve(__dirname, "fixtures/functional.vue")
    const code = fs.readFileSync(filePath, "utf-8")

    let messages: ExtractedMessage[] = []

    await vueExtractor.extract(
      "functional.vue",
      code,
      (res) => {
        messages.push(res)
      },
      {
        linguiConfig,
      }
    )

    messages = normalizePath(messages)

    expect(messages).toMatchSnapshot()
  })
})
