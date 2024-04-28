import type { ExtractedMessage } from "@lingui/babel-plugin-extract-messages"
import { makeConfig } from "@lingui/conf"
import fs from "fs"
import path from "path"
import { vueExtractor } from "."

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

function getFixtureCode(filename: string) {
  const filePath = path.resolve(__dirname, "fixtures", filename)
  return fs.readFileSync(filePath, "utf-8")
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
    const code = getFixtureCode("test.vue")

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
    const code = getFixtureCode("functional.vue")

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

  it("should catch warnings during parsing", async () => {
    // ref: https://github.com/vuejs/core/blob/main/packages/compiler-sfc/__tests__/parse.spec.ts
    const code = getFixtureCode("test-parse.vue")

    let messages: ExtractedMessage[] = []

    expect(
      vueExtractor.extract(
        "test-parse.vue",
        code,
        (res) => messages.push(res),
        {
          linguiConfig,
        }
      )
    ).rejects.toMatchSnapshot()

    expect(messages).toHaveLength(0)
  })

  it("should catch template errors", async () => {
    // ref: https://github.com/vuejs/core/blob/main/packages/compiler-sfc/__tests__/compileTemplate.spec.ts
    const source = getFixtureCode("test-compile.vue")

    let messages: ExtractedMessage[] = []

    expect(
      vueExtractor.extract(
        "test-compile.vue",
        source,
        (res) => messages.push(res),
        {
          linguiConfig,
        }
      )
    ).rejects.toMatchSnapshot()

    expect(messages).toHaveLength(0)
  })
})
