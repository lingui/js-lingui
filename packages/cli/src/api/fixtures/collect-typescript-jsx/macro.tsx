import { t, defineMessage, plural } from "@lingui/macro"
import { Trans } from "@lingui/react.macro"

// JS Macro usages
const msg = t`Message`

const withDescription = defineMessage({
  message: "Description",
  comment: "description",
})

const withTId = t({
  id: "ID Some",
  message: "Message with id some",
})

// JSX Macro usages
;<Trans>Hi, my name is {name}</Trans>
;<Trans context="Context1">Some message</Trans>
;<span title={t`Title`} />
;<span
  title={plural(count, {
    one: "# book",
    other: "# books",
  })}
/>
