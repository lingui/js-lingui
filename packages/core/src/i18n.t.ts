import { Replace, Simplify, Trim, UnionToIntersection } from "type-fest"
import { Formats } from "./i18n"

type DropEscapedBraces<Input extends string> = Replace<
  Replace<Input, `'{`, "">,
  `}'`,
  ""
>

type ExtractNextBrace<
  T extends string,
  Acc extends string = ""
> = T extends `${infer Head}${infer Tail}`
  ? Head extends "{" | "}"
    ? [Acc, Head, Tail]
    : ExtractNextBrace<Tail, `${Acc}${Head}`>
  : never

type ExtractBraceBody<
  Input extends string,
  OpenedBrackets extends "{"[] = [],
  Body extends string = ""
> = string extends Input
  ? string
  : Input extends ""
  ? [Body, ""]
  : ExtractNextBrace<Input> extends [
      infer Before extends string,
      infer Brace,
      infer Tail extends string
    ]
  ? Brace extends "{"
    ? ExtractBraceBody<
        Tail,
        ["{", ...OpenedBrackets],
        `${Body}${Before}${Brace}`
      >
    : OpenedBrackets extends ["{", ...infer Rest extends "{"[]]
    ? ExtractBraceBody<Tail, Rest, `${Body}${Before}}`>
    : [`${Body}${Before}`, Tail]
  : never

type ExtractFormatterMessages<Input extends string> = string extends Input
  ? string[]
  : Input extends ""
  ? []
  : Input extends `${string}{${infer Tail}`
  ? ExtractBraceBody<Tail> extends [
      infer BraceBody extends string,
      infer Next extends string
    ]
    ? [BraceBody, ...ExtractFormatterMessages<Next>]
    : []
  : []

type ExtractVars<Input extends string> = string extends Input
  ? {}
  : Input extends ""
  ? {}
  : Input extends `${string}{${infer Tail}`
  ? ExtractBraceBody<Tail> extends [
      infer BraceBody extends string,
      infer Next extends string
    ]
    ? BraceBody extends `${infer FormatterInput},${infer FormatterTail}`
      ? { [P in Trim<FormatterInput>]: string } & UnionToIntersection<
          ExtractVars<ExtractFormatterMessages<FormatterTail>[number]>
        >
      : { [P in Trim<BraceBody>]: string } & ExtractVars<Next>
    : {}
  : {}

export type I18nTValues<Input extends string> = Simplify<
  ExtractVars<DropEscapedBraces<Input>>
>

type I18nTDescriptorBasic = {
  comment?: string
}

export type I18nTDescriptorById<Message extends string> = I18nTDescriptorBasic &
  ({} extends I18nTValues<Message>
    ? { id: Message }
    : { id: Message; values: I18nTValues<Message> })

export type I18nTDescriptorByMessage<Message extends string> = ({
  id: string
} & I18nTDescriptorBasic) &
  ({} extends I18nTValues<Message>
    ? { message: Message }
    : { message: Message; values: I18nTValues<Message> })

export type I18nTOptions = {
  formats?: Formats
  comment?: string
}

export type I18nTOptionsWithMessage<Message extends string> = {
  message: Message
} & I18nTOptions

export type I18nTMessageWithNoParams<Message extends string> =
  DropEscapedBraces<Message> extends `${string}{${string}}${string}`
    ? never
    : Message
