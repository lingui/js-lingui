// @flow
import plurals from './plurals'

export default (language: string) => {
  return { plurals: plurals[language] }
}

