import { describe } from "vitest"
import { macroTester } from "./macroTester"

describe.skip("", () => {})

macroTester({
  cases: [
    {
      name: "Generate ID from message",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>Hello World</Trans>;
      `,
    },
    {
      name: "Generate different id when context provided",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>Hello World</Trans>;
        <Trans context="my context">Hello World</Trans>;
      `,
    },
    {
      name: "Preserve custom ID (string literal)",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans id="msg.hello">Hello World</Trans>;
      `,
    },
    {
      name: "Preserve custom ID (literal expression)",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans id={"msg.hello"}>Hello World</Trans>;
      `,
    },
    {
      name: "Preserve custom ID (template expression)",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans id={\`msg.hello\`}>Hello World</Trans>;
      `,
    },
    {
      name: "Should preserve reserved props: `comment`, `context`, `render`, `id`",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans
          comment="Comment for translator"
          context="translation context"
          id="custom.id"
          render={() => {}}
        >Hello World</Trans>;
      `,
    },
    {
      name: "Trans macro could be renamed",
      code: `
        import { Trans as Trans2 } from '@lingui/react/macro';
        <Trans2>Hello World</Trans2>;
      `,
    },
    {
      name: "Variables are converted to named arguments",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>Hi {yourName}, my name is {myName}</Trans>;
      `,
    },
    {
      name: "Variables are deduplicated",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>{duplicate} variable {duplicate}</Trans>;
      `,
    },
    {
      name: "Quoted JSX attributes are handled",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>Speak "friend"!</Trans>;
        <Trans id="custom-id">Speak "friend"!</Trans>;
      `,
    },
    {
      name: "HTML attributes are handled",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>
          <Text>This should work &nbsp;</Text>
        </Trans>;
      `,
    },
    {
      name: "Template literals as children",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>{\`How much is \${expression}? \${count}\`}</Trans>;
      `,
    },
    {
      name: "Strings as children are preserved",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>{"hello {count, plural, one {world} other {worlds}}"}</Trans>;
      `,
    },
    {
      name: "Expressions are converted to positional arguments",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>
          Property {props.name},
          function {random()},
          array {array[index]},
          constant {42},
          object {new Date()},
          everything {props.messages[index].value()}
        </Trans>;
      `,
    },
    {
      name: "JSX Macro inside JSX conditional expressions",
      code: `
       import { Trans } from '@lingui/react/macro';
       <Trans>Hello, {props.world ? <Trans>world</Trans> : <Trans>guys</Trans>}</Trans>
      `,
    },
    {
      name: "JSX Macro inside JSX multiple nested conditional expressions",
      code: `
      import { Trans } from '@lingui/react/macro';
      <Trans>Hello, {props.world ? <Trans>world</Trans> : (
        props.b
          ? <Trans>nested</Trans>
          : <Trans>guys</Trans>
      )
    }</Trans>
      `,
    },
    {
      name: "Elements are replaced with placeholders",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>
          Hello <strong>World!</strong><br />
          <p>
            My name is <a href="/about">{" "}
            <em>{name}</em></a>
          </p>
        </Trans>;
      `,
    },
    {
      name: "Elements inside expression container",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>{<span>Component inside expression container</span>}</Trans>;
      `,
    },
    {
      name: "Elements without children",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>{<br />}</Trans>;
      `,
    },
    {
      name: "stripMessageField option - message prop is removed if stripMessageField: true",
      macroOpts: {
        stripMessageField: true,
      },
      code: `
      import { Trans } from '@lingui/macro';
      <Trans id="msg.hello">Hello World</Trans>
    `,
    },
    {
      name: "Production - only essential props are kept",
      production: true,
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans id="msg.hello" context="my context" comment="Hello World">Hello World</Trans>
      `,
    },
    {
      name: "Production - message prop is kept if stripMessageField: false",
      production: true,
      macroOpts: {
        stripMessageField: false,
      },
      code: `
      import { Trans } from '@lingui/macro';
      <Trans id="msg.hello" comment="Hello World">Hello World</Trans>
    `,
    },
    {
      name: "Production - all props kept if extract: true",
      production: true,
      macroOpts: {
        extract: true,
      },
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans id="msg.hello" comment="Hello World">Hello World</Trans>
      `,
    },
    {
      name: "Production - import type doesn't interference on normal import",
      production: true,
      useTypescriptPreset: true,
      code: `
        import type { withI18nProps } from '@lingui/react'
        import { Trans } from '@lingui/react/macro';
        <Trans id="msg.hello" comment="Hello World">Hello World</Trans>
      `,
    },
    {
      name: "Strip whitespace around arguments",
      code: `
        import { Trans } from "@lingui/react/macro";
        <Trans>
          Strip whitespace around arguments: '
          {name}
          '
        </Trans>
      `,
    },
    {
      name: "Strip whitespace around tags but keep forced spaces",
      code: `
        import { Trans } from "@lingui/react/macro";
        <Trans>
          Strip whitespace around tags, but keep{" "}
          <strong>forced spaces</strong>
          !
        </Trans>
      `,
    },
    {
      name: "Strip whitespace around tags but keep whitespaces in JSX containers",
      code: `
      import { Trans } from "@lingui/react/macro";
        <Trans>
        {"Wonderful framework "}
        <a href="https://nextjs.org">Next.js</a>
        {" say hi. And "}
        <a href="https://nextjs.org">Next.js</a>
        {" say hi."}
      </Trans>
      `,
    },
    {
      name: "Keep forced newlines",
      filename: "./jsx-keep-forced-newlines.js",
    },
    {
      name: "Use a js macro inside a JSX Attribute of a component handled by JSX macro",
      code: `
        import { Trans } from '@lingui/react/macro';
        import { t } from '@lingui/core/macro';
        <Trans>Read <a href="/more" title={t\`Full content of \${articleName}\`}>more</a></Trans>
      `,
    },
    {
      name: "Use a js macro inside a JSX Attribute of a non macro JSX component",
      code: `
        import { plural } from '@lingui/core/macro';
        <a href="/about" title={plural(count, {
          one: "# book",
          other: "# books"
        })}>About</a>
      `,
    },
    {
      name: "Ignore JSXEmptyExpression",
      code: `
        import { Trans } from '@lingui/react/macro';
        <Trans>Hello {/* and I cannot stress this enough */} World</Trans>;
      `,
    },
    {
      name: "Use decoded html entities",
      code: `
        import { Trans } from "@lingui/react/macro";
        <Trans>&amp;</Trans>
      `,
    },
    {
      name: "Should not process non JSXElement nodes",
      useTypescriptPreset: true,
      code: `
        import { Trans } from "@lingui/react/macro";
        type X = typeof Trans;
        const cmp = <Trans>Hello</Trans>
      `,
    },
  ],
})
