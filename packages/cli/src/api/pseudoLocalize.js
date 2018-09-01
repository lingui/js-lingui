// @flow

import pseudoloc from "pseudoloc"

const delimiter = "%&&&%"
/*
Regex should match HTML tags
It was taken from https://haacked.com/archive/2004/10/25/usingregularexpressionstomatchhtml.aspx/
Example: https://regex101.com/r/bDHD9z/3
*/
const HTMLRegex = /<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/
/*
Regex should match js-lingui plurals
Example: https://regex101.com/r/zXWiQR/3
*/
const PluralRegex = /{\w*,\s*plural,\s*\w*\s*{|}\s*\w*\s*({|})/
/*
Regex should match js-lingui variables
Example: https://regex101.com/r/zXWiQR/3
*/
const VariableRegex = /({|})/

function addDelimitersHTMLTags(message) {
  return message.replace(new RegExp(HTMLRegex, "g"), matchedString => {
    return `${delimiter}${matchedString}${delimiter}`
  })
}

function addDelimitersPlural(message) {
  return message.replace(new RegExp(PluralRegex, "g"), matchedString => {
    return `${delimiter}${matchedString}${delimiter}`
  })
}

function addDelimitersVariables(message) {
  return message.replace(new RegExp(VariableRegex, "g"), matchedString => {
    return `${delimiter}${matchedString}${delimiter}`
  })
}

function addDelimiters(message) {
  message = addDelimitersHTMLTags(message)
  message = addDelimitersPlural(message)
  message = addDelimitersVariables(message)

  return message
}

function pseudoLocalize(message) {
  pseudoloc.option.delimiter = delimiter
  pseudoloc.option.prepend = ""
  pseudoloc.option.append = ""
  const pseudoLocalizeMessage = pseudoloc.str(message)

  return pseudoLocalizeMessage.replace(new RegExp(delimiter, "g"), "")
}

export default function(message: string) {
  message = addDelimiters(message)

  return pseudoLocalize(message)
}
