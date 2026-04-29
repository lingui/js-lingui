import path from "path"
import { transformSync } from "@babel/core"
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
})
