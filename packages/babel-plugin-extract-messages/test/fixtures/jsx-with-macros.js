import { t, plural, Trans } from "@lingui/macro"

;<Trans>Hi, my name is {name}</Trans>
;<Trans context="Context1">Some message</Trans>
;<Trans context="Context1">Some other message</Trans>
;<Trans context="Context2">Some message</Trans>
;<span title={t`Title`} />
;<span
  title={plural(count, {
    one: "# book",
    other: "# books"
  })}
/>
