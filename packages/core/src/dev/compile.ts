import { parse } from "messageformat-parser"
import { isString } from "../essentials"

// [Tokens] -> (CTX -> String)
function processTokens(tokens) {
  if (!tokens.filter(token => !isString(token)).length) {
    return tokens.join("")
  }

  return tokens.map(token => {
    if (isString(token)) {
      return token

      // # in plural case
    } else if (token.type === "octothorpe") {
      return "#"

      // simple argument
    } else if (token.type === "argument") {
      return [token.arg]

      // argument with custom format (date, number)
    } else if (token.type === "function") {
      return [token.arg, token.key, token.params[0]]
    }

    const offset = token.offset ? parseInt(token.offset) : undefined

    // complex argument with cases
    const formatProps = {}
    token.cases.forEach(item => {
      formatProps[item.key] = processTokens(item.tokens)
    })

    return [
      token.arg,
      token.type,
      {
        offset,
        ...formatProps
      }
    ]
  })
}

// Message -> (Params -> String)
export default function compile(
  message: string
): Array<string | [string, string?, Object?]> | string {
  try {
    return processTokens(parse(message))
  } catch (e) {
    console.error(`Message cannot be parsed due to syntax erorrs: ${message}`)
    return message
  }
}
