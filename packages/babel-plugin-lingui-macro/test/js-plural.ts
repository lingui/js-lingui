import { TestCase } from "./index"

const cases: TestCase[] = [
  {
    name: "Macro is used in expression assignment",
    input: `
        import { plural } from '@lingui/core/macro'
        const a = plural(count, {
          "one": \`# book\`,
          other: "# books"
        });
      `,
    expected: `
        import { i18n as _i18n } from "@lingui/core";
       const a = _i18n._(
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
        import { plural as plural2 } from '@lingui/core/macro'
        const a = plural2(count, {
          "one": \`# book\`,
          other: "# books"
        });
      `,
    expected: `
        import { i18n as _i18n } from "@lingui/core";
       const a = _i18n._(
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
        import { plural } from '@lingui/core/macro'
        plural(users.length, {
          offset: 1,
          0: "No books",
          1: "1 book",
          other: "# books"
        });
      `,
    expected: `
        import { i18n as _i18n } from "@lingui/core";
        _i18n._(
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
  {
    name: "Macro with expression only choice",
    input: `
        import { plural } from '@lingui/core/macro'
        plural(users.length, {
          offset: 1,
          0: "No books",
          1: "1 book",
          other: someOtherExp
        });
      `,
    expected: `
        import { i18n as _i18n } from "@lingui/core";
        _i18n._(
          /*i18n*/
          {
            id: "0mcXIe",
            message: "{0, plural, offset:1 =0 {No books} =1 {1 book} other {{someOtherExp}}}",
            values: {
              0: users.length,
              someOtherExp: someOtherExp,
            },
          }
        );
      `,
  },
]
export default cases
