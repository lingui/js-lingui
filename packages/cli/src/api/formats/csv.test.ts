import fs from "fs"
import path from "path"
import mockFs from "mock-fs"

import format from "./csv"

describe("csv format", function () {
  afterEach(() => {
    mockFs.restore()
  })

  it("should write catalog in csv format", function () {
    mockFs({
      locale: {
        en: mockFs.directory(),
      },
    })
    const filename = path.join("locale", "en", "messages.csv")
    const catalog = {
      static: {
        translation: "Static message",
      },
      stringWithUnpairedDoubleQuote: {
        translation: `Camecho 9"" LCD Monitor HD TFT Color Screen, 2 Video Input/HDMI/VGA, Support Car Backup`,
      },
      veryLongString: {
        translation: `One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. ""What's happened to me?"" he thought. It wasn't a dream. His room, a proper human`,
      },
    }

    format.write(filename, catalog)
    const csv = fs.readFileSync(filename).toString()
    mockFs.restore()
    expect(csv).toMatchSnapshot()
  })

  it("should read catalog in csv format", function () {
    const csv = fs
      .readFileSync(
        path.join(path.resolve(__dirname), "fixtures", "messages.csv")
      )
      .toString()

    mockFs({
      locale: {
        en: {
          "messages.csv": csv,
        },
      },
    })

    const filename = path.join("locale", "en", "messages.csv")
    const actual = format.read(filename)
    mockFs.restore()
    expect(actual).toMatchSnapshot()
  })

  it("should write the same catalog as it was read", function () {
    const csv = fs
      .readFileSync(
        path.join(path.resolve(__dirname), "fixtures", "messages.csv")
      )
      .toString()

    mockFs({
      locale: {
        en: {
          "messages.csv": csv,
        },
      },
    })

    const filename = path.join("locale", "en", "messages.csv")
    const catalog = format.read(filename)
    format.write(filename, catalog)
    const actual = fs.readFileSync(filename).toString()
    mockFs.restore()
    expect(actual.replace(/(\r\n|\n|\r)/gm, "")).toEqual(
      csv.replace(/(\r\n|\n|\r)/gm, "")
    )
  })
})
