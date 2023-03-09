import { TestCase } from "./index"

const cases: TestCase[] = [
  {
    name: "defineMessage should support template literal",
    input: `
        import { defineMessage } from '@lingui/macro';
        const message = defineMessage\`Message\`
    `,
    expected: `
        const message =
          /*i18n*/
          {
            id: "xDAtGP",
            message: "Message",
          };
    `,
  },
  {
    name: "defineMessage can be called by alias `msg`",
    input: `
        import { msg } from '@lingui/macro';
        const message1 = msg\`Message\`
        const message2 = msg({message: "Message"})
    `,
    expected: `
        const message1 =
          /*i18n*/
          {
            id: "xDAtGP",
            message: "Message",
          };
        const message2 =
          /*i18n*/
          {
            message: "Message",
            id: "xDAtGP",
          };
    `,
  },
  {
    name: "should expand macros in message property",
    input: `
        import { defineMessage, plural, arg } from '@lingui/macro';
        const message = defineMessage({
          comment: "Description",
          message: plural(arg("value"), { one: "book", other: "books" })
        })
    `,
    expected: `
        const message =
          /*i18n*/
          {
            message: "{value, plural, one {book} other {books}}",
            id: "SlmyxX",
            comment: "Description",
          };
    `,
  },
  {
    name: "defineMessage macro could be renamed",
    input: `
        import { defineMessage as defineMessage2, plural as plural2 } from '@lingui/macro';
        const message = defineMessage2({
          comment: "Description",
          message: plural2(value, { one: "book", other: "books" })
        })
    `,
    expected: `
        const message =
          /*i18n*/
          {
            values: {
              value: value,
            },
            message: "{value, plural, one {book} other {books}}",
            id: "SlmyxX",
            comment: "Description",
          };
    `,
  },
  {
    name: "should left string message intact",
    input: `
        import { defineMessage } from '@lingui/macro';
        const message = defineMessage({
          message: "Message"
        })
    `,
    expected: `
        const message =
          /*i18n*/
          {
            message: "Message",
            id: "xDAtGP",
          };
    `,
  },
  {
    name: "should transform template literals",
    input: `
        import { defineMessage } from '@lingui/macro';
        const message = defineMessage({
          message: \`Message \${name}\`
        })
    `,
    expected: `
        const message =
          /*i18n*/
          {
            values: {
              name: name
            },
            message: "Message {name}",
            id: "A2aVLF",
          };
    `,
  },
  {
    name: "should preserve custom id",
    input: `
        import { defineMessage } from '@lingui/macro';
        const message = defineMessage({
          id: "msg.id",
          message: "Message"
        })
    `,
    expected: `
        const message =
          /*i18n*/
          {
            id: "msg.id",
            message: "Message"
          };
    `,
  },
  {
    name: "Production - only essential props are kept, without id",
    production: true,
    input: `
        import { defineMessage } from '@lingui/macro';
        const msg = defineMessage({
            message: \`Hello $\{name\}\`,
            comment: 'description for translators',
            context: 'My Context',
        })
    `,
    expected: `
        const msg =
          /*i18n*/
          {
            values: {
              name: name,
            },
            id: "oT92lS",
         };
    `,
  },
  {
    name: "Production - only essential props are kept",
    production: true,
    input: `
        import { defineMessage } from '@lingui/macro';
        const msg = defineMessage({
            message: \`Hello $\{name\}\`,
            id: 'msgId',
            comment: 'description for translators',
            context: 'My Context',
        })
    `,
    expected: `
        const msg =
          /*i18n*/
          {
            id: 'msgId',
            values: {
              name: name,
            },
         };
    `,
  },
  {
    name: "should preserve values",
    input: `
        import { defineMessage } from '@lingui/macro';
        const message = defineMessage({
          message: t\`Hello $\{name\}\`
        })
    `,
    expected: `
        const message =
          /*i18n*/
          {
            values: {
              name: name
            },
            message: "Hello {name}",
            id: "OVaF9k",
          };
    `,
  },
]

export default cases
