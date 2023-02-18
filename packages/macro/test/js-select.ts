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
]
export default cases
