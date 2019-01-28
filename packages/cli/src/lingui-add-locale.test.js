import mockFs from "mock-fs"

import { mockConsole, mockConfig } from "./mocks"
import command from "./lingui-add-locale"

describe.skip(
  "mock-fs doesn't work with Node.js +10",
  "lingui add-locale",
  function() {
    afterEach(mockFs.restore)

    it("should fail on unknown locale", function() {
      const config = mockConfig()

      mockConsole(console => {
        command(config, ["xyz"])
        expect(console.log).toBeCalledWith(
          expect.stringContaining("Unknown locale:")
        )
        expect(console.log).toBeCalledWith(expect.stringContaining("xyz"))
      })
    })

    it("should add single locale", function() {
      const config = mockConfig()

      mockFs({
        [config.localeDir]: mockFs.directory()
      })

      mockConsole(console => {
        command(config, ["en"])
        expect(console.log.mock.calls[0]).toEqual([
          expect.stringContaining("Added locale")
        ])
        expect(console.log.mock.calls[0]).toEqual([
          expect.stringContaining("en")
        ])
        expect(console.log.mock.calls[2]).toEqual([
          expect.stringContaining("extract")
        ])
      })
    })

    it("should add multiple locales", function() {
      const config = mockConfig()

      mockFs({
        [config.localeDir]: {
          fr: {
            "messages.json": mockFs.file()
          }
        }
      })

      mockConsole(console => {
        command(config, ["en", "fr"])
        // en doesn't exist - added
        expect(console.log.mock.calls[0]).toEqual([
          expect.stringContaining("Added locale")
        ])
        expect(console.log.mock.calls[0]).toEqual([
          expect.stringContaining("en")
        ])

        // fr already exists
        expect(console.log.mock.calls[1]).toEqual([
          expect.stringContaining("already exists")
        ])
        expect(console.log.mock.calls[1]).toEqual([
          expect.stringContaining("fr")
        ])

        // show help what to do next
        expect(console.log.mock.calls[3]).toEqual([
          expect.stringContaining("extract")
        ])
      })
    })
  }
)
