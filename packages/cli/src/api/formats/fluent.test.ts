import fs from "fs"
import path from "path"
import mockFs from "mock-fs"
import { mockConsole } from "@lingui/jest-mocks"

import format from "./fluent"

describe("fluent format", function() {
  afterEach(() => {
    mockFs.restore()
  })

  it("should write catalog in fluent format", function() {
    mockFs({
      locale: {
        en: mockFs.directory()
      }
    })

    const filename = path.join("locale", "en", "messages.flt")
    const catalog = {
      static: {
        translation: "Static message"
      },
      withOrigin: {
        translation: "Message with origin",
        origin: [["src/App.js", 4]]
      },
      withMultipleOrigins: {
        translation: "Message with multiple origin",
        origin: [["src/App.js", 4], ["src/Component.js", 2]]
      },
      withDescription: {
        translation: "Message with description",
        description: "Description is comment from developers to translators"
      },
      withComments: {
        comments: ["Translator comment", "This one might come from developer"],
        translation: "Support translator comments separately"
      },
      obsolete: {
        translation: "Obsolete message",
        comments: ["Old message"],
        obsolete: true
      },
      withFlags: {
        flags: ["fuzzy", "otherFlag"],
        translation: "Keeps any flags that are defined"
      },
      multilineString: {
        translation:
          "One morning, when Gregor Samsa woke from troubled dreams, he found himself" +
          "\ntransformed in his bed into a horrible vermin. He lay on his armour-like" +
          "\nback, and if he lifted his head a little he could see his brown belly," +
          "\nslightly domed and divided by arches into stiff sections. The bedding was" +
          "\nhardly able to cover it and seemed ready to slide off any moment. His many" +
          "\nlegs, pitifully thin compared with the size of the rest of him, waved about" +
          "\nhelplessly as he looked. \"What's happened to me?\" he thought. It wasn't" +
          "\na dream. His room, a proper human" +
          "\n  Two spaces before" +
          "\n     Four spaces before"
      }
    }

    format.write(filename, catalog)
    const fltfile = fs.readFileSync(filename).toString()
    expect(fltfile).toMatchSnapshot()
  })

  it("should read catalog in fluent format", function() {
    const flt = fs
      .readFileSync(
        path.join(path.resolve(__dirname), "fixtures", "messages.flt")
      )
      .toString()

    mockFs({
      locale: {
        en: {
          "messages.flt": flt
        }
      }
    })

    const filename = path.join("locale", "en", "messages.flt")
    const actual = format.read(filename)
    expect(actual).toMatchSnapshot()
  })

  it("should write the same catalog as it was read", function() {
    const flt = fs
      .readFileSync(
        path.join(path.resolve(__dirname), "fixtures", "messages.flt")
      )
      .toString()

    mockFs({
      locale: {
        en: {
          "messages.flt": flt
        }
      }
    })

    const filename = path.join("locale", "en", "messages.flt")
    const catalog = format.read(filename)
    format.write(filename, catalog)
    const actual = fs.readFileSync(filename).toString()
    expect(actual).toEqual(flt)
  })
})
