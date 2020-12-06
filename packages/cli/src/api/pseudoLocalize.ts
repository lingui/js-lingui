import R from "ramda"
import pseudolocale from "pseudolocale"

const delimiter = "%&&&%"

pseudolocale.option.delimiter = delimiter
// We do not want prepending and appending because of Plurals structure
pseudolocale.option.prepend = ""
pseudolocale.option.append = ""

/*
Regex should match HTML tags
It was taken from https://haacked.com/archive/2004/10/25/usingregularexpressionstomatchhtml.aspx/
Example: https://regex101.com/r/bDHD9z/3
*/
const HTMLRegex = /<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/g
/*
Regex should match js-lingui plurals
Example: https://regex101.com/r/utnbQw/4
*/
const PluralRegex = /({\w*,\s*(plural|selectordinal),(.|\n)*?{)|(}\s*(offset|zero|one|two|few|many|other)\s*{)/g
/*
Regex should match js-lingui variables
Example: https://regex101.com/r/dw1QHb/2
*/
const VariableRegex = /({\s*[a-zA-Z_$][a-zA-Z_$0-9]*\s*})/g

function addDelimitersHTMLTags(message) {
  return message.replace(HTMLRegex, (matchedString) => {
    return `${delimiter}${matchedString}${delimiter}`
  })
}

function addDelimitersPlural(message) {
  return message.replace(PluralRegex, (matchedString) => {
    return `${delimiter}${matchedString}${delimiter}`
  })
}

function addDelimitersVariables(message) {
  return message.replace(VariableRegex, (matchedString) => {
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

export default function (message: string) {
  message = addDelimiters(message)
  message = pseudolocale.str(message)

  return removeDelimiters(message)
}
