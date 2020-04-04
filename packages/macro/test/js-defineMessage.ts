export default [
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
        import { i18n } from "@lingui/core";
        const message =
          /*i18n*/
          i18n._("{value, plural, one {book} other {books}}", {}, {
            comment: "Description"
          })
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
        import { i18n } from "@lingui/core";
        const message =
          /*i18n*/
          i18n._("Message")
    `,
  },
  {
    name: "should left string message intact - template literal",
    input: `
        import { defineMessage } from '@lingui/macro';
        const message = defineMessage({
          message: \`Message\`
        })
    `,
    expected: `
        import { i18n } from "@lingui/core";
        const message =
          /*i18n*/
          i18n._(\`Message\`)
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
        import { i18n } from "@lingui/core";
        const message =
          /*i18n*/
          i18n._(
            "msg.id",
            {},
            {
              message: "Message"
            }
          )
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
        import { i18n } from "@lingui/core";
        const message =
          /*i18n*/
          i18n._("Hello {name}", {
            name: name
          })
    `,
  },
]
