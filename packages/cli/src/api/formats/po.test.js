import fs from "fs"
import path from "path"
//import mockFs from "mock-fs"
import mockDate from "mockdate"
import { mockConsole } from "../../mocks"
import PO from "pofile"

import format from "./po"

const realFs = jest.requireActual('fs');

jest.mock('fs', () => {
  return {
    readFileSync: jest.fn(() => ""),
    writeFileSync: jest.fn(),
    existsSync: jest.fn(() => true)
  }
});

describe(
  "pofile format",
  function() {
    const dateHeaders = {
      "pot-creation-date": "2018-08-09",
      "po-revision-date": "2018-08-09"
    }

    afterEach(() => {
      fs.writeFileSync.mockReset();
      //fs.readF.mockReset();
    })

    it("should write catalog in pofile format", function() {
      mockDate.set("2018-08-27 10:00", 0)

      const filename = path.join("locale", "en", "messages.po")
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
          comments: [
            "Translator comment",
            "This one might come from developer"
          ],
          translation: "Support translator comments separately"
        },
        withContext: {
          context: "Description of the context",
          translation: "Context can be used to group related items together"
        },
        obsolete: {
          translation: "Obsolete message",
          obsolete: true
        },
        withFlags: {
          flags: ["fuzzy", "otherFlag"],
          translation: "Keeps any flags that are defined"
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

      format.write(filename, catalog, { language: "en", ...dateHeaders })
      const pofile = fs.writeFileSync.mock.calls;
      mockDate.reset()
      expect(pofile).toMatchSnapshot()
    })

    it("should read catalog in pofile format", function() {
      fs.readFileSync.mockImplementation((...args) => {
        return realFs.readFileSync(...args);
      });
      const filename = path.join(__dirname, "fixtures", "messages.po")
      const actual = format.read(filename)
      
      expect(actual).toMatchSnapshot()
    })

    it("should correct badly used comments", function() {
      const po = PO.parse(`
      #. First description
      #. Second comment
      #. Third comment
      msgid "withMultipleDescriptions"
      msgstr "Extra comments are separated from the first description line"

      # Translator comment
      #. Single description only
      #. Second description?
      msgid "withDescriptionAndComments"
      msgstr "Second description joins translator comments"
    `)

      fs.readFileSync.mockImplementation(() => po.toString());

      const actual = format.read("filename")
      expect(actual).toMatchSnapshot()
    })

    it("should throw away additional msgstr if present", function() {
      const po = PO.parse(`
        msgid "withMultipleTranslation"
        msgstr[0] "This is just fine"
        msgstr[1] "Throw away that one"
      `)
      
      fs.readFileSync.mockImplementation(() => po.toString());
      
      mockConsole(console => {
        const actual = format.read("filename")
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining("Multiple translations"),
          "withMultipleTranslation"
        )
        expect(actual).toMatchSnapshot()
      })
    })

    it("should write the same catalog as it was read", function() {
      const pofile = realFs
        .readFileSync(
          path.join(path.resolve(__dirname), "fixtures", "messages.po")
        )
        .toString()

      fs.readFileSync.mockImplementation(() => pofile)
      const catalog = format.read("filename")
      format.write("filename", catalog)

      expect(
        fs.writeFileSync.mock.calls[0][1].replace(/\s/g, '')
      ).toEqual(pofile.replace(/\s/g, ''))
    })
  }
)
