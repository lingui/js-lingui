import { remoteLoader } from "./remoteLoader"
import fs from "fs"
import path from "path"

describe("remote-loader", () => {
  it("should compile correctly JSON messages coming from the fly", async () => {
    const unlink = createConfig("minimal")
    const messages = await simulatedJsonResponse()
    expect(remoteLoader("en", messages)).toMatchInlineSnapshot(
      `/*eslint-disable*/module.exports={messages:{"property.key":"value","{0} Deposited":[["0"]," Deposited"],"{0} Strategy":[["0"]," Strategy"]}};`
    )
    unlink()
  })

  it("should compile correctly .po messages coming from the fly", async () => {
    const unlink = createConfig("po")
    const messages = await simulatedPoResponse()
    expect(remoteLoader("en", messages)).toMatchInlineSnapshot(
      `/*eslint-disable*/module.exports={messages:{"Hello World":"Hello World","My name is {name}":["My name is ",["name"]]}};`
    )
    unlink()
  })

  describe("fallbacks", () => {
    it("should fallback correctly to the fallback collection", async () => {
      const unlink = createConfig("minimal")
      const messages = await simulatedJsonResponse(true)
      const fallbackMessages = await simulatedJsonResponse()

      expect(
        remoteLoader("en", messages, fallbackMessages)
      ).toMatchInlineSnapshot(
        `/*eslint-disable*/module.exports={messages:{"property.key":"value","{0} Deposited":[["0"]," Deposited"],"{0} Strategy":[["0"]," Strategy"]}};`
      )
      unlink()
    })

    it("should fallback to compiled fallback", async () => {
      const unlink = createConfig("po")
      const messages = await simulatedPoResponse("es")
      const fallbackMessages = await simulatedPoCompiledFile()

      expect(
        remoteLoader("en", messages, fallbackMessages)
      ).toMatchInlineSnapshot(
        `/*eslint-disable*/module.exports={messages:{"Hello World":"Hello World","My name is {name}":["My name is ",["name"]]}};`
      )
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

function simulatedPoResponse(locale = "en") {
  return new Promise((resolve) => {
    const file = fs.readFileSync(
      path.join(__dirname, "..", "test/locale/" + locale + "/messages.po"),
      "utf-8"
    )
    resolve(file)
  })
}

function simulatedPoCompiledFile() {
  return new Promise((resolve) => {
    resolve({
      "Hello World": "Hello World",
      "My name is {name}": ["My name is ", ["name"]],
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
