import { macroTester } from "./macroTester"

macroTester({
  cases: [
    {
      code: `
        import { Plural } from '@lingui/react/macro';
        <Plural
          value={count}
          offset="1"
          _0="Zero items"
          few={\`\${count} items\`}
          other={<a href="/more">A lot of them</a>}
        />;
      `,
    },
    {
      name: "Plural macro could be renamed",
      code: `
        import { Plural as Plural2 } from '@lingui/react/macro';
        <Plural2
          value={count}
          one={"..."}
          other={"..."}
        />;
      `,
    },
    {
      name: "Should preserve reserved props: `comment`, `context`, `render`, `id`",
      code: `
        import { Plural } from '@lingui/react/macro';
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
    },
    {
      code: `
        import { Trans, Plural } from '@lingui/react/macro';
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
    },
    {
      name: "Should return cases without leading or trailing spaces for nested Trans inside Plural",
      code: `
        import { Trans, Plural } from '@lingui/react/macro';
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
    },
    {
      code: `
        import { Plural } from '@lingui/react/macro';
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
    },
    {
      code: `
        import { Trans, Plural } from '@lingui/react/macro';
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
    },
    {
      code: `
        import { Plural } from '@lingui/react/macro';
        <Plural
          value={count}
          _0="Zero items"
          one={oneText}
          other={<a href="/more">A lot of them</a>}
        />;
      `,
    },
    {
      filename: `jsx-plural-select-nested.js`,
    },
  ],
})
