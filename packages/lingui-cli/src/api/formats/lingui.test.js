import path from "path"
import tmp from "tmp"
import plugin from "./lingui"

describe("Catalog formats - lingui", function() {
  const createConfig = () => ({
    localeDir: tmp.dirSync({ unsafeCleanup: true }).name
  })

  it("should add locale", function() {
    const config = createConfig()

    // First run, create a directory with an empty message catalog
    expect(plugin(config).addLocale("en")).toEqual([
      true,
      expect.stringMatching(path.join("en", "messages.json$"))
    ])

    // Second run, don't do anything
    expect(plugin(config).addLocale("en")).toEqual([
      false,
      expect.stringMatching(path.join("en", "messages.json$"))
    ])
  })

  it("shouldn't add invalid locale", function() {
    expect(plugin(createConfig()).addLocale("xyz")).toEqual([false, null])
  })
})
