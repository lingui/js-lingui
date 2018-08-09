import fs from "fs"
import path from "path"
import mockFs from "mock-fs"

import format from "./po"

describe("pofile format", function() {
  afterEach(() => {
    mockFs.restore()
  })

  it("should write catalog in pofile format", function() {
    mockFs({
      locale: {
        en: mockFs.directory()
      }
    })
    const filename = path.join("locale", "en", "messages.po")
    const catalog = {
      static: {
        translation: "Static message"
      },
      withOrigin: {
        translation: "Message with origin",
        origin: [["src/App.js", 4], ["src/Component.js", 2]]
      },
      withDescription: {
        translation: "Message with description",
        description: "Description is comment from developers to translators"
      },
      obsolete: {
        translation: "Obsolete message",
        obsolete: true
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
          " a dream. His room, a proper human"
      }
    }

    format.write(filename, catalog, { locale: "en" })
    const pofile = fs.readFileSync(filename).toString()
    expect(pofile).toMatchSnapshot()
  })

  it("should read catalog in pofile format", function() {
    const pofile = fs
      .readFileSync(
        path.join(path.resolve(__dirname), "fixtures", "messages.po")
      )
      .toString()

    mockFs({
      locale: {
        en: {
          "messages.po": pofile
        }
      }
    })

    const filename = path.join("locale", "en", "messages.po")
    expect(format.read(filename)).toMatchSnapshot()
  })

  it("should write the same catalog as it was read", function() {
    const pofile = fs
      .readFileSync(
        path.join(path.resolve(__dirname), "fixtures", "messages.po")
      )
      .toString()

    mockFs({
      locale: {
        en: {
          "messages.po": pofile
        }
      }
    })

    const filename = path.join("locale", "en", "messages.po")
    const catalog = format.read(filename)
    format.write(filename, catalog)
    expect(fs.readFileSync(filename).toString()).toEqual(pofile)
  })
})
