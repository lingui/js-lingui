import { i18nMark } from "@lingui/react"

describe("i18nMark", function() {
  it("should be identity function (removed by babel extract plugin)", function() {
    expect(i18nMark(42)).toEqual(42)
  })
})
