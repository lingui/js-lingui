import { t, Trans } from '@lingui/macro'

const T = <Trans>Read <a href="/more" title={t`Full content of ${articleName}`}>more</a></Trans>

const P = <a href="/about" title={t.plural({
  value: count,
  one: "# book",
  other: "# books"
})}>About</a>
