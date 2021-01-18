import path from "path"
import snowpackPlugin from "../src"

describe("snowpack-loader", () => {
  it("to match snapshot", () => {
    const p = snowpackPlugin();
    expect(p).toMatchSnapshot();
  })

  it("should return error if import doesn't contain extension", async () => {
    const p = snowpackPlugin()
    expect(async () => p.load({ filePath: "./fixtures/locale/en/messages" })).rejects.toThrowErrorMatchingSnapshot()
  })

  it("should return compiled catalog", async() => {
    const p = snowpackPlugin(null, {
      configPath: path.resolve(
        __dirname,
        ".linguirc",
      ),
    })
    const result = await p.load({ filePath: path.join(__dirname, "locale", "en", "messages.po") })
    expect(result).toMatchSnapshot()
  })
})