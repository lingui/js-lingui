import { macroTester } from "./macroTester"
describe.skip("", () => {})

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
    {
      name: "Support msg tagged template as option value in select",
      code: `
        import { select, msg } from '@lingui/core/macro'
        select(gender, {
          male: msg\`He\`,
          female: msg\`She\`,
          other: msg\`They\`
        });
      `,
    },
    {
      name: "Support plural with nested msg in options",
      code: `
        import { select, plural, msg } from '@lingui/core/macro'
        select(gender, {
          male: plural(numOfGuests, {
            one: msg\`He invites one guest\`,
            other: msg\`He invites # guests\`
          }),
          female: msg\`She\`,
          other: msg\`They\`
        });
      `,
    },
  ],
})
