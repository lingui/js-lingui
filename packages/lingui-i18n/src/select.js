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
}: PluralProps) => {
  const variable = variableName(value)
  const params = {
    [variable]: value[variable]
  }

  const forms = Object.keys(pluralForms).map(key => {
    const formKey = /^\d+$/.test(key) ? `=${key}` : key
    const form = pluralForms[key]

    let message
    if (typeof form === 'object') {
      message = form.message
      Object.assign(params, form.params)
    } else {
      message = form
    }

    return `${formKey} {${message}}`
  })

  if (offset) {
    forms.unshift(`offset:${offset}`)
  }

  const message = `{${variable}, plural, ${forms.join(" ")}}`
  return { message, params, }
}


type SelectProps = {
  value: number
} & {[key: string]: string}

const select = ({
  value,
  ...selectForms
}: SelectProps) => {
  const variable = variableName(value)
  const params = {
    [variable]: value[variable]
  }

  const forms = Object.keys(selectForms)
    .map(key => `${key} {${selectForms[key].toString()}}`)

  const message = `{${variable}, select, ${forms.join(" ")}}`
  return { message, params }
}

export { plural, select }
