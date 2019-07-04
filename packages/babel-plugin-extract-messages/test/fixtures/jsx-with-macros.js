import { t, plural, Trans } from "@lingui/macro"

;<Trans>Hi, my name is {name}</Trans>
;<span title={t`Title`} />
;<span
  title={plural(count, {
    one: "# book",
    other: "# books"
  })}
/>
