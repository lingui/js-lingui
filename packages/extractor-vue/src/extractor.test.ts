import { makeConfig } from "@lingui/conf"
import fs from "fs"
import path from "path"
import { createVueExtractor } from "."
import type { ExtractedMessage } from "@lingui/babel-plugin-extract-messages"

function normalizePath(entries: ExtractedMessage[]): ExtractedMessage[] {
  return entries.map((entry) => {
    const [filename, lineNumber, column] = entry.origin!
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
  const vueExtractor = createVueExtractor()

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
      },
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
      },
    )

    messages = normalizePath(messages)

    expect(messages).toMatchSnapshot()
  })

  it("should report the position in the vue file for messages in <script setup>", async () => {
    const extract = async (
      fixture: string,
      code = fs.readFileSync(
        path.resolve(__dirname, "fixtures", fixture),
        "utf-8",
      ),
    ) => {
      const messages: ExtractedMessage[] = []
      await vueExtractor.extract(
        fixture,
        code,
        (res) => {
          messages.push(res)
        },
        {
          linguiConfig,
        },
      )

      return normalizePath(messages).map(({ id, origin }) => ({ id, origin }))
    }

    expect(await extract("script-setup-after-template.vue")).toEqual([
      {
        id: "Setup message",
        origin: ["script-setup-after-template.vue", 8, 24],
      },
      {
        id: "Template message",
        origin: ["script-setup-after-template.vue", 2, 8],
      },
    ])

    expect(await extract("js-script-setup.vue")).toEqual([
      {
        id: "JS setup message",
        origin: ["js-script-setup.vue", 8, 16],
      },
    ])

    expect(
      await extract(
        "one-line.vue",
        `<template><p>{{ msg }}</p></template>\n<script setup>const msg = i18n._("One line message")</script>`,
      ),
    ).toEqual([
      {
        id: "One line message",
        origin: ["one-line.vue", 2, 26],
      },
    ])
  })

  it("should extract message with compiled props transformations", async () => {
    const filePath = path.resolve(__dirname, "fixtures/props-destructuring.vue")
    const code = fs.readFileSync(filePath, "utf-8")

    let messages: ExtractedMessage[] = []
    const vueExtractor = createVueExtractor({ reactivityTransform: true })
    await vueExtractor.extract(
      "props-destructuring.vue",
      code,
      (res) => {
        messages.push(res)
      },
      {
        linguiConfig,
      },
    )

    messages = normalizePath(messages)

    expect(messages).toMatchSnapshot()
  })
})
