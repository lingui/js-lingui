import { TestCase } from "./index"

const cases: TestCase[] = [
  {
    stripId: true,
    input: `
        import { Select } from '@lingui/macro';
        <Select
          value={count}
          _male="He"
          _female={\`She\`}
          other={<strong>Other</strong>}
        />;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans
          id={"<stripped>"}
          message={"{count, select, male {He} female {She} other {<0>Other</0>}}"} values={{
            count: count
          }} 
          components={{
            0: <strong />
          }} 
        />;
      `,
  },
  {
    input: `
        import { Select } from '@lingui/macro';
        <Select
          id="msg.select"
          render="strong"
          value={user.gender}
          _male="He"
          _female={\`She\`}
          other={<strong>Other</strong>}
        />;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans render="strong" id="msg.select" message={"{0, select, male {He} female {She} other {<0>Other</0>}}"} values={{
          0: user.gender
        }} components={{
          0: <strong />
        }} />;
      `,
  },
  {
    stripId: true,
    name: "Select should support JSX elements in cases",
    input: `
        import { Select } from '@lingui/macro';
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
    expected: `
      import { Trans } from "@lingui/react";
      <Trans
        id={"<stripped>"}
        message={"{0, select, happy {Hooray! <0/>} sad {Oh no! <1/>} other {Dunno}}"}
        values={{
          0: "happy",
        }}
        components={{
          0: <Icon />,
          1: <Icon />,
        }}
      />;
      `,
  },
  {
    input: `
        import { Select } from '@lingui/macro';
        <Select
          id="msg.select"
          render="strong"
          value={user.gender}
          _male="He"
          _female={\`She\`}
          other={otherText}
        />;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans render="strong" id="msg.select" message={"{0, select, male {He} female {She} other {{otherText}}}"} values={{
          0: user.gender,
          otherText: otherText
        }} />;
      `,
  },
]
export default cases
