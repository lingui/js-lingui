import { t, defineMessage, defineMessages } from "@lingui/macro"

i18n._(t`Message`)

const msg = t`Message`

const withDescription = defineMessage({
  message: 'Description',
  comment: "description"
})

const withId = defineMessage({
  id: 'ID',
  message: 'Message with id'
})

const withValues = t`Values ${param}`

const definedMessages = defineMessages({
  string: "defineMessages - string",
  descriptor: {
    id: "defineMessages - descriptor",
    comment: "Descriptor with comment"
  }
})
