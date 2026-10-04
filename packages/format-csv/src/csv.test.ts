import fs from "fs"
import path from "path"

import { formatter as createFormatter } from "./csv"

describe("csv format", () => {
  const format = createFormatter()

  it("should write catalog in csv format", () => {
    const catalog = {
      static: {
        translation: "Static message",
      },
      stringWithUnpairedDoubleQuote: {
        translation: `Camecho 9" LCD Monitor HD TFT Color Screen, 2 Video Input/HDMI/VGA, Support Car Backup`,
      },
      veryLongString: {
        translation: `One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin. He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections. The bedding was hardly able to cover it and seemed ready to slide off any moment. His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked. ""What's happened to me?"" he thought. It wasn't a dream. His room, a proper human`,
      },
    }

    const csv = format.serialize(catalog, {} as any)
    expect(csv).toMatchSnapshot()
  })

  it("should read catalog in csv format", () => {
    const csv = fs
      .readFileSync(path.join(__dirname, "fixtures/messages.csv"))
      .toString()

    const actual = format.parse(csv, {} as any)
    expect(actual).toMatchSnapshot()
  })

  describe("catalog ending with a line break", () => {
    const parsed = (translation: string) => ({
      translation,
      obsolete: false,
      message: null,
      origin: [],
    })

    it.each([
      [
        "LF",
        "static,Static message\nempty,\n",
        { static: parsed("Static message"), empty: parsed("") },
      ],
      [
        "CRLF",
        "static,Static message\r\nempty,\r\n",
        { static: parsed("Static message"), empty: parsed("") },
      ],
      [
        "LF, single row",
        "static,Static message\n",
        { static: parsed("Static message") },
      ],
    ])("should read the catalog (%s)", (_, csv, expected) => {
      expect(format.parse(csv, {} as any)).toEqual(expected)
    })

    it("should not add an empty id to a long catalog", () => {
      // Delimiter detection only looks at the first 10 rows, so here the
      // empty row doesn't throw and would end up as a message with id "".
      const ids = Array.from({ length: 12 }, (_, i) => `id${i}`)
      const csv = ids.map((id) => `${id},Translation\n`).join("")

      expect(Object.keys(format.parse(csv, {} as any))).toEqual(ids)
    })

    it("should read back a written catalog", () => {
      const catalog = {
        static: { translation: "Static message" },
        withComma: { translation: "One, two" },
      }
      const csv = format.serialize(catalog, {} as any) + "\r\n"

      expect(format.parse(csv, {} as any)).toEqual({
        static: parsed("Static message"),
        withComma: parsed("One, two"),
      })
    })
  })

  it("should throw on malformed csv", () => {
    expect(() =>
      format.parse('static,"Static message\nother,Other', {} as any),
    ).toThrow("MissingQuotes")
  })
})
