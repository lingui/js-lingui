import { describe, expect, it } from "vitest";
import { macroTester } from "./macroTester"

macroTester({
  cases: [
    {
      code: `
        import { Select } from '@lingui/react/macro';
        <Select
          value={count}
          _male="He"
          _female={\`She\`}
          other={<strong>Other</strong>}
        />;
      `,
    },
    {
      code: `
        import { Select } from '@lingui/react/macro';
        <Select
          id="msg.select"
          render="strong"
          value={user.gender}
          _male="He"
          _female={\`She\`}
          other={<strong>Other</strong>}
        />;
      `,
    },
    {
      name: "Select should support JSX elements in cases",
      code: `
        import { Select, Trans } from '@lingui/react/macro';
        <Select
          value="happy"
          _happy={
            <Trans>Hooray! <Icon /></Trans>
          }
          _sad={
            <Trans>Oh no! <Icon /></Trans>
          }
          other="Dunno"
        />
      `,
    },
    {
      code: `
        import { Select } from '@lingui/react/macro';
        <Select
          id="msg.select"
          render="strong"
          value={user.gender}
          _male="He"
          _female={\`She\`}
          other={otherText}
        />;
      `,
    },
  ],
})
