import { command } from "../lingui-compile"
import { makeConfig } from "@lingui/conf"
import { getConsoleMockCalls, mockConsole } from "@lingui/jest-mocks"
import { createFixtures, readFsToListing } from "../tests"

describe("CLI Command: Compile", () => {
  function getConfig(rootDir: string, pseudoLocale?: string) {
    return makeConfig({
      locales: ["en", "pl"],
      sourceLocale: "en",
      pseudoLocale: pseudoLocale,
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
        })

        const config = getConfig(rootDir)

        await mockConsole(async (console) => {
          const result = await command(config, {
            allowEmpty: false,
          })
          const actualFiles = readFsToListing(config.rootDir)

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
          "messages.pot": `
msgid "Hello World"
msgstr ""
        `,
          "pl.po": ``,
        })

        const config = getConfig(rootDir)

        await mockConsole(async (console) => {
          const result = await command(config, {
            allowEmpty: false,
          })

          const actualFiles = readFsToListing(rootDir)

          expect({
            pl: actualFiles["pl.js"],
            en: actualFiles["en.js"],
          }).toMatchSnapshot()

          let log = getConsoleMockCalls(console.error)
          log = log.split("\n\n").sort().join("\n\n")

          expect(log).toMatchSnapshot()
          expect(result).toBeFalsy()
        })
      }
    )

    it("Should allow empty translation for pseudo locale", async () => {
      expect.assertions(4)

      const rootDir = await createFixtures({
        "en.po": `
msgid "Hello World"
msgstr "Hello World"
        `,
        "pl.po": `
msgid "Hello World"
msgstr ""
        `,
      })

      const config = getConfig(rootDir, "pl")

      await mockConsole(async (console) => {
        const result = await command(config, {
          allowEmpty: false,
        })
        const actualFiles = readFsToListing(config.rootDir)

        expect(actualFiles["pl.js"]).toBeTruthy()
        expect(actualFiles["en.js"]).toBeTruthy()

        const log = getConsoleMockCalls(console.error)
        expect(log).toBeUndefined()
        expect(result).toBeTruthy()
      })
    })

    it("Should show missing messages verbosely when verbose = true", async () => {
      expect.assertions(2)
      const rootDir = await createFixtures({
        "pl.po": `
msgid "Hello World"
msgstr ""

msgid "Test String"
msgstr ""
        `,
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

  describe("failOnCompileError = true", () => {
    it(
      "Should show error and stop compilation of catalog " +
        "if message has compilation error",
      async () => {
        expect.assertions(3)

        const rootDir = await createFixtures({
          "en.po": `
msgid "Hello World"
msgstr "Hello {hello}"
        `,
          "pl.po": `
msgid "Hello World"
msgstr "Hello {hello"
        `,
        })

        const config = getConfig(rootDir)

        await mockConsole(async (console) => {
          const result = await command(config, {
            failOnCompileError: true,
            allowEmpty: true,
          })
          const actualFiles = readFsToListing(config.rootDir)

          expect(actualFiles["pl.js"]).toBeFalsy()

          const log = getConsoleMockCalls(console.error)
          expect(log).toMatchSnapshot()
          expect(result).toBeFalsy()
        })
      }
    )
  })

  describe("merge", () => {
    function getConfig(rootDir: string, pseudoLocale?: string) {
      return makeConfig({
        locales: ["en", "pl"],
        sourceLocale: "en",
        pseudoLocale: pseudoLocale,
        rootDir,
        catalogs: [
          {
            path: "<rootDir>/{locale}/{name}",
            include: ["<rootDir>/components/{name}"],
          },
          {
            path: "<rootDir>/{locale}/{name}",
            include: ["<rootDir>/pages/{name}"],
          },
        ],
        catalogsMergePath: "<rootDir>/merged/{locale}",
      })
    }

    it("Should merge individual catalogs if catalogsMergePath specified in lingui config", async () => {
      expect.assertions(4)

      const rootDir = await createFixtures({
        "/components/foo.tsx": "",
        "/pages/bar.tsx": "",
        "/en/foo.tsx.po": `
msgid "Foo Hello World"
msgstr "Foo Hello World"
        `,
        "/en/bar.tsx.po": `
msgid "Bar Hello World"
msgstr "Bar Hello World"
        `,
        "/pl/foo.tsx.po": `
msgid "Foo Hello World"
msgstr "[PL] Foo Hello World"
        `,
        "/pl/bar.tsx.po": `
msgid "Bar Hello World"
msgstr "[PL] Bar Hello World"
        `,
      })

      const config = getConfig(rootDir)

      await mockConsole(async (console) => {
        const result = await command(config, {})

        const actualFiles = readFsToListing(config.rootDir)
        expect(actualFiles["merged/en.js"]).toMatchSnapshot()
        expect(actualFiles["merged/pl.js"]).toMatchSnapshot()

        const log = getConsoleMockCalls(console.error)
        expect(log).toBeUndefined()
        expect(result).toBeTruthy()
      })
    })
  })

  describe("experimental multithread", () => {
    function getConfigWithMultithread(
      rootDir: string,
      multiThread: boolean = true
    ) {
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
        experimental: {
          multiThread,
        },
      })
    }

    it("Should compile catalogs successfully with multithread enabled", async () => {
      const rootDir = await createFixtures({
        "en.po": `
msgid "Hello World"
msgstr "Hello World"

msgid "Welcome {name}"
msgstr "Welcome {name}"
        `,
        "pl.po": `
msgid "Hello World"
msgstr "Cześć świat"

msgid "Welcome {name}"
msgstr "Witaj {name}"
        `,
      })

      const config = getConfigWithMultithread(rootDir, true)

      await mockConsole(async (console) => {
        const result = await command(config, {})
        const actualFiles = readFsToListing(config.rootDir)

        expect(actualFiles["en.js"]).toBeTruthy()
        expect(actualFiles["pl.js"]).toBeTruthy()

        const log = getConsoleMockCalls(console.error)
        expect(log).toBeUndefined()
        expect(result).toBeTruthy()
      })
    })

    it("Should produce identical results with multithread enabled and disabled", async () => {
      const rootDir = await createFixtures({
        "en.po": `
msgid "Hello World"
msgstr "Hello World"

msgid "Complex message"
msgstr "{count, plural, one {# item} other {# items}}"

msgid "Select message"
msgstr "{gender, select, male {He} female {She} other {They}}"
        `,
        "pl.po": `
msgid "Hello World"
msgstr "Cześć świat"

msgid "Complex message"
msgstr "{count, plural, one {# element} other {# elementów}}"

msgid "Select message"
msgstr "{gender, select, male {On} female {Ona} other {Oni}}"
        `,
      })

      // Compile with multithread disabled
      const configSingleThread = getConfigWithMultithread(rootDir, false)
      await mockConsole(async () => {
        await command(configSingleThread, {})
      })
      const singleThreadFiles = readFsToListing(rootDir)

      // Clean up for multithread test
      await createFixtures({
        "en.po": `
msgid "Hello World"
msgstr "Hello World"

msgid "Complex message"
msgstr "{count, plural, one {# item} other {# items}}"

msgid "Select message"
msgstr "{gender, select, male {He} female {She} other {They}}"
        `,
        "pl.po": `
msgid "Hello World"
msgstr "Cześć świat"

msgid "Complex message"
msgstr "{count, plural, one {# element} other {# elementów}}"

msgid "Select message"
msgstr "{gender, select, male {On} female {Ona} other {Oni}}"
        `,
      })

      // Compile with multithread enabled
      const configMultiThread = getConfigWithMultithread(rootDir, true)
      await mockConsole(async () => {
        await command(configMultiThread, {})
      })
      const multiThreadFiles = readFsToListing(rootDir)

      // Compare the results
      expect(singleThreadFiles["en.js"]).toEqual(multiThreadFiles["en.js"])
      expect(singleThreadFiles["pl.js"]).toEqual(multiThreadFiles["pl.js"])
    })

    it("Should handle compilation errors correctly with multithread", async () => {
      const rootDir = await createFixtures({
        "en.po": `
msgid "Valid message"
msgstr "Valid message"

msgid "Invalid syntax"
msgstr "{plural,  }"
        `,
      })

      const config = getConfigWithMultithread(rootDir, true)

      await mockConsole(async (console) => {
        const result = await command(config, {
          failOnCompileError: true,
        })

        const actualFiles = readFsToListing(config.rootDir)
        expect(actualFiles["en.js"]).toBeFalsy()

        const log = getConsoleMockCalls(console.error)
        expect(log).toContain("invalid syntax at line")
        expect(result).toBeFalsy()
      })
    })
  })
})
