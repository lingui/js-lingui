// @flow
import React from 'react'
import WithI18n from './WithI18n'
import type { WithI18nProps } from './WithI18n'

import type { RenderProps } from './Render'
import Render from './Render'

type PluralProps = {
  value: number | string,
  offset?: number | string,
  zero?: any,
  one?: any,
  two?: any,
  few?: any,
  many?: any,
  other: any,
} & WithI18nProps & RenderProps

type SelectProps = {
  value: any,
  other: any,
} & WithI18nProps & RenderProps

const Select = WithI18n()(class Select extends React.Component<*, SelectProps, *> {
  props: SelectProps

  render () {
    const { className, render, i18n, ...selectProps } = this.props
    return <Render className={className} render={render}>{i18n.select(selectProps)}</Render>
  }
})

const PluralFactory = (ordinal = false) => {
  const displayName = !ordinal ? 'Plural' : 'SelectOrdinal'
  const pluralType = !ordinal ? 'plural' : 'selectOrdinal'

  return class extends React.Component<*, PluralProps, *> {
    displayName = displayName

    props: PluralProps

    static defaultProps = {
      offset: 0
    }

    render () {
      const { className, render, i18n, value, offset, ...props } = this.props

      // i18n.selectOrdinal/plural uses numbers for exact matches (1, 2),
      // while SelectOrdinal/Plural has to use strings (_1, _2).
      const pluralProps = Object.keys(props).reduce((acc, prop) => {
        const key = prop.replace('_', '')
        acc[key] = props[prop]
        return acc
      }, {
        value: parseInt(value),
        offset: parseInt(offset)
      })

      return (
        <Render className={className} render={render}>
          {i18n[pluralType](pluralProps)}
        </Render>
      )
    }
  }
}

const Plural = WithI18n()(PluralFactory(false))
const SelectOrdinal = WithI18n()(PluralFactory(true))

export { Plural, SelectOrdinal, Select }
export type { PluralProps }
