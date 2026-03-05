import * as macroModule from "@lingui/react/macro"

describe("react-macro", () => {
  it("Should re-export Macro", () => {
    expect((macroModule as any).default.isBabelMacro).toBeTruthy()
  })
})
