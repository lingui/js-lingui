import { formatter as createFormatter } from "./xliff"
import { CatalogType } from "@lingui/conf"

describe("xliff format", () => {
  it("should write catalog in pofile format", async () => {
    const format = createFormatter({ origins: true })

    const catalog: CatalogType = {
      static: {
        translation: "Static message",
      },
      withOrigin: {
        translation: "Message with origin",
        origin: [["src/App.js", 4]],
      },
      withContext: {
        translation: "Message with context",
        context: "my context",
      },
      Dgzql1: {
        message: "with generated id",
        translation: "",
        context: "my context",
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
      // obsolete: {
      //   translation: "Obsolete message",
      //   obsolete: true,
      // },
      // withFlags: {
      //   flags: ["fuzzy", "otherFlag"],
      //   translation: "Keeps any flags that are defined",
      // },
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

      stringWithPlaceholders: {
        message: "Hello {world}",
        translation: null,
      },

      stringWithJsxPlaceholders: {
        message: "Hello <0>String</0>",
        translation: null,
      },
    }

    const actual = format.serialize(catalog, {
      locale: "en",
      existing: null,
    })
    expect(actual).toMatchSnapshot()
  })

  it.todo(
    "should read catalog in xliff format" /*, () => {
    const format = createFormatter()

    const pofile = fs
      .readFileSync(path.join(__dirname, "fixtures/messages.po"))
      .toString()

    const actual = format.parse(pofile)
    expect(actual).toMatchSnapshot()
  }*/
  )

  it.todo("should preserve attributes stored on trans unit")
  it.todo("should preserve children in trans unit")

  it.todo("should not include origins if origins option is false")

  it.todo("should not include lineNumbers if lineNumbers option is false")
})
