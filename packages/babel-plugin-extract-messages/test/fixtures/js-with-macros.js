import { t, defineMessage, defineMessages } from "@lingui/macro"

t`Message`

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
