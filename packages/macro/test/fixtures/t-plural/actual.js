// `plural` can be imported before `t` without issue
import { plural, t } from '@lingui/macro'

t`There ${plural({
  value: 4,
  one: 'is one light',
  other: 'are # lights'
})}!`