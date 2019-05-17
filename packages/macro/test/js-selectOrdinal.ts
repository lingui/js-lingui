export default [
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
        /*i18n*/
        ({
          id: "This is my {count, selectordinal, one {#st} two {#nd} other {#rd}} cat",
          values: {
            count: count
          }
        });
      `
  }
]
