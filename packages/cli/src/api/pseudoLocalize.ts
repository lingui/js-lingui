import pseudolocale from "pseudolocale"

const delimiter = "%&&&%"

/**
 * Regex should match HTML tags
 * It was taken from https://haacked.com/archive/2004/10/25/usingregularexpressionstomatchhtml.aspx/
 * Example: https://regex101.com/r/bDHD9z/3
 */
const HTMLRegex =
  /<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/g

/**
 * Regex should match js-lingui Plurals, Select and SelectOrdinal  components
 * Example:
 * Plurals https://regex101.com/r/VUJXg0/1
 * SelectOrdinal https://regex101.com/r/T7hSLU/2
 * Select https://regex101.com/r/9JnqB9/1
 */
const MacroRegex =
  /({\w*,\s*(plural|selectordinal|select),(.|\n)*?{)|(}\s*\w*\s*{)/gi

/**
 * Regex should match js-lingui variables
 * Example: https://regex101.com/r/dw1QHb/2
 */
const VariableRegex = /({\s*[a-zA-Z_$][a-zA-Z_$0-9]*\s*})/g

function addDelimitersHTMLTags(message: string) {
  return message.replace(HTMLRegex, (matchedString) => {
    return `${delimiter}${matchedString}${delimiter}`
  })
}

function addDelimitersMacro(message: string) {
  return message.replace(MacroRegex, (matchedString) => {
    return `${delimiter}${matchedString}${delimiter}`
  })
}

function addDelimitersVariables(message: string) {
  return message.replace(VariableRegex, (matchedString) => {
    return `${delimiter}${matchedString}${delimiter}`
  })
}

function removeDelimiters(message: string) {
  return message.replace(new RegExp(delimiter, "g"), "")
}

export default function (message: string) {
  message = addDelimitersHTMLTags(message)
  message = addDelimitersMacro(message)
  message = addDelimitersVariables(message)
  message = pseudolocale(message, {
    delimiter,
    prepend: "",
    append: "",
  })

  return removeDelimiters(message)
}
