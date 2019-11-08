// @flow
import * as React from "react"
import type { Locales } from "@lingui/core"
import withI18n from "./withI18n"
import type { withI18nProps } from "./withI18n"

import type { RenderProps } from "./Render"
import Render from "./Render"

type PluralProps = {
  value: number | string,
  offset?: number | string,
  zero?: any,
  one?: any,
  two?: any,
  few?: any,
  many?: any,
  other: any,
  locales?: Locales
} & withI18nProps &
  RenderProps

type SelectProps = {
  value: any,
  other: any
} & withI18nProps &
  RenderProps

const Select = withI18n()(
  class Select extends React.Component<*, SelectProps> {
    props: SelectProps

    render() {
      // lingui-transform-js transforms also this file in react-native env.
      // i18n must be aliased to _i18n to hide i18n.select call from plugin,
      // otherwise it throws "undefined is not iterable" obscure error.
      const { className, render, i18n: _i18n, ...selectProps } = this.props
      return (
        <Render
          className={className}
          render={render}
          value={_i18n.select(selectProps)}
        />
      )
    }
  }
)

const PluralFactory = (ordinal = false) => {
  const displayName = !ordinal ? "Plural" : "SelectOrdinal"

  return class extends React.Component<*, PluralProps> {
    displayName = displayName

    props: PluralProps

    static defaultProps = {
      offset: 0
    }

    render() {
      const { className, render, i18n, value, offset, ...props } = this.props
      const getPluralValue = !ordinal ? i18n.plural : i18n.selectOrdinal

      // i18n.selectOrdinal/plural uses numbers for exact matches (1, 2),
      // while SelectOrdinal/Plural has to use strings (_1, _2).
      const pluralProps = Object.keys(props).reduce(
        (acc, prop) => {
          const key = prop.replace("_", "")
          acc[key] = props[prop]
          return acc
        },
        {
          value: Number(value),
          offset: Number(offset)
        }
      )

      return (
        <Render
          className={className}
          render={render}
          value={getPluralValue(pluralProps)}
        />
      )
    }
  }
}

const Plural = withI18n()(PluralFactory(false))
const SelectOrdinal = withI18n()(PluralFactory(true))

export { Plural, SelectOrdinal, Select }
export type { PluralProps }
