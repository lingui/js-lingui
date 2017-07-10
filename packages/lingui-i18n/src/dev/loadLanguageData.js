// @flow
import plurals from 'make-plural/umd/plurals'

export default (language: string) => {
  return { plurals: plurals[language] }
}
