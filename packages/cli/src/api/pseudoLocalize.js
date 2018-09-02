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

function pseudoLocalize(message) {
  pseudolocale.option.delimiter = delimiter
  // We do not want prepending or appending because of Plurals structure
  pseudolocale.option.prepend = ""
  pseudolocale.option.append = ""
  const pseudoLocalizeMessage = pseudolocale.str(message)

  return pseudoLocalizeMessage.replace(new RegExp(delimiter, "g"), "")
}

export default function(message: string) {
  message = addDelimiters(message)

  return pseudoLocalize(message)
}
