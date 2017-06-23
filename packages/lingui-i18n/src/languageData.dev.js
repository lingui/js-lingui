// @flow

// $FlowIgnore: Missing annotation
import MakePlural from 'make-plural/make-plural'
MakePlural.load(
  // $FlowIgnore: Missing annotation - only json
  require('make-plural/data/plurals.json'),
  // $FlowIgnore: Missing annotation - only json
  require('make-plural/data/ordinals.json')
)

export const loadLanguageData = (language: string) => {
  const plurals = new MakePlural(language, {
    cardinals: true,
    ordinals: true
  })

  return { plurals }
}
