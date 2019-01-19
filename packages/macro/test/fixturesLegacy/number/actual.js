import { t } from '@lingui/macro'

t`The answer is ${t.number(name)}`;

t`The interest rate is ${t.number(interest.rate, 'percent')}`;
