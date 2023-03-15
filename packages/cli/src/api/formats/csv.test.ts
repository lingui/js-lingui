import fs from "fs"
import path from "path"

import createFormatter from "./csv"

describe("csv format", () => {
  const format = createFormatter()

  it("should write catalog in csv format", async () => {
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

    const csv = await format.serialize(catalog, {} as any)
    expect(csv).toMatchSnapshot()
  })

  it("should read catalog in csv format", async () => {
    const csv = fs
      .readFileSync(path.join(__dirname, "fixtures/messages.csv"))
      .toString()

    const actual = await format.parse(csv, {} as any)
    expect(actual).toMatchSnapshot()
  })
})
