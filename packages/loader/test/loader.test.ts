import path from "path"
import compiler from "./compiler"

describe("lingui-loader", () => {
  it("should compile catalog", async () => {
    expect.assertions(2)

    const stats = await compiler(path.join(__dirname, "entrypoint.js"))

    const data = await import(path.join(stats.outputPath, "bundle.js"))
    expect(stats.errors).toEqual([])
    expect((await data.load()).messages).toMatchSnapshot()
  })
})
