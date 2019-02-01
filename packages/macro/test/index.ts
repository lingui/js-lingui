import fs from "fs"
import glob from "glob"
import path from "path"
import { transformFileSync, transform } from "@babel/core"

function getTestName(testPath) {
  return path.basename(testPath)
}

describe("macro", function() {
  const babelOptions = {
    configFile: false,
    plugins: ["@babel/plugin-syntax-jsx", "macros"]
  }

  // return function, so we can test exceptions
  const transformCode = code => () => {
    try {
      return transform(
        `import { 
        t, plural, select, selectOrdinal, date, number,
        Trans, Plural, Select, SelectOrdinal, DateFormat, NumberFormat
      } from '@lingui/macro';
    ${code}`,
        {
          filename: "<filename>",
          ...babelOptions
        }
      ).code.trim()
    } catch (e) {
      e.message = e.message.replace(/([^:]*:){2}/, "")
      throw e
    }
  }

  glob.sync(path.join(__dirname, "fixtures/*/")).forEach(testPath => {
    const testName = getTestName(testPath)
    // We're using relative path here to make snapshot testing work
    // across different machines.
    const actualPath = path.relative(
      process.cwd(),
      path.join(testPath, "actual.js")
    )
    const expectedPath = path.join(testPath, "expected.js")

    it(testName, () => {
      let originalEnv
      if (testName.endsWith("-production")) {
        originalEnv = process.env.NODE_ENV
        process.env.NODE_ENV = "production"
      }

      try {
        const expected =
          fs.existsSync(expectedPath) &&
          fs
            .readFileSync(expectedPath, "utf8")
            .replace(/\r/g, "")
            .trim()

        const actual = transformFileSync(actualPath, babelOptions)
          .code.replace(/\r/g, "")
          .trim()
        expect(actual).toEqual(expected)
      } finally {
        if (originalEnv) process.env.NODE_ENV = originalEnv
      }
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

    describe("Date/Number", function() {
      it("value of number must be a variable", function() {
        expect(
          transformCode("<Trans><NumberFormat /></Trans>")
        ).toThrowErrorMatchingSnapshot()
      })

      it("format must be string, variable or object with custom format", function() {
        expect(
          transformCode(
            '<Trans><NumberFormat value={value} format="custom" /></Trans>'
          )
        ).not.toThrow()
        expect(
          transformCode(
            '<Trans><NumberFormat value={value} format={"custom"} /></Trans>'
          )
        ).not.toThrow()
        expect(
          transformCode(
            "<Trans><NumberFormat value={value} format={custom} /></Trans>"
          )
        ).not.toThrow()
        expect(
          transformCode(
            "<Trans><NumberFormat value={value} format={{ digits: 4 }} /></Trans>"
          )
        ).not.toThrow()
        expect(
          transformCode(
            "<Trans><NumberFormat value={value} format={42} /></Trans>"
          )
        ).toThrowErrorMatchingSnapshot()
      })

      it("value of date must be a variable", function() {
        expect(
          transformCode("<Trans><DateFormat /></Trans>")
        ).toThrowErrorMatchingSnapshot()
      })
    })
  })
})
