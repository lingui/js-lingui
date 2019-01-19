import { t, number } from '@lingui/macro'

t`Format in variable ${number(name, currency)}`;

t`One-off format ${number(name, { digits: 4 })}, test format name collision ${number(name, { digits: 2 })}`;
