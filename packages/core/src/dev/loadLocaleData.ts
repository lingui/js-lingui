import * as plurals from "make-plural/plurals"

export default (locale: string) => {
  if (!locale) {
    return
  }

  const [language] = locale.split(/[_-]/)
  return { plurals: plurals[language] }
}
