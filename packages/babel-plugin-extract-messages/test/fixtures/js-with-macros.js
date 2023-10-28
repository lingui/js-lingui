import { t, defineMessage, msg } from "@lingui/macro"

t`Message`

const msg1 = t`Message`

const withDescription = defineMessage({
  message: "Description",
  comment: "description",
})

const withId = defineMessage({
  id: "ID",
  message: "Message with id",
})

const withValues = t`Values ${param}`

const withTId = t({
  id: "ID Some",
  message: "Message with id some",
})

const withTIdBacktick = t({
  id: `Backtick`,
})

const tWithContextA = t({
  id: "Some ID",
  context: "Context1",
})

const tWithContextB = t({
  id: "Some other ID",
  context: "Context1",
})

const defineMessageWithContext = defineMessage({
  id: "Some ID",
  context: "Context2",
})

const defineMessageAlias = msg({
  id: "Some ID",
  context: "Context2",
})

const defineMessageAlias2 = msg`TplLiteral`

const withIdMsg = t('Some Some Id')`Message with id some`
