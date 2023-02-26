import { buildExternalizeFilter } from "./buildExternalizeFilter"

describe("buildExternalizeFilter", () => {
  it("should exclude packages from package.json", () => {
    const isExternal = buildExternalizeFilter({
      includeDeps: [],
      excludeDeps: [],
      packageJson: {
        dependencies: {
          next: "*",
        },
        devDependencies: {},
        optionalDependencies: {},
        peerDependencies: {},
      },
    })

    expect(isExternal("foo")).toBeFalsy()
    expect(isExternal("next")).toBeTruthy()
    expect(isExternal("next/head")).toBeTruthy()
    expect(isExternal("@next/head")).toBeFalsy()
  })

  it("should respect all packageJson dependencies", () => {
    const isExternal = buildExternalizeFilter({
      includeDeps: [],
      excludeDeps: [],
      packageJson: {
        dependencies: {
          package1: "*",
        },
        devDependencies: {
          package2: "*",
        },
        optionalDependencies: {
          package3: "*",
        },
        peerDependencies: {
          package4: "*",
        },
      },
    })

    expect(isExternal("non-deps")).toBeFalsy()
    expect(isExternal("package1")).toBeTruthy()
    expect(isExternal("package2")).toBeTruthy()
    expect(isExternal("package3")).toBeTruthy()
    expect(isExternal("package4")).toBeTruthy()
  })

  it("should not externalize packages from includeDeps", () => {
    const isExternal = buildExternalizeFilter({
      includeDeps: ["package1"],
      excludeDeps: [],
      packageJson: {
        dependencies: {
          package1: "*",
          package2: "*",
        },
      },
    })

    expect(isExternal("package1")).toBeFalsy()
    expect(isExternal("package2")).toBeTruthy()
  })

  it("should externalize deps from excludeDeps", () => {
    const isExternal = buildExternalizeFilter({
      includeDeps: ["package1"],
      excludeDeps: ["package2"],
      packageJson: {
        dependencies: {
          package1: "*",
          package3: "*",
        },
      },
    })

    expect(isExternal("package1")).toBeFalsy()
    expect(isExternal("package2")).toBeTruthy()
    expect(isExternal("package3")).toBeTruthy()
    expect(isExternal("non-deps")).toBeFalsy()
  })
})
