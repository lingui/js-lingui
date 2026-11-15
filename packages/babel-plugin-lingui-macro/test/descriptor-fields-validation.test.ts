import path from "path"
import { transformSync } from "@babel/core"
import { makeConfig } from "@lingui/conf"
import { getDefaultBabelOptions } from "./macroTester"

describe("descriptorFields validation", () => {
  process.env.LINGUI_CONFIG = path.join(__dirname, "lingui.config.js")

  const codeWithMacro = `
    import { t } from '@lingui/core/macro';
    const msg = t\`Message\`
  `

  it("should throw for removed option: extract", () => {
    const transform = () =>
      transformSync(codeWithMacro, {
        ...getDefaultBabelOptions("plugin", {
          extract: true,
        } as any),
      })

    expect(transform).toThrow(/Option "extract" has been removed/)
  })

  it("should throw for removed option: stripMessageField", () => {
    const transform = () =>
      transformSync(codeWithMacro, {
        ...getDefaultBabelOptions("plugin", {
          stripMessageField: true,
        } as any),
      })

    expect(transform).toThrow(/Option "stripMessageField" has been removed/)
  })

  it("should throw for invalid descriptorFields value", () => {
    const transform = () =>
      transformSync(codeWithMacro, {
        ...getDefaultBabelOptions("plugin", {
          // @ts-expect-error option is invalid
          descriptorFields: "invalid",
        }),
      })

    expect(transform).toThrow(/Invalid descriptorFields value: "invalid"/)
  })

  it("should read descriptorFields from the Lingui config when the plugin option is not set", () => {
    const code =
      transformSync(codeWithMacro, {
        ...getDefaultBabelOptions("plugin", {
          linguiConfig: makeConfig({
            rootDir: __dirname,
            locales: ["en"],
            descriptorFields: "id-only",
          }),
        }),
      })?.code ?? ""
    // "id-only" keeps only the id: the message text must not survive.
    expect(code).not.toContain("Message")
    expect(code).toContain("id:")
  })

  it("should prefer the plugin option over the Lingui config", () => {
    const code =
      transformSync(codeWithMacro, {
        ...getDefaultBabelOptions("plugin", {
          linguiConfig: makeConfig({
            rootDir: __dirname,
            locales: ["en"],
            descriptorFields: "id-only",
          }),
          descriptorFields: "all",
        }),
      })?.code ?? ""
    expect(code).toContain("Message")
  })
})
