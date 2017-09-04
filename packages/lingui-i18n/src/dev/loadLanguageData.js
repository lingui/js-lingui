// @flow
import plurals from 'make-plural/umd/plurals'

export default (locale: string) => {
  if (!locale) {
    return
  }

  const [language] = locale.split('_')
  return { plurals: plurals[language] }
}
