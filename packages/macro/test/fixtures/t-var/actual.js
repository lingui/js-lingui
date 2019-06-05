import { t } from '@lingui/macro'

function scoped(foo) {
  if (foo) {
    const bar = 50;
    t`This is bar ${bar}`
  } else {
    const bar = 10;
    t`This is a different bar ${bar}`
  }
}