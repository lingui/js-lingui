import linguiMacroPlugin, { LinguiPluginOpts } from "../src"
import { transformFileSync, transformSync, TransformOptions } from "@babel/core"
// @ts-expect-error need to update to v3
import prettier from "prettier"
import path from "path"
import fs from "fs"
import linguiMacro from "../src/macro"

export type TestCase = TestCaseInline | TestCaseFixture

type TestCaseInline = {
  /**
   * Input code for testing
   */
  code: string
  /**
   * If not set, snapshot testing will be used
   */
  expected?: string
} & TestCaseCommon

type TestCaseFixture = {
  filename: string
} & TestCaseCommon

type TestCaseCommon = {
  name?: string
  production?: boolean
  useTypescriptPreset?: boolean
  useReactCompiler?: boolean
  macroOpts?: LinguiPluginOpts
  only?: boolean
  skip?: boolean
  /**
   * Will not execute test using babel-macro-plugin
   */
  skipBabelMacroTest?: boolean
}

export type MacroTesterOptions = {
  cases: TestCase[]
}

export function macroTester(opts: MacroTesterOptions) {
  process.env.LINGUI_CONFIG = path.join(__dirname, "lingui.config.js")

  const clean = (value: string) =>
    prettier.format(value, { parser: "babel-ts" }).replace(/\n+/, "\n")

  opts.cases.forEach((testCase, index) => {
    const {
      name,
      production,
      only,
      skip,
      useTypescriptPreset,
      useReactCompiler,
      macroOpts,
    } = testCase

    let group: typeof test.only = test
    if (only) group = test.only
    if (skip) group = test.skip
    const groupName = name != null ? name : `#${index + 1}`

    group(groupName, () => {
      const originalEnv = process.env.NODE_ENV

      if (production) {
        process.env.NODE_ENV = "production"
      }

      try {
        if ("filename" in testCase) {
          const inputPath = path.relative(
            process.cwd(),
            path.join(__dirname, "fixtures", testCase.filename)
          )
          const expectedPath = inputPath.replace(/\.js$/, ".expected.js")
          const expected = fs
            .readFileSync(expectedPath, "utf8")
            .replace(/\r/g, "")
            .trim()

          const actualPlugin = transformFileSync(inputPath, {
            ...getDefaultBabelOptions(
              "plugin",
              macroOpts,
              useTypescriptPreset,
              useReactCompiler
            ),
            cwd: path.dirname(inputPath),
          })
            .code.replace(/\r/g, "")
            .trim()

          const actualMacro = transformFileSync(inputPath, {
            ...getDefaultBabelOptions(
              "plugin",
              macroOpts,
              useTypescriptPreset,
              useReactCompiler
            ),
            cwd: path.dirname(inputPath),
          })
            .code.replace(/\r/g, "")
            .trim()

          // output from plugin transformation should be the same to macro transformation
          expect(actualPlugin).toBe(actualMacro)

          expect(clean(actualPlugin)).toEqual(clean(expected))
        } else {
          const actualPlugin = transformSync(
            testCase.code,
            getDefaultBabelOptions(
              "plugin",
              macroOpts,
              useTypescriptPreset,
              useReactCompiler
            )
          ).code.trim()

          if (!testCase.skipBabelMacroTest) {
            const actualMacro = transformSync(
              testCase.code,
              getDefaultBabelOptions(
                "macro",
                macroOpts,
                useTypescriptPreset,
                useReactCompiler
              )
            ).code.trim()

            // output from plugin transformation should be the same to macro transformation
            expect(actualPlugin).toBe(actualMacro)
          }

          if (testCase.expected) {
            expect(clean(actualPlugin)).toEqual(clean(testCase.expected))
          } else {
            expect(
              clean(testCase.code) + "\n↓ ↓ ↓ ↓ ↓ ↓\n\n" + clean(actualPlugin)
            ).toMatchSnapshot()
          }
        }
      } finally {
        process.env.LINGUI_CONFIG = ""
        process.env.NODE_ENV = originalEnv
      }
    })
  })
}

export const getDefaultBabelOptions = (
  transformType: "plugin" | "macro" = "plugin",
  macroOpts: LinguiPluginOpts = {},
  isTs = false,
  useReactCompiler = false
): TransformOptions => {
  return {
    filename: "<filename>" + (isTs ? ".tsx" : "jsx"),
    configFile: false,
    babelrc: false,
    presets: [...(isTs ? ["@babel/preset-typescript"] : [])],
    plugins: [
      "@babel/plugin-syntax-jsx",
      transformType === "plugin"
        ? [linguiMacroPlugin, macroOpts]
        : [
            "macros",
            {
              lingui: macroOpts,
              // macro plugin uses package `resolve` to find a path of macro file
              // this will not follow jest pathMapping and will resolve path from ./build
              // instead of ./src which makes testing & developing hard.
              // here we override resolve and provide correct path for testing
              require: () => linguiMacro,
            },
          ],

      ...(useReactCompiler
        ? [
            [
              "babel-plugin-react-compiler",
              {
                panicThreshold: "critical_errors",
              },
            ],
          ]
        : []),
    ],
  }
}
