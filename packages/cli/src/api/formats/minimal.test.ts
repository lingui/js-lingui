import path from "path"

import createFormat from "./minimal"
import { CatalogType } from "../types"

describe("minimal format", () => {
  it("should write catalog in minimal format", async () => {
    const format = createFormat()

    const filename = path.join("locale", "en", "messages.json")
    const catalog: CatalogType = {
      static: {
        translation: "Static message",
      },
      withOrigin: {
        translation: "Message with origin",
        origin: [["src/App.js", 4]],
      },
      withDescription: {
        translation: "Message with description",
        extractedComments: [
          "Description is comment from developers to translators",
        ],
      },
      withComments: {
        comments: ["Translator comment", "This one might come from developer"],
        translation: "Support translator comments separately",
      },
      obsolete: {
        translation: "Obsolete message",
        obsolete: true,
      },
      withFlags: {
        flags: ["fuzzy", "otherFlag"],
        translation: "Keeps any flags that are defined",
      },
    }

    const actual = await format.serialize(catalog, {
      locale: "en",
      filename,
      existing: null,
    })
    expect(actual).toMatchSnapshot()
  })

  it("should read catalog in minimal format", () => {
    const format = createFormat()

    const content = `{
  "static": "Static message",
  "withOrigin": "Message with origin",
  "withMultipleOrigins": "Message with multiple origin",
  "withDescription": "Message with description",
  "withComments": "Support translator comments separately",
  "obsolete": "Obsolete message",
  "withFlags": "Keeps any flags that are defined"
}`

    const filename = path.join("locale", "en", "messages.json")
    const actual = format.parse(content, { locale: "en", filename })
    expect(actual).toMatchSnapshot()
  })
})
