import {
  Token,
  Select,
  SelectCase,
  PlainArg,
  Content,
  FunctionArg,
} from "@messageformat/parser"

/** @internal */
export function printICU(tokens: Token[]): string {
  return doPrintICU(tokens, false)
}

function doPrintICU(tokens: Token[], isInPlural: boolean): string {
  const printedNodes = tokens.map((token, i) => {
    if (token.type === "content") {
      return printContentToken(
        token,
        isInPlural,
        i === 0,
        i === tokens.length - 1
      )
    } else if (token.type === "argument") {
      return printArgumentToken(token)
    } else if (token.type === "function") {
      return printFunctionToken(token)
    } else if (token.type === "octothorpe") {
      return "#"
    } else if (isPluralOrSelect(token)) {
      return printSelectToken(token)
    }
  })

  return printedNodes.join("")
}

function printEscapedMessage(message: string): string {
  return message.replace(/([{}](?:.*[{}])?)/su, `'$1'`)
}

function printContentToken(
  token: Content,
  isInPlural: boolean,
  isFirstToken: boolean,
  isLastToken: boolean
) {
  let escaped = token.value
  // If text starts with a ' and it is not the first token,
  // then the token before is non-string and the `'` needs to be unescaped
  if (!isFirstToken && escaped[0] === `'`) {
    escaped = `''${escaped.slice(1)}`
  }
  // Same logic but for last token
  if (!isLastToken && escaped[escaped.length - 1] === `'`) {
    escaped = `${escaped.slice(0, escaped.length - 1)}''`
  }
  escaped = printEscapedMessage(escaped)
  return isInPlural ? escaped.replace("#", "'#'") : escaped
}

function printArgumentToken(token: PlainArg) {
  return `{${token.arg}}`
}

function printFunctionToken(token: FunctionArg) {
  return `{${token.arg}, ${token.key}${
    token.param ? `, ${printFunctionParamToken(token.param)}` : ""
  }}`
}

function printFunctionParamToken(tokens: FunctionArg["param"]) {
  return tokens
    .map((token) => {
      if (token.type === "content") {
        return printEscapedMessage(token.value)
      } else {
        return doPrintICU([token], false)
      }
    })
    .join("")
    .trimStart()
}

function printSelectToken(token: Select) {
  const msg = [
    token.arg,
    token.type,
    [
      token.pluralOffset ? `offset:${token.pluralOffset}` : "",
      ...token.cases.map(
        (tokenCase: SelectCase) =>
          `${tokenCase.key} {${doPrintICU(
            tokenCase.tokens,
            token.type === "plural" || token.type === "selectordinal"
          )}}`
      ),
    ]
      .filter(Boolean)
      .join(" "),
  ].join(", ")
  return `{${msg}}`
}

export function isPluralOrSelect(object: Token): object is Select {
  return "cases" in object
}
