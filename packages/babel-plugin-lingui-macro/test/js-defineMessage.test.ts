import { macroTester } from "./macroTester"

macroTester({
  cases: [
    {
      name: "defineMessage should support template literal",
      code: `
        import { defineMessage } from '@lingui/core/macro';
        const message = defineMessage\`Message\`
    `,
    },
    {
      name: "defineMessage can be called by alias `msg`",
      code: `
        import { msg } from '@lingui/core/macro';
        const message1 = msg\`Message\`
        const message2 = msg({message: "Message"})
    `,
    },
    {
      name: "should expand macros in message property",
      code: `
        import { defineMessage, plural, arg } from '@lingui/core/macro';
        const message = defineMessage({
          comment: "Description",
          message: plural(value, { one: "book", other: "books" })
        })
    `,
    },
    {
      name: "defineMessage macro could be renamed",
      code: `
        import { defineMessage as defineMessage2, plural as plural2 } from '@lingui/core/macro';
        const message = defineMessage2({
          comment: "Description",
          message: plural2(value, { one: "book", other: "books" })
        })
    `,
    },
    {
      name: "should left string message intact",
      code: `
        import { defineMessage } from '@lingui/core/macro';
        const message = defineMessage({
          message: "Message"
        })
    `,
    },
    {
      name: "should transform template literals",
      code: `
        import { defineMessage } from '@lingui/core/macro';
        const message = defineMessage({
          message: \`Message \${name}\`
        })
    `,
    },
    {
      name: "should preserve custom id",
      code: `
        import { defineMessage } from '@lingui/core/macro';
        const message = defineMessage({
          id: "msg.id",
          message: "Message"
        })
    `,
    },
    {
      name: "Production - only essential props are kept, without id",
      production: true,
      code: `
        import { defineMessage } from '@lingui/core/macro';
        const msg = defineMessage({
            message: \`Hello $\{name\}\`,
            comment: 'description for translators',
            context: 'My Context',
        })
    `,
    },
    {
      name: "Production - only essential props are kept",
      production: true,
      code: `
        import { defineMessage } from '@lingui/core/macro';
        const msg = defineMessage({
            message: \`Hello $\{name\}\`,
            id: 'msgId',
            comment: 'description for translators',
            context: 'My Context',
        })
    `,
    },
    {
      name: "should preserve values",
      code: `
        import { defineMessage, t } from '@lingui/core/macro';
        const message = defineMessage({
          message: t\`Hello $\{name\}\`
        })
    `,
    },
  ],
})
