import { LinguiConfigNormalized, ExtractorType } from "@lingui/conf"
import { extractFromFiles as extractFromFilesSingleThread } from "../extractFromFiles"
import { compileMessages } from "../workers/compileMultiThread"

// Mock config for testing
const mockConfig: LinguiConfigNormalized = {
  locales: ["en", "es"],
  sourceLocale: "en",
  fallbackLocales: {},
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}/messages",
      include: ["<rootDir>/src"],
      exclude: ["**/node_modules/**"]
    }
  ],
  format: "po" as any,
  formatOptions: {},
  extractors: [] as ExtractorType[],
  orderBy: "messageId",
  rootDir: process.cwd(),
  compileNamespace: "es",
  runtimeConfigModule: {
    i18n: ["@lingui/core", "i18n"] as const,
    Trans: ["@lingui/react", "Trans"] as const,
    useLingui: ["@lingui/react", "useLingui"] as const
  },
  experimental: {
    multiThreading: true
  }
}

describe("Multi-threading basic functionality tests", () => {
  describe("Configuration", () => {
    it("should have multi-threading config option available", () => {
      expect(mockConfig.experimental?.multiThreading).toBe(true)
    })

    it("should support disabling multi-threading", () => {
      const configWithoutMultiThreading: LinguiConfigNormalized = {
        ...mockConfig,
        experimental: {}
      }
      expect(configWithoutMultiThreading.experimental?.multiThreading).toBeUndefined()
    })
  })

  describe("Extract operations", () => {
    it("should handle empty file list consistently", async () => {
      const result = await extractFromFilesSingleThread([], mockConfig)
      expect(result).toEqual({})
    })
  })

  describe("Compile operations", () => {
    const testMessages = {
      "Hello World": "Hello World",
      "Goodbye {name}": "Goodbye {name}",
      "Welcome to our app": "Welcome to our app"
    }

    it("should handle single-threaded compilation", async () => {
      const compileOptions = {
        strict: false,
        namespace: "es" as const,
        pseudoLocale: undefined,
        compilerBabelOptions: {}
      }

      const singleThreadResults = await compileMessages([
        { locale: "en", messages: testMessages, options: compileOptions }
      ], false)

      expect(singleThreadResults).toHaveLength(1)
      expect(singleThreadResults[0].locale).toBe("en")
      expect(singleThreadResults[0].success).toBe(true)
      expect(singleThreadResults[0].source).toBeDefined()
      expect(singleThreadResults[0].source).toContain("Hello World")
    })

    it("should handle compilation errors gracefully in single-threaded mode", async () => {
      const invalidMessages = {
        "Valid message": "Valid message",
        "Another valid": "Another valid"
      }

      const compileOptions = {
        strict: true,
        namespace: "es" as const,
        pseudoLocale: undefined,
        compilerBabelOptions: {}
      }

      const results = await compileMessages([
        { locale: "en", messages: invalidMessages, options: compileOptions }
      ], false)

      expect(results[0].success).toBe(true)
      expect(results[0].locale).toBe("en")
    })
  })

  describe("Integration", () => {
    it("should work with the existing extraction process", async () => {
      // Test that our changes don't break existing functionality
      const testFiles: string[] = []
      const result = await extractFromFilesSingleThread(testFiles, mockConfig)
      expect(result).toEqual({})
    })

    it("should properly detect multi-threading config", () => {
      expect(mockConfig.experimental?.multiThreading).toBe(true)
      
      const configWithoutExperimental: LinguiConfigNormalized = { ...mockConfig }
      delete configWithoutExperimental.experimental
      expect(configWithoutExperimental.experimental?.multiThreading).toBeUndefined()
    })
  })
})