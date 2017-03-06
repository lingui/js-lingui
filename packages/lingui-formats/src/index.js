// @flow
import date from './date'
import number from './number'

import createFormat from './createFormat'

export const DateFormat = createFormat(date)
export const NumberFormat = createFormat(number)

export {
  date,
  number
}
