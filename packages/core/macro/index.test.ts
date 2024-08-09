import macro from "@lingui/core/macro"

describe("react-macro", () => {
  it("Should re-export Macro", () => {
    expect((macro as any).isBabelMacro).toBeTruthy()
  })
})
