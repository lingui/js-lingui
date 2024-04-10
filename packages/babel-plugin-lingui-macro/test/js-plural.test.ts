import { macroTester } from "./macroTester"

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
  ],
})
