import { TestCase } from "./index"

const cases: TestCase[] = [
  {
    input: `
        import { Plural } from '@lingui/macro';
        <Plural
          value={count}
          offset="1"
          _0="Zero items"
          few={\`\${count} items\`}
          other={<a href="/more">A lot of them</a>}
        />;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans 
          id={"tYX0sm"}
          message={
            "{count, plural, offset:1 =0 {Zero items} few {{count} items} other {<0>A lot of them</0>}}"
           }
          values={{
            count: count
          }} 
          components={{
            0: <a href="/more" />
          }} 
        />;
      `,
  },
  {
    stripId: true,
    name: "Plural macro could be renamed",
    input: `
        import { Plural as Plural2 } from '@lingui/macro';
        <Plural2
          value={count}
          one={"..."}
          other={"..."}
        />;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans
          id={"<stripped>"}
          message={"{count, plural, one {...} other {...}}"}
          values={{
            count: count,
          }}
        />;
      `,
  },
  {
    name: "Should preserve reserved props: `comment`, `context`, `render`, `id`",
    input: `
        import { Plural } from '@lingui/macro';
        <Plural
          comment="Comment for translator"
          context="translation context"
          id="custom.id"
          render={() => {}}
          value={count}
          offset="1"
          _0="Zero items"
          few={\`\${count} items\`}
          other={<a href="/more">A lot of them</a>}
        />;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans
          render={() => {}}
          id="custom.id"
          message={
            "{count, plural, offset:1 =0 {Zero items} few {{count} items} other {<0>A lot of them</0>}}"
          }
          comment="Comment for translator"
          context="translation context"
          values={{
            count: count
          }}
          components={{
            0: <a href="/more" />
          }}
        />;
      `,
  },
  {
    stripId: true,
    input: `
        import { Trans, Plural } from '@lingui/macro';
        <Plural
          value={count}
          one={
            <Trans>
              <strong>#</strong> slot added
            </Trans>
          }
          other={
            <Trans>
              <strong>#</strong> slots added
            </Trans>
          }
        />;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans
          id={"<stripped>"}
          message={
            "{count, plural, one {<0>#</0> slot added} other {<1>#</1> slots added}}"
          }
          values={{
            count: count
          }} 
          components={{
            0: <strong />,
            1: <strong />
          }} 
        />;
      `,
  },
  {
    stripId: true,
    name: "Should return cases without leading or trailing spaces for nested Trans inside Plural",
    input: `
        import { Trans, Plural } from '@lingui/macro';
        <Plural
              one={
                <Trans>
                  One hello
                </Trans>
              }
              other={
                <Trans>
                  Other hello
                </Trans>
              }
              value={count}
        />;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans 
          id={"<stripped>"}
          message={
            "{count, plural, one {One hello} other {Other hello}}"
          }
          values={{
            count: count
          }}
        />;
      `,
  },
  {
    input: `
        import { Plural } from '@lingui/macro';
        <Plural
          id="msg.plural"
          render="strong"
          value={count}
          offset="1"
          _0="Zero items"
          few={\`\${count} items\`}
          other={<a href="/more">A lot of them</a>}
        />;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans render="strong" id="msg.plural" message={"{count, plural, offset:1 =0 {Zero items} few {{count} items} other {<0>A lot of them</0>}}"} values={{
          count: count
        }} components={{
          0: <a href="/more" />
        }} />;
      `,
  },
  {
    input: `
        import { Trans, Plural } from '@lingui/macro';
        <Trans id="inner-id-removed">
          Looking for{" "}
          <Plural
            value={items.length}
            offset={1}
            _0="zero items"
            few={\`\${items.length} items \${42}\`}
            other={<a href="/more">a lot of them</a>}
          />
        </Trans>
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans id="inner-id-removed" message={
            "Looking for {0, plural, offset:1 =0 {zero items} few {{1} items {2}} other {<0>a lot of them</0>}}"
         }
         values={{
          0: items.length,
          1: items.length,
          2: 42
        }} components={{
          0: <a href="/more" />
        }} />;
      `,
  },
  {
    filename: `jsx-plural-select-nested.js`,
  },
]
export default cases
