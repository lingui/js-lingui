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
        /*i18n*/ i18n._("{gender, select, male {{numOfGuests, plural, one {He invites one guest} other {He invites # guests}}} female {She is {gender}} other {They is {gender}}}", {
          gender: gender,
          numOfGuests: numOfGuests
        });
      `,
  },
  {
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
        /*i18n*/ i18n._("{value, select, id {test escaped id} comment {test escaped comment}}", {
          value: value
        });
      `,
  },
]
export default cases
