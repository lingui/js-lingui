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
    name: "Nested macros with pure expressions option",
    input: `
        import { select, plural } from '@lingui/macro'
        select(gender, {
          "male": plural(numOfGuests, {
            one: "He invites one guest",
            other: "He invites # guests"
          }),
          female: \`She is \${gender}\`,
          other: someOtherExp
        });
      `,
    expected: `
        import { i18n } from "@lingui/core";
        i18n._(
          /*i18n*/
          {
            id: "j9PNNm",
            message: "{gender, select, male {{numOfGuests, plural, one {He invites one guest} other {He invites # guests}}} female {She is {gender}} other {{someOtherExp}}}",
            values: {
              gender: gender,
              numOfGuests: numOfGuests,
              someOtherExp: someOtherExp,
            },
          }
        );
      `,
  },
]
export default cases
