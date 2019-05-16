export default [
  {
    name: "should expand macros in message property",
    input: `
        import { defineMessage, plural } from '@lingui/macro';
        const message = defineMessage({
          id: "msg.id",
          comment: "Description",
          message: plural("value", { one: "book", other: "books" })
        })
    `,
    expected: `
        const message = /*i18n*/
        {
          id: "msg.id",
          comment: "Description",
          message: "{value, plural, one {book} other {books}}"
        }
    `
  },
  {
    name: "should left string message intact",
    input: `
        import { defineMessage } from '@lingui/macro';
        const message = defineMessage({
          id: "msg.id",
          comment: "Description",
          message: "Message"
        })
    `,
    expected: `
        const message = /*i18n*/
        {
          id: "msg.id",
          comment: "Description",
          message: "Message"
        }
    `
  },
  {
    name: "should left string message intact - template literal",
    input: `
        import { defineMessage } from '@lingui/macro';
        const message = defineMessage({
          id: "msg.id",
          comment: "Description",
          message: \`Message\`
        })
    `,
    expected: `
        const message = /*i18n*/
        {
          id: "msg.id",
          comment: "Description",
          message: \`Message\`
        }
    `
  },
  {
    name: "should use message as id",
    input: `
        import { defineMessage } from '@lingui/macro';
        const message = defineMessage({
          comment: "Description",
          message: \`Message\`
        })
    `,
    expected: `
        const message = /*i18n*/
        {
          comment: "Description",
          id: \`Message\`,
        }
    `
  }
]
