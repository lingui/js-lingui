import { describe, expect, it } from "vitest";
import macro from "@lingui/react/macro"

describe("react-macro", () => {
  it("Should re-export Macro", () => {
    expect((macro as any).isBabelMacro).toBeTruthy()
  })
})
