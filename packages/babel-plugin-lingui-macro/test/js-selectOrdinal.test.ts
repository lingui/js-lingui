import { macroTester } from "./macroTester"
describe.skip("", () => {})

macroTester({
  cases: [
    {
      code: `
        import { t, selectOrdinal } from '@lingui/core/macro'
        t\`This is my \${selectOrdinal(count, {
          one: "#st",
          "two": \`#nd\`,
          other: ("#rd")
        })} cat\`
      `,
    },
  ],
})
