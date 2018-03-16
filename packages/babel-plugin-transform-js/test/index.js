import fs from "fs"
import glob from "glob"
import path from "path"
import { transformFileSync, transform } from "babel-core"

import plugin from "../src/index"

function getTestName(testPath) {
  return path.basename(testPath)
}

describe("babel-plugin-lingui-transform-js", function() {
  const babelOptions = {
    babelrc: false,
    plugins: [plugin, "@babel/plugin-syntax-jsx"]
  }

  // return function, so we can test exceptions
  const transformCode = code => () => transform(code, babelOptions).code.trim()

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
        i18n.plural({
          0: "No books",
          1: "1 book",
          other: "# books"
        });`
        expect(transformCode(code)).toThrowErrorMatchingSnapshot()
      })

      it("offset must be number or string, not variable", function() {
        const code = `
        i18n.plural({
          offset: count,
          0: "No books",
          1: "1 book",
          other: "# books"
        });`
        expect(transformCode(code)).toThrowErrorMatchingSnapshot()
      })

      it("plural forms are missing", function() {
        const plural = `
        i18n.plural({
          value: count
        });`
        expect(transformCode(plural)).toThrowErrorMatchingSnapshot()

        const select = `
        i18n.plural({
          value: count
        });`
        expect(transformCode(select)).toThrowErrorMatchingSnapshot()

        const selectOrdinal = `
        i18n.plural({
          value: count
        });`
        expect(transformCode(selectOrdinal)).toThrowErrorMatchingSnapshot()
      })

      it("plural forms missing fallback", function() {
        const plural = `
        i18n.plural({
          value: count,
          one: "Book"
        });`
        expect(transformCode(plural)).toThrowErrorMatchingSnapshot()

        const select = `
        i18n.select({
          value: count,
          male: "He"
        });`
        expect(transformCode(select)).toThrowErrorMatchingSnapshot()

        const selectOrdinal = `
        i18n.selectOrdinal({
          value: count,
          one: "st"
        });`
        expect(transformCode(selectOrdinal)).toThrowErrorMatchingSnapshot()
      })

      it("plural forms cannot be variables", function() {
        const code = `
        i18n.plural({
          value: count,
          [one]: "Book"
        });`
        expect(transformCode(code)).toThrowErrorMatchingSnapshot()
      })

      it("plural rules must be valid", function() {
        const plural = `
        i18n.plural({
          value: count,
          one: "Book",
          three: "Invalid",
          other: "Books"
        });`
        expect(transformCode(plural)).toThrowErrorMatchingSnapshot()

        const selectOrdinal = `
        i18n.selectOrdinal({
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
      expect(transformCode("i18n.date();")).toThrowErrorMatchingSnapshot()
    })

    it("format must be either string, variable or object with custom format", function() {
      expect(transformCode('i18n.number(value, "currency");')).not.toThrow()
      expect(transformCode("i18n.number(value, currency);")).not.toThrow()
      expect(transformCode("i18n.number(value, { digits: 4 });")).not.toThrow()
      expect(
        transformCode("i18n.number(value, 42);")
      ).toThrowErrorMatchingSnapshot()
    })
  })
})
