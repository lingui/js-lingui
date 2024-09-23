import { macroTester } from "./macroTester"

macroTester({
  cases: [
    {
      name: "Nested macros",
      code: `
        import { select, plural } from '@lingui/core/macro'
        select(gender, {
          "male": plural(numOfGuests, {
            one: "He invites one guest",
            other: "He invites # guests"
          }),
          female: \`She is \${gender}\`,
          other: \`They is \${gender}\`
        });
      `,
    },
    {
      name: "Nested macros with pure expressions option",
      code: `
        import { select, plural } from '@lingui/core/macro'
        select(gender, {
          "male": plural(numOfGuests, {
            one: "He invites one guest",
            other: "He invites # guests"
          }),
          female: \`She is \${gender}\`,
          other: someOtherExp
        });
      `,
    },
  ],
})
