// import from top-level to test that unpackCatalog is exported properly
import { unpackCatalog } from "."

describe("unpackCatalog", function() {
  it("should unpack compiled catalog", function() {
    const compiled = {
      m: {
        msg: "Hello"
      },
      l: {
        p: () => "other"
      }
    }

    const catalog = unpackCatalog(compiled)
    expect(catalog.messages).toEqual({ msg: "Hello" })
    expect(catalog.languageData.plurals()).toEqual("other")
  })
})
