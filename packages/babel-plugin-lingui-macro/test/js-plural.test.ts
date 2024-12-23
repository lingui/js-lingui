import { macroTester } from "./macroTester"
describe.skip("", () => {})

macroTester({
  cases: [
    {
      name: "Macro is used in expression assignment",
      code: `
        import { plural } from '@lingui/core/macro'
        const a = plural(count, {
          "one": \`# book\`,
          other: "# books"
        });
      `,
    },
    {
      name: "plural macro could be renamed",
      code: `
        import { plural as plural2 } from '@lingui/core/macro'
        const a = plural2(count, {
          "one": \`# book\`,
          other: "# books"
        });
      `,
    },
    {
      name: "Macro with offset and exact matches",
      code: `
        import { plural } from '@lingui/core/macro'
        plural(users.length, {
          offset: 1,
          0: "No books",
          1: "1 book",
          other: "# books"
        });
      `,
    },
    {
      name: "Macro with expression only choice",
      code: `
        import { plural } from '@lingui/core/macro'
        plural(users.length, {
          offset: 1,
          0: "No books",
          1: "1 book",
          other: someOtherExp
        });
      `,
    },
    {
      name: "Macro with labeled expression as value",
      code: `
        import { plural } from '@lingui/core/macro'
        const a = plural({ count: getCount() }, {
          "one": \`# book\`,
          other: "# books"
        });
      `,
    },

    {
      name: "Macro with labeled expression as value",
      code: `
        import { plural, ph } from '@lingui/core/macro'
        const a = plural(ph({ count: getCount() }), {
          "one": \`# book\`,
          other: "# books"
        });
      `,
    },

    {
      useTypescriptPreset: true,
      name: "Macro with labeled expression with `as` expression",
      code: `
        import { plural } from '@lingui/core/macro'
        const a = plural({ count: getCount() } as any, {
          "one": \`# book\`,
          other: "# books"
        });
      `,
    },
  ],
})
