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
        const a = 
          /*i18n*/
          {
            id: "{count, plural, one {# book} other {# books}}",
            values: {
              count: count
            }
          };
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
        /*i18n*/
        ({
          id: "{0, plural, offset:1 =0 {No books} =1 {1 book} other {# books}}",
          values: {
            0: users.length
          }
        });
      `
  }
]
