import { describe, expect, it, vi } from "vitest"
import path from "path"
import fs from "node:fs/promises"
import { build, watch } from "./compiler"
import { mkdtempSync } from "fs"
import os from "os"

describe("lingui-loader", () => {
  it("should compile catalog in po format", async () => {
    const built = await build(path.join(__dirname, "po-format/entrypoint.js"))

    console.log(built.stats.errors[0])
    const data = await built.loadBundle()
    expect(built.stats.errors).toEqual([])
    expect(built.stats.warnings).toEqual([])

    expect((await data.load()).messages).toMatchSnapshot()
  })

  it("should compile catalog in json format", async () => {
    const built = await build(
      path.join(__dirname, "./json-format/entrypoint.js")
    )

    expect(built.stats.errors).toEqual([])
    expect(built.stats.warnings).toEqual([])

    const data = await built.loadBundle()
    expect((await data.load()).messages).toMatchSnapshot()
  })

  it("should compile catalog with relative path with no warnings", async () => {
    const built = await build(
      path.join(__dirname, "./relative-catalog-path/entrypoint.js")
    )

    expect(built.stats.errors).toEqual([])
    expect(built.stats.warnings).toEqual([])

    const data = await built.loadBundle()
    expect((await data.load()).messages).toMatchSnapshot()
  })

  it("should throw an error when requested catalog don't belong to lingui config", async () => {
    const built = await build(
      path.join(__dirname, "./not-known-catalog/entrypoint.js")
    )

    expect(built.stats.errors[0].message).toContain(
      "is not matched to any of your catalogs paths"
    )
    expect(built.stats.warnings).toEqual([])
  })

  it("should trigger webpack recompile on catalog dependency change", async () => {
    const fixtureTempPath = await copyFixture(path.join(__dirname, "po-format"))

    const watching = watch(path.join(fixtureTempPath, "/entrypoint.js"))

    const res = await watching.build()

    expect((await res.loadBundle().then((m) => m.load())).messages)
      .toMatchInlineSnapshot(`
      {
        ED2Xk0: [
          String from template,
        ],
        mVmaLu: [
          My name is ,
          [
            name,
          ],
        ],
        mY42CM: [
          Hello World,
        ],
      }
    `)

    // change the dependency
    await fs.writeFile(
      path.join(fixtureTempPath, "/locale/messages.pot"),
      `msgid "Hello World"
msgstr ""

msgid "My name is {name}"
msgstr ""

msgid "String from template changes!"
msgstr ""
`
    )

    const stats2 = await watching.build()
    vi.resetModules()

    expect((await stats2.loadBundle().then((m) => m.load())).messages)
      .toMatchInlineSnapshot(`
      {
        mVmaLu: [
          My name is ,
          [
            name,
          ],
        ],
        mY42CM: [
          Hello World,
        ],
        wg2uwk: [
          String from template changes!,
        ],
      }
    `)

    await watching.stop()
  })
})

async function copyFixture(srcPath: string) {
  const fixtureTempPath = mkdtempSync(
    path.join(os.tmpdir(), `lingui-test-fixture-${process.pid}`)
  )

  await fs.cp(srcPath, fixtureTempPath, {
    recursive: true,
  })

  return fixtureTempPath
}
