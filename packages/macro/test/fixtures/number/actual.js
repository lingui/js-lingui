import { t, number } from '@lingui/macro'

t`The answer is ${number(name)}`;

t`The interest rate is ${number(interest.rate, 'percent')}`;
