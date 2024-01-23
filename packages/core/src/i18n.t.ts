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

/**
 * Takes a string literal and recursively extracts the content inside curly braces.
 * It expects that opening curly brace is omitted.
 * @example `name}` -> 'name'
 * @example `plural, one {just one} other {many}} and much more` -> 'plural, one {just one} other {many}'
 */
type ExtractBraceBody<
  Input extends string, // The string to be processed.
  OpenedBraceStack extends "{"[] = [], // A stack to keep track of opened curly braces.
  Body extends string = "" // Accumulator to build up the content inside the braces.
> = string extends Input // Check if Input is a wide 'string' type rather than a string literal.
  ? string // If it is, return the wide 'string' type.
  : Input extends "" // Check if the input string is empty.
  ? [Body, ""] // If it is, return the accumulated Body and an empty string as a tuple.
  : ExtractNextBrace<Input> extends [
      // Use ExtractNextBrace to get the next brace and the parts of the string before and after it.
      infer Before extends string,
      infer Brace,
      infer After extends string
    ]
  ? Brace extends "{" // Check if the extracted brace is an opening brace '{'.
    ? ExtractBraceBody<
        // If it is, recursively call ExtractBraceBody...
        After, // ...with the rest of the string...
        ["{", ...OpenedBraceStack], //  ...pushing '{' onto the stack...
        `${Body}${Before}${Brace}` //  ...and appending the Before part and the brace to the Body.
      >
    : // Otherwise, if Brace is not an opening '{' but a closing one '}'
    OpenedBraceStack extends ["{", ...infer Rest extends "{"[]] // Check if there are any unmatched opening braces in the stack.
    ? ExtractBraceBody<
        // If there are, recursively call ExtractBraceBody...
        After, // ...with the rest of the string...
        Rest, // ...popping the last '{' from the stack...
        `${Body}${Before}}` // ...and appending the Before part and the closing brace '}' to the Body.
      >
    : // If the brace is a closing brace '}' and there are no unmatched opening braces...
      [`${Body}${Before}`, After] // ...return the content inside the braces (Body + Before) and the rest of the string (After) as a tuple.
  : never // If the string does not match the expected pattern, return 'never'.

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

/**
 * Takes a string literal and extracts interpolation variables from it.
 * @example `My name is {name}, i'm from {city}` -> {name: string} | {city: string}
 * @return union of objects with one property each
 */
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
