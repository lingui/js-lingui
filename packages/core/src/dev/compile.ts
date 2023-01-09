import {Content, parse, Token} from "@messageformat/parser"
import {CompiledMessage, CompiledMessageToken} from "../i18n"


// [Tokens] -> (CTX -> String)
function processTokens(tokens: Array<Token>): CompiledMessage {
  if (!tokens.filter((token) => token.type !== "content").length) {
    return tokens.map(token => (token as Content).value).join("")
  }

  return tokens.map<CompiledMessageToken>((token) => {
    if (token.type === 'content') {
      return token.value

      // # in plural case
    } else if (token.type === "octothorpe") {
      return "#"

      // simple argument
    } else if (token.type === "argument") {
      return [token.arg]

      // argument with custom format (date, number)
    } else if (token.type === "function") {
      const _param = token?.param?.[0] as Content

      if (_param) {
        return [token.arg, token.key, _param.value.trim()]
      } else {
        return [token.arg, token.key]
      }
    }

    const offset = token.pluralOffset

    // complex argument with cases
    const formatProps = {}
    token.cases.forEach((item) => {
      formatProps[item.key.replace(/^=(.)+/, "$1")] = processTokens(item.tokens)
    })

    return [
      token.arg,
      token.type,
      {
        offset,
        ...formatProps,
      } as any,
    ] as CompiledMessageToken
  })
}

// Message -> (Params -> String)
export default function compile(
  message: string
): CompiledMessage {
  try {
    return processTokens(parse(message))
  } catch (e) {
    console.error(`${e.message} \n\nMessage: ${message}`)
    return message
  }
}
