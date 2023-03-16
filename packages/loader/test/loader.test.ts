import path from "path"
import compiler from "./compiler"

describe("lingui-loader", () => {
  it("should compile catalog in po format", async () => {
    expect.assertions(2)

    const stats = await compiler(
      path.join(__dirname, "po-format/entrypoint.js")
    )

    const data = await import(path.join(stats.outputPath, "bundle.js"))
    expect(stats.errors).toEqual([])
    expect((await data.load()).messages).toMatchSnapshot()
  })

  it("should compile catalog in json format", async () => {
    expect.assertions(2)

    const stats = await compiler(
      path.join(__dirname, "./json-format/entrypoint.js")
    )

    const data = await import(path.join(stats.outputPath, "bundle.js"))
    expect(stats.errors).toEqual([])
    expect((await data.load()).messages).toMatchSnapshot()
  })
})
