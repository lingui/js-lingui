import { buildIncludeDepsFilter } from "./buildIncludeDepsFilter"

describe("buildExternalizeFilter", () => {
  it("should not externalize packages from includeDeps", () => {
    const isIncluded = buildIncludeDepsFilter(["package1", "package3/subpath"])

    expect(isIncluded("package1")).toBeTruthy()
    expect(isIncluded("package1/subpath")).toBeTruthy()
    expect(isIncluded("package2")).toBeFalsy()
    expect(isIncluded("package3/subpath")).toBeTruthy()
    expect(isIncluded("package3/subpath/subpath")).toBeTruthy()
  })
})
