import { TestCase } from "./index"

const cases: TestCase[] = [
  {
    input: `
        import { t, selectOrdinal } from '@lingui/macro'
        t\`This is my \${selectOrdinal(count, {
          one: "#st",
          "two": \`#nd\`,
          other: ("#rd")
        })} cat\`
      `,
    expected: `
         import { i18n as _i18n } from "@lingui/core";
         _i18n._(
          /*i18n*/
          {
            id: "dJXd3T",
            message: "This is my {count, selectordinal, one {#st} two {#nd} other {#rd}} cat",
            values: {
              count: count,
            },
          }
        );
      `,
  },
]
export default cases
