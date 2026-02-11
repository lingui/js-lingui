import { macroTester } from "./macroTester"
import { makeConfig } from "@lingui/conf"

describe.skip("", () => {})

macroTester({
  cases: [
    {
      name: "Macro is used in expression assignment",
      code: `
        import { t } from '@lingui/core/macro';
        const a = t\`Expression assignment\`;
    `,
    },
    {
      name: "Macro is used in call expression",
      code: `
        import { t } from '@lingui/core/macro';
        const msg = message.error(t({message: "dasd"}))
    `,
    },
    {
      name: "t`` macro could be renamed",
      code: `
        import { t as t2 } from '@lingui/core/macro';
        const a = t2\`Expression assignment\`;
    `,
    },
    {
      name: "Macro is used in expression assignment, with custom lingui instance",
      code: `
        import { t } from '@lingui/core/macro';
        import { customI18n } from './lingui';
        const a = t(customI18n)\`Expression assignment\`;
    `,
    },
    {
      name: "Variables are replaced with named arguments",
      code: `
        import { t } from '@lingui/core/macro';
        t\`Variable \${name}\`;
    `,
    },
    {
      name: "Variables with escaped template literals are correctly formatted",
      code: `
        import { t } from '@lingui/core/macro';
        t\`Variable \\\`\${name}\\\`\`;
    `,
    },
    {
      name: "Variables with escaped double quotes are correctly formatted",
      code: `
        import { t } from '@lingui/core/macro';
        t\`Variable "name"\`;
    `,
    },
    {
      name: "Variables should be deduplicated",
      code: `
        import { t } from '@lingui/core/macro';
        t\`\${duplicate} variable \${duplicate}\`;
    `,
    },
    {
      name: "Anything variables except simple identifiers are used as positional arguments",
      code: `
        import { t } from '@lingui/core/macro';
        t\`\
 Property \${props.name},\
 function \${random()},\
 array \${array[index]},\
 constant \${42},\
 object \${new Date()}\
 anything \${props.messages[index].value()}\
\`
`,
    },
    {
      name: "Variables with explicit label",
      code: `
        import { t } from '@lingui/core/macro';
      
        t\`Variable \${{name: random()}}\`;
    `,
    },
    {
      name: "Variables with explicit label, shortcut syntax",
      code: `
        import { t } from '@lingui/core/macro';
      
        t\`Variable \${{name}}\`;
    `,
    },
    {
      name: "Variables with explicit ph helper",
      code: `
        import { t, ph } from '@lingui/core/macro';
     
        t\`Variable \${ph({name: random()})}\`;
    `,
    },
    {
      useTypescriptPreset: true,
      name: "Variables with `as` type casting",
      code: `
        import { t } from '@lingui/core/macro';
     
        t\`Variable \${{name} as any}\`;
    `,
    },
    {
      name: "Variables with arg macro is not wrapped in curly brackets",
      code: `
        import { t, arg } from '@lingui/core/macro';
        t\`Number {\${arg(num)}, number, myNumberStyle}\`;
      `,
    },
    {
      name: "Variables with arg macro supports named placeholders syntax",
      code: `
        import { t, arg, ph } from '@lingui/core/macro';
        t\`Number {\${arg({num: getNum()})}, number, myNumberStyle}\`;
        t\`Number {\${arg(ph({num: getNum()}))}, number, myNumberStyle}\`;
      `,
    },
    {
      name: "Newlines are preserved",
      code: `
        import { t } from '@lingui/core/macro';
        t\`Multiline
          string\`
      `,
    },
    {
      name: "Support template strings in t macro message",
      code: `
        import { t } from '@lingui/core/macro'
        const msg = t({ message: \`Hello \${name}\` })
      `,
    },
    {
      name: "Support template strings in t macro message, with custom i18n instance",
      code: `
        import { t } from '@lingui/core/macro'
        import { i18n } from './lingui'
        const msg = t(i18n)({ message: \`Hello \${name}\` })
      `,
    },
    {
      name: "Support template strings in t macro message, with custom i18n instance object property",
      code: `
        import { t } from '@lingui/core/macro'
        const msg = t(global.i18n)({ message: \`Hello \${name}\` })
      `,
    },
    {
      name: "Should generate different id when context provided",
      code: `
        import { t } from '@lingui/core/macro'
        t({ message: "Hello" })
        t({ message: "Hello", context: "my custom" })
      `,
    },
    {
      name: "Context might be passed as template literal",
      code: `
        import { t } from '@lingui/core/macro'
        t({ message: "Hello", context: "my custom" })
        t({ message: "Hello", context: \`my custom\` })
      `,
    },
    {
      name: "Support id and comment in t macro as callExpression",
      code: `
        import { t, plural } from '@lingui/core/macro'
        const msg = t({ id: 'msgId', comment: 'description for translators', message: plural(val, { one: '...', other: '...' }) })
      `,
    },
    {
      name: "Support id with message interpolation",
      code: `
        import { t } from '@lingui/core/macro'
        const msg = t({ id: 'msgId', message: \`Some \${value}\` })
      `,
    },
    {
      name: "Support id in template literal",
      code: `
        import { t } from '@lingui/core/macro'
        const msg = t({ id: \`msgId\` })
      `,
    },
    {
      name: "Should not crash when a variable passed",
      code: `
        import { t } from '@lingui/core/macro'
        const msg = t(msg)
      `,
    },
    {
      name: "should not crash when no params passed",
      code: `
        import { t } from '@lingui/core/macro'
        const msg = t()
      `,
    },
    {
      name: "stripMessageField option - message prop is removed if stripMessageField: true",
      macroOpts: {
        stripMessageField: true,
      },
      code: `
          import { t } from '@lingui/macro'
          const msg = t\`Message\`
        `,
    },
    {
      name: "Production - only essential props are kept",
      production: true,
      code: `
      import { t } from '@lingui/core/macro';
      const msg = t\`Message\`
    `,
    },
    {
      name: "Production - only essential props are kept, with plural, with custom i18n instance",
      production: true,
      code: `
      import { t, plural } from '@lingui/core/macro';
      const msg = t({
        id: 'msgId',
        comment: 'description for translators',
        context: 'some context',
        message: plural(val, { one: '...', other: '...' })
      })
    `,
    },
    {
      name: "Production - only essential props are kept, with custom i18n instance",
      production: true,
      code: `
        import { t } from '@lingui/core/macro';
        import { i18n } from './lingui';
        const msg = t(i18n)({
            message: \`Hello \${name}\`,
            id: 'msgId',
            comment: 'description for translators',
            context: 'My Context',
        })
    `,
    },
    {
      name: "Production - only essential props are kept",
      production: true,
      code: `
        import { t } from '@lingui/core/macro';
        const msg = t({
            message: \`Hello \${name}\`,
            id: 'msgId',
            comment: 'description for translators',
            context: 'My Context',
        })
    `,
    },
    {
      name: "Production - message prop is kept if stripMessageField: false",
      production: true,
      macroOpts: {
        stripMessageField: false,
      },
      code: `
          import { t } from '@lingui/macro';
          const msg = t({
              message: \`Hello \${name}\`,
              id: 'msgId',
              comment: 'description for translators',
              context: 'My Context',
          })
      `,
    },
    {
      name: "Production - all props kept if extract: true",
      production: true,
      macroOpts: {
        extract: true,
      },
      code: `
        import { t } from '@lingui/core/macro';
        const msg = t({
            message: \`Hello \${name}\`,
            id: 'msgId',
            comment: 'description for translators',
            context: 'My Context',
        })
    `,
    },
    {
      name: "Newlines after continuation character are removed",
      filename: "js-t-continuation-character.js",
    },
    {
      filename: "js-t-var/js-t-var.js",
    },
    {
      name: "Support t in t",
      code: `
        import { t } from '@lingui/core/macro'
        t\`Field \${t\`First Name\`} is required\`
      `,
    },
    {
      name: "should correctly process nested macro when referenced from different imports",
      code: `
        import { t } from '@lingui/core/macro'
        import { plural } from '@lingui/core/macro'
        t\`Ola! \${plural(count, {one: "1 user", many: "# users"})} is required\`
      `,
    },
    {
      name: "should correctly process nested macro when referenced from different imports 2",
      code: `
        import { t as t1, plural as plural1 } from '@lingui/core/macro'
        import { plural as plural2, t as t2 } from '@lingui/core/macro'
        t1\`Ola!  \${plural2(count, {one: "1 user", many: "# users"})} Ola!\`
        t2\`Ola! \${plural1(count, {one: "1 user", many: "# users"})} Ola!\`
      `,
    },
    {
      name: "should respect runtimeConfigModule",
      macroOpts: {
        linguiConfig: makeConfig(
          {
            runtimeConfigModule: {
              i18n: ["@my/lingui", "myI18n"],
            },
          },
          { skipValidation: true }
        ),
      },
      code: `
         import { t } from '@lingui/macro'
         const msg = t\`Message\`
      `,
    },
    {
      name: "should detects macro imported from config.macro.corePackage",
      macroOpts: {
        linguiConfig: makeConfig(
          {
            macro: {
              corePackage: ["@my-lingui/macro"],
            },
          },
          { skipValidation: true }
        ),
      },
      skipBabelMacroTest: true,
      code: `
         import { t } from '@my-lingui/macro'
         const msg = t\`Message\`
      `,
    },
  ],
})
