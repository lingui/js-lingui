import compiler from "./compiler.js"

describe("lingui-loader", function() {
  it("should compile catalog", async () => {
    const stats = await compiler("./locale/en/messages.json")
    const output = stats.toJson().modules[0].source
    expect(output).toMatchSnapshot()
  })
})
