import fs from "fs"
import glob from "glob"
import path from "path"
import { transformFileSync, transform } from "babel-core"

function getTestName(testPath) {
  return path.basename(testPath)
}

describe("js.macro", function() {
  const babelOptions = {
    babelrc: false,
    plugins: ["syntax-jsx", "macros"]
  }

  // return function, so we can test exceptions
  const transformCode = code => () =>
    transform(
      `import { 
      t, plural, select, selectOrdinal, date, number
    } from '@lingui/js.macro';
    const i18n = setupI18n();
    ${code}`,
      babelOptions
    ).code.trim()

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
    })
  })

  describe("validation", function() {
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

      it("plural forms missing fallback", function() {
        const plural = `
        plural({
          value: count,
          one: "Book"
        });`
        expect(transformCode(plural)).toThrowErrorMatchingSnapshot()

        const select = `
        select({
          value: count,
          male: "He"
        });`
        expect(transformCode(select)).toThrowErrorMatchingSnapshot()

        const selectOrdinal = `
        selectOrdinal({
          value: count,
          one: "st"
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
  })

  describe("formats", function() {
    it("value is missing", function() {
      expect(transformCode("date();")).toThrowErrorMatchingSnapshot()
    })

    it("format must be either string, variable or object with custom format", function() {
      expect(transformCode('number(value, "currency");')).not.toThrow()
      expect(transformCode("number(value, currency);")).not.toThrow()
      expect(transformCode("number(value, { digits: 4 });")).not.toThrow()
      expect(transformCode("number(value, 42);")).toThrowErrorMatchingSnapshot()
    })
  })
})
