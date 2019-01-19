const keepSpaceRe = /(?:\\(?:\r\n|\r|\n))+\s+/g
const keepNewLineRe = /(?:\r\n|\r|\n)+\s+/g

function normalizeWhitespace(text) {
  return text
    .replace(keepSpaceRe, " ")
    .replace(keepNewLineRe, "\n")
    .trim()
}

export default function ICUMessageFormat() {}

ICUMessageFormat.prototype.fromTokens = function(tokens) {
  const props = tokens
    .map(token => this.processToken(token))
    .reduce(
      (props, message) => ({
        message: props.message + message.message,
        values: { ...props.values, ...message.values }
      }),
      {
        message: "",
        values: {}
      }
    )

  return {
    ...props,
    message: normalizeWhitespace(props.message)
  }
}

ICUMessageFormat.prototype.processToken = function(token) {
  switch (token.type) {
    case "text":
      return {
        message: token.value
      }
    case "arg":
      const values = {
        [token.name]: token.value
      }

      switch (token.format) {
        case "plural":
        case "select":
        case "selectOrdinal":
          return {
            message: `{${token.name},${token.format}}`,
            values
          }
        default:
          return {
            message: `{${token.name}}`,
            values
          }
      }
    default:
      throw new Error(`Unknown token type ${token.type}`)
  }
}
