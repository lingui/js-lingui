import { TestCase } from "./index"

const cases: TestCase[] = [
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
       const a = i18n._(
          /*i18n*/
          {
            id: "esnaQO",
            message: "{count, plural, one {# book} other {# books}}",
            values: {
              count: count,
            },
          }
        );

      `,
  },
  {
    name: "plural macro could be renamed",
    input: `
        import { plural as plural2 } from '@lingui/macro'
        const a = plural2(count, {
          "one": \`# book\`,
          other: "# books"
        });
      `,
    expected: `
        import { i18n } from "@lingui/core";
       const a = i18n._(
          /*i18n*/
          {
            id: "esnaQO",
            message: "{count, plural, one {# book} other {# books}}",
            values: {
              count: count,
            },
          }
        );

      `,
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
        i18n._(
          /*i18n*/
          {
            id: "CF5t+7",
            message: "{0, plural, offset:1 =0 {No books} =1 {1 book} other {# books}}",
            values: {
              0: users.length,
            },
          }
        );
      `,
  },
]
export default cases
