import { t } from '@lingui/js.macro'
const i18n = setupI18n()
t`The answer is ${number(name)}`;
t`The interest rate is ${number(interest.rate, 'percent')}`;
