export default [
  {
    name: "should expand macros",
    input: `
        import { defineMessages } from '@lingui/macro';
        const messages = defineMessages({
          hello: t\`Hello World\`,
          plural: plural("value", { one: "book", other: "books" })
        })
    `,
    expected: `
        import { Messages } from '@lingui/core';
        const messages = Messages.from({
          hello: 
            /*i18n*/
            "Hello World",
          plural:
            /*i18n*/
            "{value, plural, one {book} other {books}}",
        })
    `
  },
  {
    name: "should expand macros inside descriptor",
    input: `
        import { defineMessages } from '@lingui/macro';
        const messages = defineMessages({
          plural: {
            id: "msg.id",
            comment: "Description",
            message: plural("value", { one: "book", other: "books" })
          }
        })
    `,
    expected: `
        import { Messages } from '@lingui/core';
        const messages = Messages.from({
          plural: 
            /*i18n*/
            {
              id: "msg.id",
              comment: "Description",
              message: "{value, plural, one {book} other {books}}"
            }
        })
    `
  }
]
