import { t, defineMessage, msg, useLingui, plural } from "@lingui/macro"

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

function MyComponent() {
  const { t } = useLingui()

  t`[useLingui]: TplLiteral`

  // macro nesting
  const a = t`[useLingui]: Text ${plural(users.length, {
    offset: 1,
    0: "No books",
    1: "1 book",
    other: "# books",
  })}`
}
