import { TestCase } from "./index"

const cases: TestCase[] = [
  {
    stripId: true,
    input: `
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
    expected: `
        import { Trans as _Trans } from "@lingui/react";
        <_Trans id={"<stripped>"} message={
          "This is my {count, selectordinal, one {#st} two {#nd} other {<0>#rd</0>}} cat."
         }
         values={{
          count: count
        }} components={{
          0: <strong />
        }} />;
      `,
  },
  {
    // without trailing whitespace ICU expression on the next line will not have a space
    stripId: true,
    input: `
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
    expected: `
        import { Trans as _Trans } from "@lingui/react";
        <_Trans id={"<stripped>"}  message={
          "This is my{count, selectordinal, one {#st} two {#nd} other {<0>#rd</0>}} cat."
         }
         values={{
          count: count
        }} components={{
          0: <strong />
        }} />;
      `,
  },
  {
    stripId: true,
    input: `
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
    expected: `
        import { Trans as _Trans } from "@lingui/react";
        <_Trans 
          id={"<stripped>" }
          message={
            "This is my {0, selectordinal, one {#st} two {#nd} other {<0>#rd</0>}} cat."
           }
          values={{
              0: user.numCats
            }} 
          components={{
            0: <strong />
          }} 
        />;
      `,
  },
]
export default cases
