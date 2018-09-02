// @flow

import R from "ramda"
import pseudolocale from "pseudolocale"

const delimiter = "%&&&%"
/*
Regex should match HTML tags
It was taken from https://haacked.com/archive/2004/10/25/usingregularexpressionstomatchhtml.aspx/
Example: https://regex101.com/r/bDHD9z/3
*/
const HTMLRegex = /<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/g
/*
Regex should match js-lingui plurals
Example: https://regex101.com/r/zXWiQR/3
*/
const PluralRegex = /{\w*,\s*plural,\s*\w*\s*{|}\s*\w*\s*({|})/g
/*
Regex should match js-lingui variables
Example: https://regex101.com/r/kD7K2b/1
*/
const VariableRegex = /({|})/g

let isPseudoLocalizeOptionSet = false

function addDelimitersHTMLTags(message) {
  return message.replace(HTMLRegex, matchedString => {
    return `${delimiter}${matchedString}${delimiter}`
  })
}

function addDelimitersPlural(message) {
  return message.replace(PluralRegex, matchedString => {
    return `${delimiter}${matchedString}${delimiter}`
  })
}

function addDelimitersVariables(message) {
  return message.replace(VariableRegex, matchedString => {
    return `${delimiter}${matchedString}${delimiter}`
  })
}

const addDelimiters = R.compose(
  addDelimitersVariables,
  addDelimitersPlural,
  addDelimitersHTMLTags
)

function removeDelimiters(message) {
  return message.replace(new RegExp(delimiter, "g"), "")
}

export function setPseudoLocalizeOption() {
  pseudolocale.option.delimiter = delimiter
  // We do not want prepending and appending because of Plurals structure
  pseudolocale.option.prepend = ""
  pseudolocale.option.append = ""
  isPseudoLocalizeOptionSet = true
}

export default function(message: string) {
  if (!isPseudoLocalizeOptionSet) {
    setPseudoLocalizeOption()
  }
  message = addDelimiters(message)
  message = pseudolocale.str(message)

  return removeDelimiters(message)
}
