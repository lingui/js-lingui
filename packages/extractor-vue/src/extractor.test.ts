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
