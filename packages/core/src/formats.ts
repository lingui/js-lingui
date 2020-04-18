import { isString } from "./essentials"
import { Locales } from "./i18n"

export function date(
  locales: Locales,
  format: Intl.DateTimeFormatOptions = {}
): (value: string | Date) => string {
  const formatter = new Intl.DateTimeFormat(locales, format)
  return (value) => {
    try {
      if (isString(value)) value = new Date(value)
      return formatter.format(value)
    } catch (error) {
      console.error(`Could not format a date: ${value}`, error)
      return `${value}`;
    }
  }
}

export function number(
  locales: Locales,
  format: Intl.NumberFormatOptions = {}
): (value: number) => string {
  try {
    const formatter = new Intl.NumberFormat(locales, format)
    return (value) => formatter.format(value)
  } catch (error) {
    console.error(`Could not create number formatter of style ${format.style}`, error)
    return (value) => `${value}`;
  }
}
