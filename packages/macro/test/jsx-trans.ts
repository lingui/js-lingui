export default [
  {
    name: "Generate ID from children",
    input: `
        import { Trans } from '@lingui/macro';
        <Trans>Hello World</Trans>;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans id="Hello World" />;
      `,
  },
  {
    name: "Generated ID is the same as custom one",
    input: `
        import { Trans } from '@lingui/macro';
        <Trans id="Hello World">Hello World</Trans>;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans id="Hello World" />;
      `,
  },
  {
    name: "Macro with custom ID (string literal)",
    input: `
        import { Trans } from '@lingui/macro';
        <Trans id="msg.hello">Hello World</Trans>;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans id="msg.hello" message="Hello World" />;
      `,
  },
  {
    name: "Macro with custom ID (literal expression)",
    input: `
        import { Trans } from '@lingui/macro';
        <Trans id={"msg.hello"}>Hello World</Trans>;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans id="msg.hello" message="Hello World" />;
      `,
  },
  {
    name: "Macro with custom ID (template expression)",
    input: `
        import { Trans } from '@lingui/macro';
        <Trans id={\`msg.hello\`}>Hello World</Trans>;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans id="msg.hello" message="Hello World" />;
      `,
  },
  {
    name: "Macro without children is noop",
    input: `
        import { Trans } from '@lingui/macro';
        <Trans id={msg} />;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans id={msg} />;
      `,
  },
  {
    name: "Variables are converted to named arguments",
    input: `
        import { Trans } from '@lingui/macro';
        <Trans>Hi {yourName}, my name is {myName}</Trans>;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans id="Hi {yourName}, my name is {myName}" values={{
          yourName: yourName,
          myName: myName,
        }} />;
      `,
  },
  {
    name: "Variables are deduplicated",
    input: `
        import { Trans } from '@lingui/macro';
        <Trans>{duplicate} variable {duplicate}</Trans>;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans id="{duplicate} variable {duplicate}" values={{
          duplicate: duplicate
        }} />;
      `,
  },
  {
    name: "Template literals as children",
    input: `
        import { Trans } from '@lingui/macro';
        <Trans>{\`How much is \${expression}? \${count}\`}</Trans>;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans id="How much is {expression}? {count}" values={{
          expression: expression,
          count: count
        }} />;
      `,
  },
  {
    name: "Strings as children are preserved",
    input: `
        import { Trans } from '@lingui/macro';
        <Trans>{"hello {count, plural, one {world} other {worlds}}"}</Trans>;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans id="hello {count, plural, one {world} other {worlds}}" />;
      `,
  },
  {
    name: "Expressions are converted to positional arguments",
    input: `
        import { Trans } from '@lingui/macro';
        <Trans>
          Property {props.name},
          function {random()},
          array {array[index]},
          constant {42},
          object {new Date()},
          everything {props.messages[index].value()}
        </Trans>;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans id="Property {0}, function {1}, array {2}, constant {3}, object {4}, everything {5}" values={{
          0: props.name,
          1: random(),
          2: array[index],
          3: 42,
          4: new Date(),
          5: props.messages[index].value()
        }} />;
      `,
  },
  {
    name: "Elements are replaced with placeholders",
    input: `
        import { Trans } from '@lingui/macro';
        <Trans>
          Hello <strong>World!</strong><br />
          <p>
            My name is <a href="/about">{" "}
            <em>{name}</em></a>
          </p>
        </Trans>;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans id="Hello <0>World!</0><1/><2>My name is <3> <4>{name}</4></3></2>" values={{
          name: name
        }} components={{
          0: <strong />,
          1: <br />,
          2: <p />,
          3: <a href="/about" />,
          4: <em />
        }} />;
      `,
  },
  {
    name: "Elements inside expression container",
    input: `
        import { Trans } from '@lingui/macro';
        <Trans>{<span>Component inside expression container</span>}</Trans>;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans id="<0>Component inside expression container</0>" components={{
          0: <span />
        }} />;
      `,
  },
  {
    name: "Elements without children",
    input: `
        import { Trans } from '@lingui/macro';
        <Trans>{<br />}</Trans>;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans id="<0/>" components={{
          0: <br />
        }} />;
      `,
  },
  {
    name: "JSX spread child is noop",
    input: `
        import { Trans } from '@lingui/macro';
        <Trans>{...spread}</Trans>
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans>{...spread}</Trans>
      `,
  },
  {
    name: "Production - only essential props are kept",
    production: true,
    input: `
        import { Trans } from '@lingui/macro';
        <Trans id="msg.hello" comment="Hello World">Hello World</Trans> 
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans id="msg.hello" />;
      `,
  },
  {
    input: `
        import { Trans } from "@lingui/macro";
        <Trans>
          Strip whitespace around arguments: &quot;
          {name}
          &quot;
        </Trans>
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans id="Strip whitespace around arguments: &quot;{name}&quot;" values={{
          name: name
        }} />;
      `,
  },
  {
    input: `
        import { Trans } from "@lingui/macro";
        <Trans>
          Strip whitespace around tags, but keep{" "}
          <strong>forced spaces</strong>
          !
        </Trans>
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans id="Strip whitespace around tags, but keep <0>forced spaces</0>!" components={{
          0: <strong />
        }} />;
      `,
  },
  {
    input: `
        import { Trans } from "@lingui/macro";
        <Trans>
          Keep forced{"\\n"}
          newlines!
        </Trans>
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans id="Keep forced\\n newlines!" />;
      `,
  },
  {
    input: `
        import { Trans } from "@lingui/macro";
        <Trans>
          Keep multiple{"\\n"}
          forced{"\\n"}
          newlines!
        </Trans>
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans id="Keep multiple\\n forced\\n newlines!" />;
      `,
  },
  {
    input: `
        import { t, plural, Trans } from '@lingui/macro'
        <Trans>Read <a href="/more" title={t\`Full content of \${articleName}\`}>more</a></Trans>
      `,
    expected: `
        import { Trans } from "@lingui/react";
        import { i18n } from "@lingui/core";
        <Trans id="Read <0>more</0>" components={{
          0: <a href="/more" title={
            /*i18n*/
            i18n._("Full content of {articleName}", {
              articleName: articleName
            })
          } />
        }} />;
      `,
  },
  {
    input: `
        import { plural } from '@lingui/macro'
        <a href="/about" title={plural(count, {
          one: "# book",
          other: "# books"
        })}>About</a>
      `,
    expected: `
        import { i18n } from "@lingui/core";
        <a href="/about" title={
          /*i18n*/
          i18n._("{count, plural, one {# book} other {# books}}", {
            count: count
          })
        }>About</a>;
      `,
  },
  {
    name: "Ignore JSXEmptyExpression",
    input: `
        import { Trans } from '@lingui/macro';
        <Trans>Hello {/* and I cannot stress this enough */} World</Trans>;
      `,
    expected: `
        import { Trans } from "@lingui/react";
        <Trans id="Hello  World" />;
      `,
  },
]
