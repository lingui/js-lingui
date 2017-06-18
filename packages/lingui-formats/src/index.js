// @flow
import date from './date'
import number from './number'

import { silentCreateFormat } from './createFormat'

export const DateFormat = silentCreateFormat(date)
export const NumberFormat = silentCreateFormat(number)

export {
  date,
  number
}
