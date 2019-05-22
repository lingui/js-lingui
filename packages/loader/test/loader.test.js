import path from "path"
import compiler from "./compiler.js"

jest.useFakeTimers()

const skipOnWindows = /^win/.test(process.platform) ? it.skip : it

describe("lingui-loader", function() {
  // skip on windows for now
  skipOnWindows("should compile catalog", async () => {
    expect.assertions(2)

    const stats = await compiler(
      path.join(".", "locale", "en", "messages.json")
    )
    const output = stats.toJson()
    expect(output.errors).toEqual([])
    expect(output.modules[0].source).toMatchSnapshot()
  })

  skipOnWindows("should allow config option", async () => {
    const stats = await compiler(
      path.join(".", "locale", "en", "messages.json"),
      { config: `${path.dirname(module.filename)}/customconfig` }
    )

    const output = stats.toJson()

    // customconfig contains this namespace
    expect(output.modules[0].source).toMatch(/window\.really_long_namespace=/)
  })
})
