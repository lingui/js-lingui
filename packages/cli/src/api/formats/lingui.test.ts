import fs from "fs"
import path from "path"
import mockFs from "mock-fs"
import mockDate from "mockdate"

import format from "./lingui"
import { CatalogType } from "../types"

describe("lingui format", function () {
  afterEach(() => {
    mockFs.restore()
    mockDate.reset()
  })

  it("should write catalog in lingui format", function () {
    mockFs({
      locale: {
        en: mockFs.directory(),
      },
    })
    mockDate.set("2018-08-27T10:00Z")

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
        description: "Description is comment from developers to translators",
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

    format.write(filename, catalog, { origins: true, locale: "en" })
    const lingui = fs.readFileSync(filename).toString()
    mockFs.restore()
    expect(lingui).toMatchSnapshot()
  })

  it("should read catalog in lingui format", function () {
    const lingui = fs
      .readFileSync(
        path.join(path.resolve(__dirname), "fixtures", "messages.json")
      )
      .toString()

    mockFs({
      locale: {
        en: {
          "messages.json": lingui,
        },
      },
    })

    const filename = path.join("locale", "en", "messages.json")
    const actual = format.read(filename)
    mockFs.restore()
    expect(actual).toMatchSnapshot()
  })

  it("should not include origins if origins option is false", function () {
    mockFs({
      locale: {
        en: mockFs.directory(),
      },
    })

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
    format.write(filename, catalog, { origins: false, locale: "en" })
    const lingui = fs.readFileSync(filename).toString()
    mockFs.restore()
    const linguiOriginProperty = '"origin"'
    expect(lingui).toEqual(expect.not.stringContaining(linguiOriginProperty))
  })
})
