import { makeConfig } from "@lingui/conf"
import type { ExtractedMessage } from "@lingui/babel-plugin-extract-messages"
import type { VueExtractorConfig } from "./vue-extractor"

const code = `
<script setup lang="ts">
import { t } from "@lingui/core/macro"
const s = t\`ScriptMsg\`
</script>

<template>
  <p>{{ i18n._("TemplateMsg") }}</p>
</template>
`

const makeLinguiConfig = (jsxRuntime?: "vue") =>
  makeConfig(
    {
      locales: ["en"],
      sourceLocale: "en",
      rootDir: ".",
      catalogs: [{ path: "<rootDir>/{locale}", include: ["<rootDir>"] }],
      macro: { jsxRuntime },
    },
    { skipValidation: true },
  )

async function extract(
  config?: VueExtractorConfig,
  jsxRuntime?: "vue",
): Promise<string[]> {
  const { createVueExtractor } = await import("./vue-extractor")

  const messages: ExtractedMessage[] = []
  await createVueExtractor(config).extract(
    "test.vue",
    code,
    (res) => {
      messages.push(res)
    },
    { linguiConfig: makeLinguiConfig(jsxRuntime) },
  )

  return messages.map((message) => message.message ?? message.id)
}

beforeEach(() => {
  vi.resetModules()
})

afterEach(() => {
  vi.doUnmock("@lingui/vue/compiler")
  vi.doUnmock("@vue/compiler-sfc")
})

describe("without @lingui/vue", () => {
  beforeEach(() => {
    // the loader resolves to `undefined` when the package is not installed
    vi.doMock("@lingui/vue/compiler", () => ({
      linguiTemplateTransform: undefined,
    }))
  })

  it("should extract script and template messages without the template transform", async () => {
    expect(await extract()).toEqual(["ScriptMsg", "TemplateMsg"])
  })

  it("should fail when macro.jsxRuntime is vue", async () => {
    await expect(extract(undefined, "vue")).rejects.toThrow(
      "`@lingui/vue` is required to extract the template macros of test.vue",
    )
  })

  it("should fail when template options are passed", async () => {
    await expect(extract({ template: {} })).rejects.toThrow(
      "`@lingui/vue` is required to extract the template macros of test.vue",
    )
  })

  it("should not fail when the template transform is disabled", async () => {
    expect(await extract({ template: false }, "vue")).toEqual([
      "ScriptMsg",
      "TemplateMsg",
    ])
  })
})

describe("with @vue/compiler-sfc < 3.4", () => {
  beforeEach(() => {
    vi.doMock("@vue/compiler-sfc", async (importOriginal) => ({
      ...(await importOriginal<object>()),
      version: "3.3.4",
    }))
  })

  it("should fail when the template transform is enabled", async () => {
    await expect(extract()).rejects.toThrow(
      "need `@vue/compiler-sfc` 3.4 or later, found 3.3.4",
    )
  })

  it("should not fail when the template transform is disabled", async () => {
    expect(await extract({ template: false })).toEqual([
      "ScriptMsg",
      "TemplateMsg",
    ])
  })
})

describe("isLinguiVueNotFound", () => {
  const moduleNotFound = (message: string) =>
    Object.assign(new Error(message), { code: "ERR_MODULE_NOT_FOUND" })

  it("should match a missing @lingui/vue", async () => {
    const { isLinguiVueNotFound } = await import("./vue-extractor")

    expect(
      isLinguiVueNotFound(
        moduleNotFound(
          "Cannot find package '@lingui/vue' imported from /app/node_modules/@lingui/extractor-vue/dist/index.mjs",
        ),
      ),
    ).toBe(true)
  })

  it("should not match a missing dependency of @lingui/vue", async () => {
    const { isLinguiVueNotFound } = await import("./vue-extractor")

    expect(
      isLinguiVueNotFound(
        moduleNotFound(
          "Cannot find package '@vue/compiler-core' imported from /app/node_modules/@lingui/vue/dist/compiler.mjs",
        ),
      ),
    ).toBe(false)
  })
})
