/* @flow */
import { variableName } from './variables'

type ExactPluralForms = { [key: number]: string }

type PluralForms = {
  zero: string,
  one: string,
  few: string,
  many: string,
  others: string
}

type PluralProps = {
  value: number,
  offset: number
} & PluralForms & ExactPluralForms

const plural = ({
  value,
  offset,
  ...pluralForms
}: PluralProps) => ({
  toString() {
    const forms = Object.keys(pluralForms).map(key => {
        const formKey = /^\d+$/.test(key) ? `=${key}` : key
        return `${formKey} {${pluralForms[key].toString()}}`
      })

    if (offset) {
      forms.unshift(`offset:${offset}`)
    }

    return `{${variableName(value)}, plural, ${forms.join(" ")}`
  }
})


type SelectProps = {
  value: number
} & {[key: string]: string}

const select = ({
  value,
  ...selectForms
}: SelectProps) => ({
  toString() {
    const forms = Object.keys(selectForms)
      .map(key => `${key} {${selectForms[key].toString()}}`)

    return `{${variableName(value)}, select, ${forms.join(" ")}`
  }
})

export { plural, select }
