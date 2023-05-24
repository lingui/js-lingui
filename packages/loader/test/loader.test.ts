import path from "path"
import fs from "node:fs/promises"
import { build, watch } from "./compiler"
import { mkdtempSync } from "fs"
import os from "os"

const skipOnWindows = os.platform() === "win32" ? it.skip : it

describe("lingui-loader", () => {
  it("should compile catalog in po format", async () => {
    expect.assertions(2)

    const built = await build(path.join(__dirname, "po-format/entrypoint.js"))

    const data = await built.loadBundle()
    expect(built.stats.errors).toEqual([])
    expect((await data.load()).messages).toMatchSnapshot()
  })

  it("should compile catalog in json format", async () => {
    expect.assertions(2)

    const built = await build(
      path.join(__dirname, "./json-format/entrypoint.js")
    )

    expect(built.stats.errors).toEqual([])

    const data = await built.loadBundle()
    expect((await data.load()).messages).toMatchSnapshot()
  })

  skipOnWindows(
    "should trigger webpack recompile on catalog dependency change",
    async () => {
      const fixtureTempPath = await copyFixture(
        path.join(__dirname, "po-format")
      )

      const watching = watch(path.join(fixtureTempPath, "/entrypoint.js"))

      const res = await watching.build()

      expect((await res.loadBundle().then((m) => m.load())).messages)
        .toMatchInlineSnapshot(`
      {
        ED2Xk0: String from template,
        mVmaLu: [
          My name is ,
          [
            name,
          ],
        ],
        mY42CM: Hello World,
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
      jest.resetModules()

      expect((await stats2.loadBundle().then((m) => m.load())).messages)
        .toMatchInlineSnapshot(`
      {
        mVmaLu: [
          My name is ,
          [
            name,
          ],
        ],
        mY42CM: Hello World,
        wg2uwk: String from template changes!,
      }
    `)

      await watching.stop()
    }
  )
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
