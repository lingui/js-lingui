import { Content, parse, Token } from "@messageformat/parser"

export type CompiledIcuChoices = Record<string, CompiledMessage> & {
  offset: number | undefined
}

export type CompiledMessageToken =
  | string
  | [name: string, type?: string, format?: null | string | CompiledIcuChoices]

export type CompiledMessage = CompiledMessageToken[]

type MapTextFn = (value: string) => string

function processTokens(tokens: Token[], mapText?: MapTextFn): CompiledMessage {
  if (!tokens.filter((token) => token.type !== "content").length) {
    return tokens.map((token) => mapText((token as Content).value))
  }

  return tokens.map<CompiledMessageToken>((token) => {
    if (token.type === "content") {
      return mapText(token.value)

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
    const formatProps: Record<string, CompiledMessage> = {}
    token.cases.forEach(({ key, tokens }) => {
      const prop = key[0] === "=" ? key.slice(1) : key
      formatProps[prop] = processTokens(tokens, mapText)
    })

    return [
      token.arg,
      token.type,
      {
        offset,
        ...formatProps,
      } as CompiledIcuChoices,
    ]
  })
}

export function compileMessage(
  message: string,
  mapText: MapTextFn = (v) => v
): CompiledMessage {
  try {
    return processTokens(parse(message), mapText)
  } catch (e) {
    console.error(`${(e as Error).message} \n\nMessage: ${message}`)
    return [message]
  }
}
