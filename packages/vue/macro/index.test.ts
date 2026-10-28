import * as macroModule from "./index.mjs"

describe("vue-macro", () => {
  it("should re-export Macro", () => {
    expect((macroModule as any).default.isBabelMacro).toBeTruthy()
  })
})
