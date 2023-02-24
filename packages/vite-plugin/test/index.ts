import path from "path"
import { lingui } from "../src"

describe("vite-plugin", () => {
  it("should return compiled catalog", async () => {
    const p = lingui({
      configPath: path.resolve(__dirname, ".linguirc"),
    })
    const result = await (p.transform as any)(
      "",
      path.join(__dirname, "locale", "en", "messages.po")
    )
    expect(result).toMatchSnapshot()
  })
})
