export default [
  {
    name: "Macro is used in expression assignment",
    input: `
        import { plural } from '@lingui/macro'
        const a = plural(count, {
          "one": \`# book\`,
          other: "# books"
        });
      `,
    expected: `
        import { i18n } from "@lingui/core";
        const a = 
          /*i18n*/
          i18n._("{count, plural, one {# book} other {# books}}", {
            count: count
          });
      `
  },
  {
    name: "Macro with offset and exact matches",
    input: `
        import { plural } from '@lingui/macro'
        plural(users.length, {
          offset: 1,
          0: "No books",
          1: "1 book",
          other: "# books"
        });
      `,
    expected: `
        import { i18n } from "@lingui/core";
        /*i18n*/
        i18n._("{0, plural, offset:1 =0 {No books} =1 {1 book} other {# books}}", {
          0: users.length
        });
      `
  }
]
