import path from "path"
import { createFixtures } from "../../tests.js"
import { findEsmPackageJson, getCjsInEsmPackageWarnings } from "./esmPackage.js"

describe("findEsmPackageJson", () => {
  it("returns the nearest package.json when it has type module", async () => {
    const rootDir = await createFixtures({
      "package.json": `{ "type": "module" }`,
    })

    expect(findEsmPackageJson(path.join(rootDir, "locales/en.js"))).toBe(
      path.join(rootDir, "package.json"),
    )
  })

  it("stops at the nearest package.json, even without a type", async () => {
    const rootDir = await createFixtures({
      "package.json": `{ "type": "module" }`,
      "app/package.json": `{ "name": "app" }`,
    })

    expect(findEsmPackageJson(path.join(rootDir, "app/en.js"))).toBeUndefined()
  })

  it("returns undefined for a package.json it cannot parse", async () => {
    const rootDir = await createFixtures({
      "package.json": `{ "type": "module",`,
    })

    expect(findEsmPackageJson(path.join(rootDir, "en.js"))).toBeUndefined()
  })

  it("returns undefined when no package.json is found up to the root", () => {
    const file = path.join(path.parse(process.cwd()).root, "en.js")

    expect(findEsmPackageJson(file)).toBeUndefined()
  })
})

describe("getCjsInEsmPackageWarnings", () => {
  it("names each package.json once, with paths relative to rootDir", async () => {
    const rootDir = await createFixtures({
      "package.json": `{ "type": "module" }`,
    })

    const warnings = getCjsInEsmPackageWarnings(
      [path.join(rootDir, "en.js"), path.join(rootDir, "pl.js")],
      rootDir,
    )

    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain(
      `package.json has "type": "module", so Node loads en.js`,
    )
  })
})
