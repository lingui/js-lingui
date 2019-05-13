import { t, plural, Trans } from "@lingui/macro"

;<Trans>Hi, my name is {name}</Trans>
;<span title={i18n._(t`Title`)} />
;<span
  title={i18n._(plural(count, {
    one: "# book",
    other: "# books"
  }))}
/>

const a = i18n._(t`Title`)
i18n._(t`Title`)

const p = i18n._(plural(count, {
  one: "# book",
  other: "# books"
}))
i18n._(plural(count, {
  one: "# book",
  other: "# books"
}))
