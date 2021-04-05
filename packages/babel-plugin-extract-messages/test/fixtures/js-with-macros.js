import { t, defineMessage } from "@lingui/macro"

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

const withTId = t({
  id: "ID Some",
  message: "Message with id some"
})

const withTIdBacktick = t({
  id: `Backtick`
})

const id = 'message id'

const withUnknownId = t({
  id: id
})
