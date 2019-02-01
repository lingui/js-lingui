import * as R from "ramda"

const metaOptions = ["id", "comment", "props"]

const metaOptionsRe = new RegExp(`^(${metaOptions.join("|")})$`)
const escapedMetaOptionsRe = new RegExp(`^_(${metaOptions.join("|")})$`)

// const debug = value => console.log(value) || value

export default function ICUMessageFormat() {}

ICUMessageFormat.prototype.fromTokens = function(tokens) {
  return (
    (Array.isArray(tokens) ? tokens : [tokens])
      .map(token => this.processToken(token))
      // .map(debug)
      .reduce(
        (props, message) => ({
          ...message,
          message: props.message + message.message,
          values: { ...props.values, ...message.values },
          jsxElements: { ...props.jsxElements, ...message.jsxElements }
        }),
        {
          message: "",
          values: {},
          jsxElements: {}
        }
      )
  )
}

ICUMessageFormat.prototype.processToken = function(token) {
  const jsxElements = {}

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
        case "selectordinal":
          const formatOptions = Object.keys(token.options)
            .filter(
              key => !metaOptionsRe.test(key) && token.options[key] != null
            )
            .map(key => {
              let value = token.options[key]
              key = key.replace(escapedMetaOptionsRe, "$1")

              if (key === "offset") {
                // offset has special syntax `offset:number`
                return `offset:${value}`
              }

              if (typeof value !== "string") {
                // process tokens from nested formatters
                const {
                  message,
                  values: childValues,
                  jsxElements: childJsxElements
                } = this.fromTokens(value)

                Object.assign(values, childValues)
                Object.assign(jsxElements, childJsxElements)
                value = message
              }

              return `${key} {${value}}`
            })
            .join(" ")

          const metaKeys = R.pickBy(
            (value, key) => typeof key === "string" && metaOptionsRe.test(key),
            token.options
          )

          return {
            message: `{${token.name}, ${token.format}, ${formatOptions}}`,
            values,
            jsxElements,
            ...metaKeys
          }
        default:
          return {
            message: `{${token.name}}`,
            values
          }
      }
    case "element":
      let message = ""
      let elementValues = {}
      Object.assign(jsxElements, { [token.name]: token.value })
      token.children.forEach(child => {
        const {
          message: childMessage,
          values: childValues,
          jsxElements: childJsxElements
        } = this.fromTokens(child)

        message += childMessage
        Object.assign(elementValues, childValues)
        Object.assign(jsxElements, childJsxElements)
      })
      return {
        message: token.children.length
          ? `<${token.name}>${message}</${token.name}>`
          : `<${token.name}/>`,
        values: elementValues,
        jsxElements
      }
    default:
      throw new Error(`Unknown token type ${token.type}`)
  }
}
