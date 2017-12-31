import path from "path"
import compiler from "./compiler.js"

describe("lingui-loader", function() {
  it("should compile catalog", async () => {
    const stats = await compiler(
      path.join(".", "locale", "en", "messages.json")
    )
    const output = stats.toJson()
    expect(output.errors).toEqual([])
    expect(output.modules[0].source).toMatchSnapshot()
  })
})
