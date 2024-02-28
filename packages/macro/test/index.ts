import fs from "fs"
import path from "path"
import {
  PluginObj,
  transformFileSync,
  TransformOptions,
  transformSync,
} from "@babel/core"
import prettier from "prettier"
import linguiMacroPlugin, { LinguiPluginOpts } from "../src/plugin"
import {
  JSXAttribute,
  jsxExpressionContainer,
  JSXIdentifier,
  stringLiteral,
} from "@babel/types"
import { NodePath } from "@babel/traverse"

export type TestCase = {
  name?: string
  input?: string
  expected?: string
  filename?: string
  production?: boolean
  useTypescriptPreset?: boolean
  macroOpts?: LinguiPluginOpts
  /** Remove hash id from snapshot for more stable testing */
  stripId?: boolean
  only?: boolean
  skip?: boolean
}

const testCases: Record<string, TestCase[]> = {
  "js-t": require("./js-t").default,
  "js-plural": require("./js-plural").default,
  "js-select": require("./js-select").default,
  "js-selectOrdinal": require("./js-selectOrdinal").default,
  "jsx-trans": require("./jsx-trans").default,
  "jsx-select": require("./jsx-select").default,
  "jsx-plural": require("./jsx-plural").default,
  "jsx-selectOrdinal": require("./jsx-selectOrdinal").default,
  "js-defineMessage": require("./js-defineMessage").default,
  "js-useLingui": require("./js-useLingui").default,
}

function stripIdPlugin(): PluginObj {
  return {
    visitor: {
      JSXOpeningElement: (path) => {
        const idAttr = path
          .get("attributes")
          .find(
            (attr) =>
              attr.isJSXAttribute() &&
              (attr.node.name as JSXIdentifier).name === "id"
          ) as NodePath<JSXAttribute>

        if (idAttr) {
          idAttr
            .get("value")
            .replaceWith(jsxExpressionContainer(stringLiteral("<stripped>")))
        }
      },
    },
  }
}

describe("macro", function () {
  process.env.LINGUI_CONFIG = path.join(__dirname, "lingui.config.js")

  const getDefaultBabelOptions = (
    macroOpts: LinguiPluginOpts = {},
    isTs: boolean = false,
    stripId = false,
    transformType: "plugin" | "macro" = "plugin"
  ): TransformOptions => {
    return {
      filename: "<filename>" + (isTs ? ".tsx" : "jsx"),
      configFile: false,
      babelrc: false,
      presets: [],
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
                resolvePath: (source: string) => require.resolve(source),
              },
            ],

        ...(stripId ? [stripIdPlugin] : []),
      ],
    }
  }

  // return function, so we can test exceptions
  const transformCode = (code: string) => () => {
    try {
      return transformSync(code, getDefaultBabelOptions()).code.trim()
    } catch (e) {
      ;(e as Error).message = (e as Error).message.replace(/([^:]*:){2}/, "")
      throw e
    }
  }

  Object.keys(testCases).forEach((suiteName) => {
    describe(`${suiteName}`, () => {
      const cases = testCases[suiteName]

      const clean = (value: string) =>
        prettier.format(value, { parser: "babel-ts" }).replace(/\n+/, "\n")

      cases.forEach(
        (
          {
            name,
            input,
            expected,
            filename,
            production,
            useTypescriptPreset,
            only,
            skip,
            macroOpts,
            stripId,
          },
          index
        ) => {
          let group = describe
          if (only) group = describe.only
          if (skip) group = describe.skip
          group(name != null ? name : `${suiteName} #${index + 1}`, () => {
            ;(["plugin", "macro"] as const).forEach((transformType) => {
              it(transformType, () => {
                const babelOptions = getDefaultBabelOptions(
                  macroOpts,
                  useTypescriptPreset,
                  stripId,
                  transformType
                )
                expect(input || filename).toBeDefined()

                const originalEnv = process.env.NODE_ENV

                if (production) {
                  process.env.NODE_ENV = "production"
                }

                if (useTypescriptPreset) {
                  babelOptions.presets.push("@babel/preset-typescript")
                }

                try {
                  if (filename) {
                    const inputPath = path.relative(
                      process.cwd(),
                      path.join(__dirname, "fixtures", filename)
                    )
                    const expectedPath = inputPath.replace(
                      /\.js$/,
                      ".expected.js"
                    )
                    const expected = fs
                      .readFileSync(expectedPath, "utf8")
                      .replace(/\r/g, "")
                      .trim()

                    const _babelOptions = {
                      ...babelOptions,
                      cwd: path.dirname(inputPath),
                    }

                    const actual = transformFileSync(inputPath, _babelOptions)
                      .code.replace(/\r/g, "")
                      .trim()
                    expect(clean(actual)).toEqual(clean(expected))
                  } else {
                    const actual = transformSync(
                      input,
                      babelOptions
                    ).code.trim()

                    expect(clean(actual)).toEqual(clean(expected))
                  }
                } finally {
                  process.env.LINGUI_CONFIG = ""
                  process.env.NODE_ENV = originalEnv
                }
              })
            })
          })
        }
      )
    })
  })

  it("Should throw error if used without babel-macro-plugin", async () => {
    await expect(async () => {
      const mod = await import("../src/index")
      return (mod as unknown as typeof import("@lingui/macro")).Trans
    }).rejects.toThrow('The macro you imported from "@lingui/macro"')
  })

  describe.skip("validation", function () {
    describe("plural/select/selectordinal", function () {
      it("value is missing", function () {
        const code = `
        plural({
          0: "No books",
          1: "1 book",
          other: "# books"
        });`
        expect(transformCode(code)).toThrowErrorMatchingSnapshot()
      })

      it("offset must be number or string, not variable", function () {
        const code = `
        plural({
          offset: count,
          0: "No books",
          1: "1 book",
          other: "# books"
        });`
        expect(transformCode(code)).toThrowErrorMatchingSnapshot()
      })

      it("plural forms are missing", function () {
        const plural = `
        plural({
          value: count
        });`
        expect(transformCode(plural)).toThrowErrorMatchingSnapshot()

        const select = `
        plural({
          value: count
        });`
        expect(transformCode(select)).toThrowErrorMatchingSnapshot()

        const selectOrdinal = `
        plural({
          value: count
        });`
        expect(transformCode(selectOrdinal)).toThrowErrorMatchingSnapshot()
      })

      it("plural forms cannot be variables", function () {
        const code = `
        plural({
          value: count,
          [one]: "Book"
        });`
        expect(transformCode(code)).toThrowErrorMatchingSnapshot()
      })

      it("plural rules must be valid", function () {
        const plural = `
        plural({
          value: count,
          one: "Book",
          three: "Invalid",
          other: "Books"
        });`
        expect(transformCode(plural)).toThrowErrorMatchingSnapshot()

        const selectOrdinal = `
        selectOrdinal({
          value: count,
          one: "st",
          three: "Invalid",
          other: "rd"
        });`
        expect(transformCode(selectOrdinal)).toThrowErrorMatchingSnapshot()
      })
    })

    describe("formats", function () {
      it("value is missing", function () {
        expect(transformCode("date();")).toThrowErrorMatchingSnapshot()
      })

      it("format must be either string, variable or object with custom format", function () {
        expect(transformCode('number(value, "currency");')).not.toThrow()
        expect(transformCode("number(value, currency);")).not.toThrow()
        expect(transformCode("number(value, { digits: 4 });")).not.toThrow()
        expect(
          transformCode("number(value, 42);")
        ).toThrowErrorMatchingSnapshot()
      })
    })

    describe("Plural/Select/SelectOrdinal", function () {
      it("children are not allowed", function () {
        expect(
          transformCode("<Plural>Not allowed</Plural>")
        ).toThrowErrorMatchingSnapshot()
        expect(
          transformCode("<Select>Not allowed</Select>")
        ).toThrowErrorMatchingSnapshot()
        expect(
          transformCode("<SelectOrdinal>Not allowed</SelectOrdinal>")
        ).toThrowErrorMatchingSnapshot()
      })

      it("value is missing", function () {
        const code = `<Plural one="Book" other="Books" />`
        expect(transformCode(code)).toThrowErrorMatchingSnapshot()
      })

      it("offset must be number or string, not variable", function () {
        const variable = `<Plural value={value} offset={offset} one="Book" other="Books" />`
        expect(transformCode(variable)).toThrowErrorMatchingSnapshot()
      })

      it("plural forms are missing", function () {
        const plural = `<Plural value={value} />`
        expect(transformCode(plural)).toThrowErrorMatchingSnapshot()

        const select = `<Select value={value} />`
        expect(transformCode(select)).toThrowErrorMatchingSnapshot()

        const ordinal = `<SelectOrdinal value={value} />`
        expect(transformCode(ordinal)).toThrowErrorMatchingSnapshot()
      })

      it("plural rules must be valid", function () {
        const plural = `<Plural value={value} three="Invalid" one="Book" other="Books" />`
        expect(transformCode(plural)).toThrowErrorMatchingSnapshot()

        const ordinal = `<SelectOrdinal value={value} three="Invalid" one="st" other="rd" />`
        expect(transformCode(ordinal)).toThrowErrorMatchingSnapshot()
      })
    })
  })

  describe("useLingui validation", () => {
    it("Should throw if used not in the variable declaration", () => {
      const code = `
      import {useLingui} from "@lingui/macro";
      
      useLingui()
       
       `
      expect(transformCode(code)).toThrowError(
        "Error: `useLingui` macro must be used in variable declaration."
      )
    })

    it("Should throw if not used with destructuring", () => {
      const code = `
      import {useLingui} from "@lingui/macro";
      
      const lingui = useLingui()
       
       `
      expect(transformCode(code)).toThrowError(
        "You have to destructure `t` when using the `useLingui` macro"
      )
    })
  })

  describe("Trans validation", () => {
    it("Should throw if spread used in children", () => {
      const code = `
        import { Trans } from '@lingui/macro';
        <Trans>{...spread}</Trans>
       `
      expect(transformCode(code)).toThrowError("Incorrect usage of Trans")
    })

    it("Should throw if used without children", () => {
      const code = `
      import { Trans } from '@lingui/macro';
      <Trans id={msg} />;
       `
      expect(transformCode(code)).toThrowError("Incorrect usage of Trans")
    })
  })
})
