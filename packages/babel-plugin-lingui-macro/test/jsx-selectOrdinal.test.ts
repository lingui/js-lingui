import { macroTester } from "./macroTester"
describe.skip("", () => {})

macroTester({
  cases: [
    {
      code: `
        import { Trans, SelectOrdinal } from '@lingui/react/macro';
        <Trans>
          This is my <SelectOrdinal
            value={count}
            one="#st"
            two={\`#nd\`}
            other={<strong>#rd</strong>}
          /> cat.
        </Trans>;
      `,
    },
    {
      // without trailing whitespace ICU expression on the next line will not have a space
      code: `
        import { Trans, SelectOrdinal } from '@lingui/react/macro';
        <Trans>
          This is my
          <SelectOrdinal
            value={count}
            one="#st"
            two={\`#nd\`}
            other={<strong>#rd</strong>}
          /> cat.
        </Trans>;
      `,
    },
    {
      code: `
        import { Trans, SelectOrdinal } from '@lingui/react/macro';
        <Trans>
          This is my <SelectOrdinal
          value={user.numCats}
          one="#st"
          two={\`#nd\`}
          other={<strong>#rd</strong>}
        /> cat.
        </Trans>;
      `,
    },
  ],
})
