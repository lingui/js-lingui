import { TestCase } from "./index"

const cases: TestCase[] = [
  {
    name: "Nested macros",
    input: `
        import { select, plural } from '@lingui/macro'
        select(gender, {
          "male": plural(numOfGuests, {
            one: "He invites one guest",
            other: "He invites # guests"
          }),
          female: \`She is \${gender}\`,
          other: \`They is \${gender}\`
        });
      `,
    expected: `
        import { i18n } from "@lingui/core";
        i18n._(
          /*i18n*/
          {
            id: "G8xqGf",
            message: "{gender, select, male {{numOfGuests, plural, one {He invites one guest} other {He invites # guests}}} female {She is {gender}} other {They is {gender}}}",
            values: {
              gender: gender,
              numOfGuests: numOfGuests,
            },
          }
        );
      `,
  },
  {
    // todo: the original test case is weird.
    //  The `comment field` was never escaped here
    //   and never allowed as property

    name: "Macro with escaped reserved props",
    input: `
        import { select } from '@lingui/macro'
        select(value, {
          id: 'test escaped id',
          comment: 'test escaped comment'
        })
      `,
    expected: `
        import { i18n } from "@lingui/core";
        i18n._(
          /*i18n*/
          {
            id: "WNOR8i",
            message: "{value, select, id {test escaped id} comment {test escaped comment}}",
            values: {
              value: value,
            },
          }
        );
      `,
  },
]
export default cases
