import { Trans } from "lingui-react"

;<Trans>Hi, my name is {name}</Trans>
;<span title={i18n.t`Title`} />
;<span
  title={i18n.plural({
    value: count,
    one: "# book",
    other: "# books"
  })}
/>

const a = i18n.t`Title`
i18n.t`Title`

const p = i18n.plural({
  value: count,
  one: "# book",
  other: "# books"
})
i18n.plural({
  value: count,
  one: "# book",
  other: "# books"
})
