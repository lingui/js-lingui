/**
 * @jest-environment node
 */
import path from "path"
import compiler from "./compiler.js"

const skipOnWindows = /^win/.test(process.platform) ? it.skip : it

describe("lingui-loader", function() {
  skipOnWindows("should compile catalog", () => {
    // skip on windows for now

    expect.assertions(2)

    return compiler(path.join(".", "locale", "en", "messages.json")).then(
      stats => {
        const output = stats.toJson()
        expect(output.errors).toEqual([])
        expect(output.modules[0].source).toMatchSnapshot()
      }
    )
  })
})
