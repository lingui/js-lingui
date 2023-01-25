import { TestCase } from "./index"

const cases: TestCase[] = [
  {
    name: "Macro is used in expression assignment",
    input: `
        import { t } from '@lingui/macro';
        const a = t\`Expression assignment\`;
    `,
    expected: `
        import { i18n } from "@lingui/core";
        const a = /*i18n*/  i18n._("Expression assignment")
    `,
  },
  {
    name: "Macro is used in expression assignment, with custom lingui instance",
    input: `
        import { t } from '@lingui/macro';
        import { i18n } from './lingui';
        const a = t(i18n)\`Expression assignment\`;
    `,
    expected: `
        import { i18n } from './lingui';
        const a = /*i18n*/ i18n._("Expression assignment")
    `,
  },
  {
    name: "Variables are replaced with named arguments",
    input: `
        import { t } from '@lingui/macro';
        t\`Variable \${name}\`;
    `,
    expected: `
        import { i18n } from "@lingui/core";
        /*i18n*/ i18n._("Variable {name}", {
          name: name
        })
    `,
  },
  {
    name: "Variables with scaped template literals are correctly formatted",
    input: `
        import { t } from '@lingui/macro';
        t\`Variable \\\`\${name}\\\`\`;
    `,
    expected: `
        import { i18n } from "@lingui/core";
        /*i18n*/ i18n._("Variable \`{name}\`", {
          name: name
        })
    `,
  },
  {
    name: "Variables with scaped double quotes are correctly formatted",
    input: `
        import { t } from '@lingui/macro';
        t\`Variable \"name\" \`;
    `,
    expected: `
        import { i18n } from "@lingui/core";
        /*i18n*/ i18n._("Variable \\"name\\"")
    `,
  },
  {
    name: "Variables should be deduplicated",
    input: `
        import { t } from '@lingui/macro';
        t\`\${duplicate} variable \${duplicate}\`;
    `,
    expected: `
        import { i18n } from "@lingui/core";
        /*i18n*/ i18n._("{duplicate} variable {duplicate}", {
          duplicate: duplicate
        })
    `,
  },
  {
    name: "Anything variables except simple identifiers are used as positional arguments",
    input: `
        import { t } from '@lingui/macro';
        t\`
          Property \${props.name},\\
          function \${random()},\\
          array \${array[index]},\\
          constant \${42},\\
          object \${new Date()}\\
          anything \${props.messages[index].value()}
        \`
    `,
    expected: `
        import { i18n } from "@lingui/core";
        /*i18n*/ i18n._(
          "Property {0}, function {1}, array {2}, constant {3}, object {4} anything {5}", {
            0: props.name,
            1: random(),
            2: array[index],
            3: 42,
            4: new Date(),
            5: props.messages[index].value()
          }
        );
    `,
  },
  {
    name: "Newlines are preserved",
    input: `
        import { t } from '@lingui/macro';
        t\`Multiline
          string\`
      `,
    expected: `
        import { i18n } from "@lingui/core";
        /*i18n*/ i18n._("Multiline\\nstring")
      `,
  },
  {
    name: "Support template strings in t macro message",
    input: `
        import { t } from '@lingui/macro'
        const msg = t({ message: \`Hello \${name}\` })
      `,
    expected: `import { i18n } from "@lingui/core";
    const msg =
      i18n._(/*i18n*/
        {
          id: "Hello {name}",
          values: {
            name: name,
          },
        });
      `,
  },
  {
    name: "Support template strings in t macro message, with custom i18n instance",
    input: `
        import { t } from '@lingui/macro'
        import { i18n } from './lingui'
        const msg = t(i18n)({ message: \`Hello \${name}\` })
      `,
    expected: `import { i18n } from "./lingui";
    const msg =
      i18n._(/*i18n*/
        {
          id: "Hello {name}",
          values: {
            name: name,
          },
        });
      `,
  },
  {
    name: "Support id and comment in t macro as callExpression",
    input: `
        import { t } from '@lingui/macro'
        const msg = t({ id: 'msgId', comment: 'description for translators', message: plural(val, { one: '...', other: '...' }) })
      `,
    expected: `import { i18n } from "@lingui/core";
    const msg =
      i18n._(/*i18n*/
        {
          id: "msgId",
          comment: "description for translators",
          message: "{val, plural, one {...} other {...}}",
          values: {
            val: val,
          },
        });
      `,
  },
  {
    name: "Support id with message interpolation",
    input: `
        import { t } from '@lingui/macro'
        const msg = t({ id: 'msgId', message: \`Some \${value}\` })
      `,
    expected: `import { i18n } from "@lingui/core";
    const msg =
      i18n._(/*i18n*/
        {
          id: "msgId",
          message: "Some {value}",
          values: {
            value: value,
          },
        });
      `,
  },
  {
    name: "Support id in template literal",
    input: `
        import { t } from '@lingui/macro'
        const msg = t({ id: \`msgId\` })
      `,
    expected: `import { i18n } from "@lingui/core";
    const msg =
      i18n._(/*i18n*/
        {
          id: \`msgId\`
        });
      `,
  },
  {
    name: "Production - only essential props are kept, with plural, with custom i18n instance",
    production: true,
    input: `
      import { t } from '@lingui/macro';
      const msg = t({
        id: 'msgId',
        comment: 'description for translators',
        context: 'some context',
        message: plural(val, { one: '...', other: '...' })
      })
    `,
    expected: `
      import { i18n } from "@lingui/core";
      const msg =
      i18n._(/*i18n*/
      {
        id: "msgId",
        context: "some context",
        values: {
          val: val,
        },
      });
    `,
  },
  {
    name: "Production - only essential props are kept, with custom i18n instance",
    production: true,
    input: `
        import { t } from '@lingui/macro';
        import { i18n } from './lingui';
        const msg = t(i18n)({
            message: \`Hello $\{name\}\`,
            id: 'msgId',
            comment: 'description for translators',
            context: 'My Context',
        })
    `,
    expected: `
        import { i18n } from "./lingui";
        const msg =
        i18n._(/*i18n*/
          {
            id: 'msgId',
            context: 'My Context',
            values: {
              name: name,
            },
         });
    `,
  },
  {
    name: "Production - only essential props are kept",
    production: true,
    input: `
        import { t } from '@lingui/macro';
        const msg = t({
            message: \`Hello $\{name\}\`,
            id: 'msgId',
            comment: 'description for translators',
            context: 'My Context',
        })
    `,
    expected: `
        import { i18n } from "@lingui/core";
        const msg =
        i18n._(/*i18n*/
          {
            id: 'msgId',
            context: 'My Context',
            values: {
              name: name,
            },
         });
    `,
  },
  {
    name: "Production - all props kept if extract: true",
    production: true,
    macroOpts: {
      extract: true,
    },
    input: `
        import { t } from '@lingui/macro';
        const msg = t({
            message: \`Hello $\{name\}\`,
            id: 'msgId',
            comment: 'description for translators',
            context: 'My Context',
        })
    `,
    expected: `
        import { i18n } from "@lingui/core";
        const msg =
        i18n._(/*i18n*/
          {
            message: "Hello {name}",
            id: 'msgId',
            comment: "description for translators",
            context: 'My Context',
            values: {
              name: name,
            },
         });
    `,
  },
  {
    name: "Newlines after continuation character are removed",
    filename: "js-t-continuation-character.js",
  },
  {
    filename: "js-t-var/js-t-var.js",
  },
]

export default cases
