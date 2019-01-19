import * as R from "ramda"

const keepSpaceRe = /(?:\\(?:\r\n|\r|\n))+\s+/g
const keepNewLineRe = /(?:\r\n|\r|\n)+\s+/g

const formatOptionsRe = /(zero|one|few|many|other|offset|=\d+)/
const js2icuExactMatch = value => value.replace(/=(\d+)/, "_$1")

function normalizeWhitespace(text) {
  return text
    .replace(keepSpaceRe, " ")
    .replace(keepNewLineRe, "\n")
    .trim()
}

// const debug = value => console.log(value) || value

export default function ICUMessageFormat() {}

ICUMessageFormat.prototype.fromTokens = function(tokens) {
  const props = (Array.isArray(tokens) ? tokens : [tokens])
    .map(token => this.processToken(token))
    .reduce(
      (props, message) => ({
        ...message,
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
          const formatOptions = Object.keys(token.options)
            .filter(key => formatOptionsRe.test(key))
            .map(key => {
              let value = token.options[key]

              if (key === "offset") {
                return `offset:${value}`
              }

              if (typeof value !== "string") {
                const { message, values: innerValues } = this.fromTokens(value)

                Object.assign(values, innerValues)
                value = message
              }

              return `${key} {${value}}`
            })
            .join(" ")

          const metaKeys = R.pickBy(
            (value, key) => !formatOptionsRe.test(key),
            token.options
          )

          return {
            message: `{${token.name}, ${token.format}, ${formatOptions}}`,
            values,
            ...metaKeys
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
