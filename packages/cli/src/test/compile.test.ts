import { describe, expect, it } from "vitest";
import { command } from "../lingui-compile"
import { makeConfig } from "@lingui/conf"
import { getConsoleMockCalls, mockConsole } from "@lingui/jest-mocks"
import { createFixtures, readFsToJson } from "../tests"

describe("CLI Command: Compile", () => {
  describe("Merge Catalogs", () => {
    // todo
  })

  function getConfig(rootDir: string) {
    return makeConfig({
      locales: ["en", "pl"],
      sourceLocale: "en",
      rootDir: rootDir,
      catalogs: [
        {
          path: "<rootDir>/{locale}",
          include: ["<rootDir>"],
          exclude: [],
        },
      ],
    })
  }

  describe("allowEmpty = false", () => {
    it(
      "Should show error and stop compilation of catalog " +
        "if message doesnt have a translation (no template)",
      async () => {
        expect.assertions(4)

        const rootDir = await createFixtures({
          "/test": {
            "en.po": `
msgid "Hello World"
msgstr "Hello World"
        `,
            "pl.po": `
msgid "Hello World"
msgstr "Cześć świat"

msgid "Test String"
msgstr ""
        `,
          },
        })

        const config = getConfig(rootDir)

        await mockConsole(async (console) => {
          const result = await command(config, {
            allowEmpty: false,
          })
          const actualFiles = readFsToJson(config.rootDir)

          expect(actualFiles["pl.js"]).toBeFalsy()
          expect(actualFiles["en.js"]).toBeTruthy()

          const log = getConsoleMockCalls(console.error)
          expect(log).toMatchSnapshot()
          expect(result).toBeFalsy()
        })
      }
    )

    it(
      "Should show error and stop compilation of catalog " +
        "if message doesnt have a translation (with template)",
      async () => {
        expect.assertions(3)
        const rootDir = await createFixtures({
          "/test": {
            "messages.pot": `
msgid "Hello World"
msgstr ""
        `,
            "pl.po": ``,
          },
        })

        const config = getConfig(rootDir)

        await mockConsole(async (console) => {
          const result = await command(config, {
            allowEmpty: false,
          })

          const actualFiles = readFsToJson(rootDir)

          expect({
            pl: actualFiles["pl.js"],
            en: actualFiles["en.js"],
          }).toMatchSnapshot()

          const log = getConsoleMockCalls(console.error)
          expect(log).toMatchSnapshot()
          expect(result).toBeFalsy()
        })
      }
    )

    it("Should show missing messages verbosely when verbose = true", async () => {
      expect.assertions(2)
      const rootDir = await createFixtures({
        "/test": {
          "pl.po": `
msgid "Hello World"
msgstr ""

msgid "Test String"
msgstr ""
        `,
        },
      })

      const config = getConfig(rootDir)

      await mockConsole(async (console) => {
        const result = await command(config, {
          allowEmpty: false,
          verbose: true,
        })

        const log = getConsoleMockCalls(console.error)
        expect(log).toMatchSnapshot()
        expect(result).toBeFalsy()
      })
    })
  })
})
