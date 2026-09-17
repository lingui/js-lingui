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

  it("should extract messages from template macros", async () => {
    const filePath = path.resolve(__dirname, "fixtures/trans.vue")
    const code = fs.readFileSync(filePath, "utf-8")

    let messages: ExtractedMessage[] = []

    await vueExtractor.extract(
      "trans.vue",
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

  it("should not compile template macros when disabled", async () => {
    const filePath = path.resolve(__dirname, "fixtures/trans.vue")
    const code = fs.readFileSync(filePath, "utf-8")

    const messages: ExtractedMessage[] = []

    await createVueExtractor({ template: false }).extract(
      "trans.vue",
      code,
      (res) => {
        messages.push(res)
      },
      {
        linguiConfig,
      },
    )

    expect(messages).toEqual([])
  })

  it("should fail when the template transform reports errors", async () => {
    const code = `
<script setup lang="ts">
import { Trans } from "@lingui/vue"
const dynamicId = "id"
</script>

<template>
  <Trans :id="dynamicId">Hello</Trans>
</template>
`

    await expect(
      vueExtractor.extract("errors.vue", code, () => {}, { linguiConfig }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Cannot compile <template> block:
        errors.vue:8:10 [lingui] The \`id\` attribute of <Trans> must be a static string]
    `)

    // A `t` of another library, or a user-defined one, matched by name
    const unrelated = `
<script setup>
const t = (d) => d.message
const k = "x"
</script>

<template>
  <p>{{ t({ message: k }) }}</p>
</template>
`

    await expect(
      vueExtractor.extract("unrelated.vue", unrelated, () => {}, {
        linguiConfig,
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [Error: Cannot compile <template> block:
        unrelated.vue:8:9 [lingui] Unsupported macro usage: The \`message\` of a descriptor must be a string literal, a template literal or a macro call]
    `)
  })

  it("should still extract <script> messages when the template does not compile", async () => {
    const code = `
<script setup lang="ts">
import { t } from "@lingui/core/macro"
const s = t\`ScriptMsg\`
</script>

<template>
  <p v-else>{{ s }}</p>
</template>
`

    const messages: ExtractedMessage[] = []

    await expect(
      vueExtractor.extract(
        "broken-template.vue",
        code,
        (res) => {
          messages.push(res)
        },
        { linguiConfig },
      ),
    ).rejects.toThrow(/Cannot compile <template> block/)

    expect(messages.map((m) => m.message)).toEqual(["ScriptMsg"])
  })

  it("should compile templates with the configured compiler options", async () => {
    const extract = async (
      code: string,
      config: Parameters<typeof createVueExtractor>[0],
    ) => {
      const messages: ExtractedMessage[] = []
      await createVueExtractor(config).extract(
        "options.vue",
        code,
        (res) => {
          messages.push(res)
        },
        { linguiConfig },
      )
      return messages.map(({ id, message }) => ({ id, message }))
    }

    // The message text, hence its ID, depends on how the template is parsed:
    // the app's `compilerOptions` must be mirrored for the IDs to match.
    const multiline = `
<template>
  <Trans>
    Hello
    <b>{{ name }}</b>
  </Trans>
</template>
`
    expect(await extract(multiline, {})).toEqual([
      { id: "aM7C4c", message: "Hello <0>{name}</0>" },
    ])
    expect(
      await extract(multiline, {
        compilerOptions: { whitespace: "preserve" },
      }),
    ).toEqual([{ id: "6ispsu", message: "Hello\n    <0>{name}</0>" }])

    const delimiters = `
<template>
  <Trans>Hello \${ name }</Trans>
  <p>\${ i18n._("Bye") }</p>
</template>
`
    expect(
      await extract(delimiters, {
        compilerOptions: { delimiters: ["${", "}"] },
      }),
    ).toEqual([
      { id: "OVaF9k", message: "Hello {name}" },
      { id: "Bye", message: undefined },
    ])
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

  describe("with the vue jsxRuntime", () => {
    const vueLinguiConfig = makeConfig(
      {
        ...linguiConfig,
        macro: {
          ...linguiConfig.macro,
          jsxPackage: ["@lingui/vue/macro"],
          jsxRuntime: "vue",
        },
        runtimeConfigModule: {
          Trans: ["@lingui/vue", "Trans"],
          useLingui: ["@lingui/vue", "useLingui"],
        },
      },
      { skipValidation: true },
    )

    const extractMessages = async (extractor = createVueExtractor()) => {
      const filePath = path.resolve(
        __dirname,
        "fixtures/props-destructuring-vue-runtime.vue",
      )
      const code = fs.readFileSync(filePath, "utf-8")

      const messages: ExtractedMessage[] = []
      await extractor.extract(
        "props-destructuring-vue-runtime.vue",
        code,
        (res) => {
          messages.push(res)
        },
        {
          linguiConfig: vueLinguiConfig,
        },
      )

      return messages.map(({ message, placeholders }) => ({
        message,
        placeholders,
      }))
    }

    it("should compile <script setup> by default, as the runtime does", async () => {
      expect(await extractMessages()).toEqual([
        { message: "Hello {0}", placeholders: { 0: "__props.name" } },
      ])
    })

    it("should not compile <script setup> when reactivityTransform is false", async () => {
      expect(
        await extractMessages(
          createVueExtractor({ reactivityTransform: false }),
        ),
      ).toEqual([{ message: "Hello {name}", placeholders: { name: "name" } }])
    })
  })
})
