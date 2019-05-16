export default [
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
        /*i18n*/
        ({
          id: "{gender, select, male {{numOfGuests, plural, one {He invites one guest} other {He invites # guests}}} female {She is {gender}} other {They is {gender}}}",
          values: {
            gender: gender,
            numOfGuests: numOfGuests
          }
        });
      `
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
        /*i18n*/
        ({
          id: "{value, select, id {test escaped id} comment {test escaped comment}}",
          values: {
            value: value
          }
        });
      `
  }
]
