import * as macroModule from "@lingui/core/macro"

describe("core-macro", () => {
  it("Should re-export Macro", () => {
    expect((macroModule as any).default.isBabelMacro).toBeTruthy()
  })
})
