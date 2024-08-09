import path from "path"
import { transformSync } from "@babel/core"
import { getDefaultBabelOptions } from "./macroTester"

describe("macro", function () {
  process.env.LINGUI_CONFIG = path.join(__dirname, "lingui.config.js")

  const transformTypes = ["plugin", "macro"] as const

  function forTransforms(
    run: (_transformCode: (code: string) => () => string) => any
  ) {
    return () =>
      transformTypes.forEach((transformType) => {
        test(transformType, () => {
          return run((code) => transformCode(code, transformType))
        })
      })
  }

  // return function, so we can test exceptions
  const transformCode =
    (code: string, transformType: "plugin" | "macro" = "plugin") =>
    () => {
      try {
        return transformSync(
          code,
          getDefaultBabelOptions(transformType)
        ).code.trim()
      } catch (e) {
        ;(e as Error).message = (e as Error).message.replace(/([^:]*:){2}/, "")
        throw e
      }
    }

  it("Should throw error if used without babel-macro-plugin", async () => {
    await expect(async () => {
      const mod = await import("../src/macro")
      return (mod as any).Trans
    }).rejects.toThrow('The macro you imported from "@lingui/core/macro"')
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
    describe(
      "Should throw if used not in the variable declaration",
      forTransforms((transformCode) => {
        const code = `
      import {useLingui} from "@lingui/react/macro";
      
      useLingui()
       
       `
        expect(transformCode(code)).toThrowError(
          "Error: `useLingui` macro must be used in variable declaration."
        )
      })
    )

    describe(
      "Should throw if not used with destructuring",
      forTransforms((transformCode) => {
        const code = `
      import {useLingui} from "@lingui/react/macro";
      
      const lingui = useLingui()
       
       `
        expect(transformCode(code)).toThrowError(
          "You have to destructure `t` when using the `useLingui` macro"
        )
      })
    )
  })

  describe("Trans validation", () => {
    describe(
      "Should throw if spread used in children",
      forTransforms((transformCode) => {
        const code = `
        import { Trans } from '@lingui/react/macro';
        <Trans>{...spread}</Trans>
       `
        expect(transformCode(code)).toThrowError("Incorrect usage of Trans")
      })
    )

    describe(
      "Should throw if used without children",
      forTransforms((transformCode) => {
        const code = `
      import { Trans } from '@lingui/react/macro';
      <Trans id={msg} />;
       `
        expect(transformCode(code)).toThrowError("Incorrect usage of Trans")
      })
    )
  })
})
