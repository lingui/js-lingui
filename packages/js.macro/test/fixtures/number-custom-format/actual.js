import { t } from '@lingui/js.macro'
const i18n = setupI18n()
t`Format in variable ${number(name, currency)}`;
t`One-off format ${number(name, { digits: 4 })}, test format name collision ${number(name, { digits: 2 })}`;
