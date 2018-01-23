import path from "path"
import compiler from "./compiler.js"

const skipOnWindows = /^win/.test(process.platform) ? test.skip : test

describe("lingui-loader", function() {
  skipOnWindows("should compile catalog", async () => {
    // skip on windows for now

    const stats = await compiler(
      path.join(".", "locale", "en", "messages.json")
    )
    const output = stats.toJson()
    expect(output.errors).toEqual([])
    expect(output.modules[0].source).toMatchSnapshot()
  })
})
