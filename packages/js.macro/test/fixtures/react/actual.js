import { t, plural } from '@lingui/js.macro'
const i18n = setupI18n();
t`Full content of ${articleName}`;
<Trans>Read <a href="/more" title={t`Full content of ${articleName}`}>more</a></Trans>;
<a href="/about" title={plural({
  value: count,
  one: "# book",
  other: "# books"
})}>About</a>;
