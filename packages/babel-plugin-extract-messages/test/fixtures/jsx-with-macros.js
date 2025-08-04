import { Trans } from "@lingui/react/macro"
import { t, plural } from "@lingui/core/macro"
;<Trans>Hi, my name is {name}</Trans>
;<Trans context="Context1">Some message</Trans>
;<Trans context="Context1">Some other message</Trans>
;<Trans context="Context2">Some message</Trans>
;<span title={t`Title`} />
;<span
  title={plural(count, {
    one: "# book",
    other: "# books",
  })}
/>
