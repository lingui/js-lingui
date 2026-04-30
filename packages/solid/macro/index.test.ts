import * as macroModule from "./index.mjs"

describe("solid-macro", () => {
  it("should re-export Macro", () => {
    expect((macroModule as any).default.isBabelMacro).toBeTruthy()
  })
})
