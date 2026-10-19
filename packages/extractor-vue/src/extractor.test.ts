import { makeConfig } from "@lingui/conf"
import fs from "fs"
import path from "path"
import { createSwcExtractor } from "@lingui/native-tools"
import type { ExtractorType } from "@lingui/conf"
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

  it("should pass the compiled code to the configured extractor", async () => {
    const filePath = path.resolve(import.meta.dirname, "fixtures/test.vue")
    const code = fs.readFileSync(filePath, "utf-8")

    const calls: { filename: string; code: string; sourceMaps: unknown }[] = []
    const extractor: ExtractorType = {
      match: () => true,
      async extract(filename, code, onMessageExtracted, ctx) {
        calls.push({ filename, code, sourceMaps: ctx.sourceMaps })
        onMessageExtracted({ id: "custom", origin: [filename, 1, 0] })
      },
    }

    const messages: ExtractedMessage[] = []
    await createVueExtractor({ extractor }).extract(
      "test.vue",
      code,
      (res) => {
        messages.push(res)
      },
      {
        linguiConfig,
      },
    )

    // <script>, <script setup> and <template>
    expect(calls).toHaveLength(3)
    expect(calls.map((call) => call.filename)).toEqual([
      "test.vue.ts",
      "test.vue.ts",
      "test.vue.ts",
    ])
    expect(calls[0]!.code).toContain('i18n.t("Script message")')
    expect(calls[0]!.sourceMaps).toBeDefined()
    expect(calls[2]!.code).toContain("My descriptor message")
    expect(messages.map((message) => message.id)).toEqual([
      "custom",
      "custom",
      "custom",
    ])
  })

  it("should map positions back to the vue file with the SWC extractor", async () => {
    const filePath = path.resolve(import.meta.dirname, "fixtures/test.vue")
    const code = fs.readFileSync(filePath, "utf-8")

    const extract = async (vueExtractor: ExtractorType) => {
      const messages: ExtractedMessage[] = []
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

      return normalizePath(messages)
        .map(({ id, message, comment, origin }) => ({
          id,
          message,
          comment,
          // columns are counted differently by the Babel and SWC extractors
          origin: origin!.slice(0, 2),
        }))
        .sort((a, b) => a.id.localeCompare(b.id))
    }

    const swcMessages = await extract(
      createVueExtractor({ extractor: createSwcExtractor() }),
    )

    expect(swcMessages).toEqual(await extract(createVueExtractor()))
    expect(swcMessages).toContainEqual({
      id: "my.message",
      message: "My descriptor message",
      comment: "Message comment",
      origin: ["test.vue", 29],
    })
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
