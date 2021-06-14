import { remoteLoader } from "../src"
import fs from "fs"

describe("remote-loader", () => {
  it("should compile correctly JSON messages coming from the fly", async () => {
    const unlink = createConfig("minimal")
    const messages = await simulatedJsonResponse()
    const remoteMessages = remoteLoader({ format: "minimal", messages})
    expect(remoteMessages).toMatchInlineSnapshot(`
      Object {
        property.key: value,
        {0} Deposited: Array [
          Array [
            0,
          ],
           Deposited,
        ],
        {0} Strategy: Array [
          Array [
            0,
          ],
           Strategy,
        ],
      }
    `)
    expect(remoteMessages["property.key"]).toEqual("value")
    unlink()
  })

  describe("fallbacks", () => {
    it("should fallback correctly to the fallback collection", async () => {
      const unlink = createConfig("minimal")
      const messages = await simulatedJsonResponse(true)
      const fallbackMessages = await simulatedJsonResponse()

      expect(remoteLoader({ format: "minimal", messages, fallbackMessages }))
        .toMatchInlineSnapshot(`
        Object {
          property.key: value,
          {0} Deposited: Array [
            Array [
              0,
            ],
             Deposited,
          ],
          {0} Strategy: Array [
            Array [
              0,
            ],
             Strategy,
          ],
        }
      `)
      unlink()
    })
  })
})

function simulatedJsonResponse(nully?: boolean) {
  return new Promise((resolve) => {
    resolve({
      "property.key": nully ? "" : "value",
      "{0} Deposited": "{0} Deposited",
      "{0} Strategy": "{0} Strategy",
    })
  })
}


function createConfig(format: string) {
  const filename = `${process.cwd()}/.linguirc`
  const config = `
  {
    'locales': ['en'],
    'catalogs': [{
      'path': 'locale/{locale}/messages'
    }],
    'format': '${format}'
  }
  `
  fs.writeFileSync(filename, config)
  return () => fs.unlinkSync(filename)
}
