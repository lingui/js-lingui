import { describe, expect, it } from "vitest";
import fs from "fs"
import path from "path"

import { formatter as createFormat } from "./json"
import { CatalogType } from "@lingui/conf"

describe("json format", () => {
  describe("style: lingui", () => {
    it("should write catalog in lingui format", async () => {
      const format = createFormat({ origins: true, style: "lingui" })

      const filename = path.join("locale", "en", "messages.json")
      const catalog: CatalogType = {
        static: {
          translation: "Static message",
        },
        withOrigin: {
          translation: "Message with origin",
          origin: [["src/App.js", 4]],
        },
        withMultipleOrigins: {
          translation: "Message with multiple origin",
          origin: [
            ["src/App.js", 4],
            ["src/Component.js", 2],
          ],
        },
        withDescription: {
          translation: "Message with description",
          comments: ["Description is comment from developers to translators"],
        },
        withComments: {
          translation: "Support translator comments separately",
        },
        obsolete: {
          translation: "Obsolete message",
          obsolete: true,
        },
        withFlags: {
          translation: "Keeps any flags that are defined",
        },
        veryLongString: {
          translation:
            "One morning, when Gregor Samsa woke from troubled dreams, he found himself" +
            " transformed in his bed into a horrible vermin. He lay on his armour-like" +
            " back, and if he lifted his head a little he could see his brown belly," +
            " slightly domed and divided by arches into stiff sections. The bedding was" +
            " hardly able to cover it and seemed ready to slide off any moment. His many" +
            " legs, pitifully thin compared with the size of the rest of him, waved about" +
            " helplessly as he looked. \"What's happened to me?\" he thought. It wasn't" +
            " a dream. His room, a proper human",
        },
      }

      const actual = await format.serialize(catalog, {
        locale: "en",
        filename,
        existing: null,
        sourceLocale: "en",
      })
      expect(actual).toMatchSnapshot()
    })

    it("should read catalog in lingui format", () => {
      const format = createFormat({ style: "lingui" })

      const lingui = fs
        .readFileSync(path.join(__dirname, "fixtures/messages.json"))
        .toString()

      const filename = path.join("locale", "en", "messages.json")
      const actual = format.parse(lingui, {
        locale: "en",
        filename,
        sourceLocale: "en",
      })
      expect(actual).toMatchSnapshot()
    })

    it("should not include origins if origins option is false", async () => {
      const format = createFormat({ origins: false, style: "lingui" })

      const filename = path.join("locale", "en", "messages.json")
      const catalog: CatalogType = {
        static: {
          translation: "Static message",
        },
        withOrigin: {
          translation: "Message with origin",
          origin: [["src/App.js", 4]],
        },
        withMultipleOrigins: {
          translation: "Message with multiple origin",
          origin: [
            ["src/App.js", 4],
            ["src/Component.js", 2],
          ],
        },
      }

      const actual = await format.serialize(catalog, {
        locale: "en",
        filename,
        existing: null,
        sourceLocale: "en",
      })
      const linguiOriginProperty = '"origin"'
      expect(actual).toEqual(expect.not.stringContaining(linguiOriginProperty))
    })

    it("should not include lineNumbers if lineNumbers option is false", async () => {
      const format = createFormat({ lineNumbers: false, style: "lingui" })

      const filename = path.join("locale", "en", "messages.json")
      const catalog: CatalogType = {
        static: {
          translation: "Static message",
        },
        withOrigin: {
          translation: "Message with origin",
          origin: [["src/App.js", 4]],
        },
        withMultipleOrigins: {
          translation: "Message with multiple origin",
          origin: [
            ["src/App.js", 4],
            ["src/Component.js", 2],
          ],
        },
      }
      const actual = await format.serialize(catalog, {
        locale: "en",
        filename,
        existing: null,
        sourceLocale: "en",
      })
      expect(actual).toMatchInlineSnapshot(`
      {
        "static": {
          "translation": "Static message"
        },
        "withOrigin": {
          "translation": "Message with origin",
          "origin": [
            [
              "src/App.js"
            ]
          ]
        },
        "withMultipleOrigins": {
          "translation": "Message with multiple origin",
          "origin": [
            [
              "src/App.js"
            ],
            [
              "src/Component.js"
            ]
          ]
        }
      }

    `)
    })
  })

  describe("style: minimal", () => {
    const format = createFormat({ style: "minimal" })

    it("should write catalog in minimal format", async () => {
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
          comments: ["Description is comment from developers to translators"],
        },
        withComments: {
          translation: "Support translator comments separately",
        },
        obsolete: {
          translation: "Obsolete message",
          obsolete: true,
        },
        withFlags: {
          translation: "Keeps any flags that are defined",
        },
      }

      const actual = await format.serialize(catalog, {
        locale: "en",
        filename,
        existing: null,
        sourceLocale: "en",
      })
      expect(actual).toMatchSnapshot()
    })

    it("should read catalog in minimal format", () => {
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
      const actual = format.parse(content, {
        locale: "en",
        filename,
        sourceLocale: "en",
      })
      expect(actual).toMatchSnapshot()
    })
  })
})
