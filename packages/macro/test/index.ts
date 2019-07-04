import fs from "fs"
import path from "path"
import { transformFileSync, transform, TransformOptions } from "@babel/core"
import prettier from "prettier"
import { babel } from "@lingui/cli/src/api/extractors"

const testCases = {
  "js-arg": require("./js-arg").default,
  "js-t": require("./js-t").default,
  "js-plural": require("./js-plural").default,
  "js-select": require("./js-select").default,
  "js-selectOrdinal": require("./js-selectOrdinal").default,
  "jsx-trans": require("./jsx-trans").default,
  "jsx-select": require("./jsx-select").default,
  "jsx-plural": require("./jsx-plural").default,
  "jsx-selectOrdinal": require("./jsx-selectOrdinal").default,
  "js-defineMessage": require("./js-defineMessage").default
}

describe("macro", function() {
  const babelOptions: TransformOptions = {
    filename: "<filename>",
    configFile: false,
    plugins: ["@babel/plugin-syntax-jsx", "macros"]
  }

  // return function, so we can test exceptions
  const transformCode = code => () => {
    try {
      return transform(code, babelOptions).code.trim()
    } catch (e) {
      e.message = e.message.replace(/([^:]*:){2}/, "")
      throw e
    }
  }

  Object.keys(testCases).forEach(suiteName => {
    describe(suiteName, () => {
      const cases = testCases[suiteName]

      const clean = value =>
        prettier.format(value, { parser: "babel" }).replace(/\n+/, "\n")

      cases.forEach(
        (
          { name, input, expected, filename, production, only, skip },
          index
        ) => {
          let run = it
          if (only) run = it.only
          if (skip) run = it.skip
          run(name != null ? name : `${suiteName} #${index + 1}`, () => {
            expect(input || filename).toBeDefined()

            const originalEnv = process.env.NODE_ENV

            if (production) {
              process.env.NODE_ENV = "production"
            }

            process.env.LINGUI_CONFIG = path.join(__dirname, "lingui.config.js")

            try {
              if (filename) {
                const inputPath = path.relative(
                  process.cwd(),
                  path.join(__dirname, "fixtures", filename)
                )
                const expectedPath = inputPath.replace(/\.js$/, ".expected.js")
                const expected = fs
                  .readFileSync(expectedPath, "utf8")
                  .replace(/\r/g, "")
                  .trim()

                const actual = transformFileSync(inputPath, babelOptions)
                  .code.replace(/\r/g, "")
                  .trim()
                expect(actual).toEqual(expected)
              } else {
                const actual = transform(input, babelOptions).code.trim()

                expect(clean(actual)).toEqual(clean(expected))
              }
            } finally {
              process.env.LINGUI_CONFIG = ""
              process.env.NODE_ENV = originalEnv
            }
          })
        }
      )
    })
  })

  describe.skip("validation", function() {
    describe("plural/select/selectordinal", function() {
      it("value is missing", function() {
        const code = `
        plural({
          0: "No books",
          1: "1 book",
          other: "# books"
        });`
        expect(transformCode(code)).toThrowErrorMatchingSnapshot()
      })

      it("offset must be number or string, not variable", function() {
        const code = `
        plural({
          offset: count,
          0: "No books",
          1: "1 book",
          other: "# books"
        });`
        expect(transformCode(code)).toThrowErrorMatchingSnapshot()
      })

      it("plural forms are missing", function() {
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

      it("plural forms cannot be variables", function() {
        const code = `
        plural({
          value: count,
          [one]: "Book"
        });`
        expect(transformCode(code)).toThrowErrorMatchingSnapshot()
      })

      it("plural rules must be valid", function() {
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

    describe("formats", function() {
      it("value is missing", function() {
        expect(transformCode("date();")).toThrowErrorMatchingSnapshot()
      })

      it("format must be either string, variable or object with custom format", function() {
        expect(transformCode('number(value, "currency");')).not.toThrow()
        expect(transformCode("number(value, currency);")).not.toThrow()
        expect(transformCode("number(value, { digits: 4 });")).not.toThrow()
        expect(
          transformCode("number(value, 42);")
        ).toThrowErrorMatchingSnapshot()
      })
    })

    describe("Plural/Select/SelectOrdinal", function() {
      it("children are not allowed", function() {
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

      it("value is missing", function() {
        const code = `<Plural one="Book" other="Books" />`
        expect(transformCode(code)).toThrowErrorMatchingSnapshot()
      })

      it("offset must be number or string, not variable", function() {
        const variable = `<Plural value={value} offset={offset} one="Book" other="Books" />`
        expect(transformCode(variable)).toThrowErrorMatchingSnapshot()
      })

      it("plural forms are missing", function() {
        const plural = `<Plural value={value} />`
        expect(transformCode(plural)).toThrowErrorMatchingSnapshot()

        const select = `<Select value={value} />`
        expect(transformCode(select)).toThrowErrorMatchingSnapshot()

        const ordinal = `<SelectOrdinal value={value} />`
        expect(transformCode(ordinal)).toThrowErrorMatchingSnapshot()
      })

      it("plural rules must be valid", function() {
        const plural = `<Plural value={value} three="Invalid" one="Book" other="Books" />`
        expect(transformCode(plural)).toThrowErrorMatchingSnapshot()

        const ordinal = `<SelectOrdinal value={value} three="Invalid" one="st" other="rd" />`
        expect(transformCode(ordinal)).toThrowErrorMatchingSnapshot()
      })
    })
  })
})
