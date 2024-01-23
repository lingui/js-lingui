import { Replace, Simplify, Trim, UnionToIntersection } from "type-fest"
import { Formats, FormatterMap } from "./formatter"

type DropEscapedBraces<Input extends string> = Replace<
  Replace<Input, `'{`, "", { all: true }>,
  `}'`,
  "",
  { all: true }
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

type ExtractFormatterId<Input extends string> =
  Input extends `${infer FormatterId},${string}`
    ? Trim<FormatterId>
    : Trim<Input>

type IsExistedFormatter<FormatterId extends string> =
  FormatterId extends keyof FormatterMap ? FormatterId : never

type FormatterInputType<FormatterId extends string> =
  FormatterMap[IsExistedFormatter<FormatterId>] extends infer FormatterFn
    ? FormatterFn extends (input: infer InputType, ...args: any[]) => any
      ? InputType
      : never
    : never

type ExtractVars<Input extends string> = string extends Input // Check if the type of Input is the general 'string' type and not a string literal.
  ? Record<string, unknown> // If it is, return a wide type Record<string, unknown> to represent any object.
  : // Start processing the literal string.
  Input extends `${string}{${infer Tail}` // Check if the Input string contains '{', indicating the start of an expression.
  ? // Extract the content inside the curly braces and the rest of the string after the closing curly brace.
    ExtractBraceBody<Tail> extends [
      infer BraceBody extends string,
      infer Next extends string
    ]
    ? BraceBody extends `${infer FormatterInput},${infer FormatterTail}` // Check if the content inside the braces is a formatter.
      ? // Process the formatter content.
        | {
              // Create a type with a property where the key is trimmed FormatterInput (which is var name in this case), and the value is determined by the formatter's type.
              [P in Trim<FormatterInput>]: FormatterInputType<
                ExtractFormatterId<FormatterTail>
              >
            }
          | ExtractVars<ExtractFormatterMessages<FormatterTail>[number]> // Recursively process messages inside the formatter.
          | ExtractVars<Next> // Recursively process the rest of the string after the current variable.
      : // If not a formatter, create a type with a property where the key is the whole trimmed BraceBody and the value is a string
        { [P in Trim<BraceBody>]: string } | ExtractVars<Next> // and recursively process the rest of the string.
    : {} // If the string does not contain a valid structure, return an empty object type (possibly we can return an error here, because this branch indicates parsing error)
  : {} // If the Input string does not contain '{', return an empty object type.

export type I18nTValues<Input extends string> = Simplify<
  UnionToIntersection<ExtractVars<DropEscapedBraces<Input>>>
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
