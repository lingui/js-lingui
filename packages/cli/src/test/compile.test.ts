import { command } from "../lingui-compile"
import { getConfig, LinguiConfig, makeConfig } from "@lingui/conf"
import { getConsoleMockCalls, mockConsole } from "@lingui/jest-mocks"
import { createFixtures, readFsToListing } from "../tests"

describe("CLI Command: Compile", () => {
  function getTestConfig(rootDir: string, pseudoLocale?: string) {
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
    it("Should show error and stop compilation of catalog if message doesnt have a translation (no template)", async () => {
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

      const config = getTestConfig(rootDir)

      await mockConsole(async (console) => {
        const result = await command(config, {
          allowEmpty: false,
          workersOptions: {
            poolSize: 0,
          },
        })
        const actualFiles = readFsToListing(config.rootDir)

        expect(actualFiles["pl.js"]).toBeFalsy()
        expect(actualFiles["en.js"]).toBeTruthy()

        const log = getConsoleMockCalls(console.error)
        expect(log).toMatchSnapshot()
        expect(result).toBeFalsy()
      })
    })

    it("Should show error and stop compilation of catalog if message doesnt have a translation (with template)", async () => {
      expect.assertions(3)
      const rootDir = await createFixtures({
        "messages.pot": `
msgid "Hello World"
msgstr ""
        `,
        "pl.po": ``,
      })

      const config = getTestConfig(rootDir)

      await mockConsole(async (console) => {
        const result = await command(config, {
          allowEmpty: false,
          workersOptions: {
            poolSize: 0,
          },
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
    })

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

      const config = getTestConfig(rootDir, "pl")

      await mockConsole(async (console) => {
        const result = await command(config, {
          allowEmpty: false,
          workersOptions: {
            poolSize: 0,
          },
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

      const config = getTestConfig(rootDir)

      await mockConsole(async (console) => {
        const result = await command(config, {
          allowEmpty: false,
          verbose: true,
          workersOptions: {
            poolSize: 0,
          },
        })

        const log = getConsoleMockCalls(console.error)
        expect(log).toMatchSnapshot()
        expect(result).toBeFalsy()
      })
    })
  })

  describe("failOnCompileError", () => {
    it("Should show error and stop compilation of catalog if message has compilation error when failOnCompileError = true", async () => {
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

      const config = getTestConfig(rootDir)

      await mockConsole(async (console) => {
        const result = await command(config, {
          failOnCompileError: true,
          allowEmpty: true,
          workersOptions: {
            poolSize: 0,
          },
        })
        const actualFiles = readFsToListing(config.rootDir)

        expect(actualFiles["pl.js"]).toBeFalsy()

        const log = getConsoleMockCalls(console.error)
        expect(log).toMatchSnapshot()
        expect(result).toBeFalsy()
      })
    })

    it('Should show error and continue compilation of catalog if message has compilation error when failOnCompileError = false"', async () => {
      expect.assertions(3)

      const rootDir = await createFixtures({
        "en.po": `
msgid "Hello World"
msgstr "Hello {hello}"

msgid "Hello User"
msgstr "Hello User"
        `,
        "pl.po": `
msgid "Hello World"
msgstr "Hello {hello"

msgid "Hello User"
msgstr "Hello User"
        `,
      })

      const config = getTestConfig(rootDir)

      await mockConsole(async (console) => {
        const result = await command(config, {
          failOnCompileError: false,
          allowEmpty: true,
          workersOptions: {
            poolSize: 0,
          },
        })
        const actualFiles = readFsToListing(config.rootDir)

        expect(actualFiles["pl.js"]).toMatchSnapshot()

        const log = getConsoleMockCalls(console.error)
        expect(log).toMatchSnapshot()
        expect(result).toBeTruthy()
      })
    })
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
        const result = await command(config, {
          workersOptions: {
            poolSize: 0,
          },
        })

        const actualFiles = readFsToListing(config.rootDir)
        expect(actualFiles["merged/en.js"]).toMatchSnapshot()
        expect(actualFiles["merged/pl.js"]).toMatchSnapshot()

        const log = getConsoleMockCalls(console.error)
        expect(log).toBeUndefined()
        expect(result).toBeTruthy()
      })
    })
  })

  describe("using worker pool", () => {
    function getConfigText() {
      const config: LinguiConfig = {
        locales: ["en", "pl"],
        sourceLocale: "en",
        format: "po",
        catalogs: [
          {
            path: "<rootDir>/{locale}",
            include: ["<rootDir>"],
            exclude: [],
          },
        ],
      }

      return `export default ${JSON.stringify(config)}`
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
        "lingui.config.ts": getConfigText(),
      })

      const config = getConfig({ cwd: rootDir })

      await mockConsole(async (console) => {
        const result = await command(config, {
          workersOptions: { poolSize: 2 },
        })
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
        "lingui.config.ts": getConfigText(),
      })

      // Compile with multithread disabled
      await mockConsole(async () => {
        await command(getConfig({ cwd: rootDir }), {
          workersOptions: {
            poolSize: 0,
          },
        })
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
        "lingui.config.ts": getConfigText(),
      })

      // Compile with multithread enabled
      await mockConsole(async () => {
        await command(getConfig({ cwd: rootDir }), {
          workersOptions: {
            poolSize: 2,
          },
        })
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
        "lingui.config.ts": getConfigText(),
      })

      await mockConsole(async (console) => {
        const result = await command(getConfig({ cwd: rootDir }), {
          failOnCompileError: true,
          workersOptions: {
            poolSize: 2,
          },
        })

        const actualFiles = readFsToListing(rootDir)
        expect(actualFiles["en.js"]).toBeFalsy()

        const log = getConsoleMockCalls(console.error)
        expect(log).toContain("invalid syntax at line")
        expect(result).toBeFalsy()
      })
    })
  })

  describe("lintDirective", () => {
    it("Should use custom lint directive in compiled files", async () => {
      const rootDir = await createFixtures({
        "en.po": `
msgid "Hello World"
msgstr "Hello World"
        `,
        "pl.po": `
msgid "Hello World"
msgstr "Witaj świecie"
        `,
      })

      const config = getTestConfig(rootDir)

      await mockConsole(async () => {
        const result = await command(config, {
          lintDirective: "biome-ignore lint: auto-generated",
          workersOptions: {
            poolSize: 0,
          },
        })

        const actualFiles = readFsToListing(rootDir)

        expect(actualFiles["en.js"]).toContain(
          "/*biome-ignore lint: auto-generated*/"
        )
        expect(actualFiles["pl.js"]).toContain(
          "/*biome-ignore lint: auto-generated*/"
        )
        expect(actualFiles["en.js"]).not.toContain("eslint-disable")
        expect(actualFiles["pl.js"]).not.toContain("eslint-disable")
        expect(result).toBeTruthy()
      })
    })

    it("Should use oxlint-disable directive", async () => {
      const rootDir = await createFixtures({
        "en.po": `
msgid "Test"
msgstr "Test"
        `,
        "pl.po": `
msgid "Test"
msgstr "Test PL"
        `,
      })

      const config = getTestConfig(rootDir)

      await mockConsole(async () => {
        const result = await command(config, {
          lintDirective: "oxlint-disable",
          workersOptions: {
            poolSize: 0,
          },
        })

        const actualFiles = readFsToListing(rootDir)

        expect(actualFiles["en.js"]).toContain("/*oxlint-disable*/")
        expect(actualFiles["en.js"]).not.toContain("eslint-disable")
        expect(result).toBeTruthy()
      })
    })
  })
})
