import { Formats } from "./i18n"

type ExtractNextBrace<T extends string, Acc extends string = ""> = T extends `${infer Head}${infer Tail}` ?
  Head extends "{" | "}" ? [Acc, Head, Tail] : ExtractNextBrace<Tail, `${Acc}${Head}`>
  : never;

type ExtractBraceBody<Input extends string, OpenedBrackets extends "{"[] = [], Body extends string = ""> =
  string extends Input
    ?
    string
    :
    Input extends ""
      ?
      [Body, ""]
      :
      ExtractNextBrace<Input> extends [infer Before extends string, infer Brace, infer Tail extends string]
        ?
        Brace extends "{"
          ?
          ExtractBraceBody<Tail, ["{", ...OpenedBrackets], `${Body}${Before}${Brace}`>
          :
          OpenedBrackets extends ["{", ...infer Rest extends "{"[]]
            ?
            ExtractBraceBody<Tail, Rest, `${Body}${Before}}`>
            :
            [`${Body}${Before}`, Tail]
        : never
  ;


type ExtractFormatterMessages<Input extends string> =
  string extends Input
    ?
    string[]
    :
    Input extends ""
      ?
      []
      :
      Input extends `${string}{${infer Tail}`
        ?
        ExtractBraceBody<Tail> extends [infer BraceBody extends string, infer Next extends string]
          ?
          [BraceBody, ...ExtractFormatterMessages<Next>]
          :
          []
        :
        []
  ;

type UnionToIntersection<U> =
  (U extends any ? (x: U) => void : never) extends ((x: infer I) => void) ? I : never

type Normalize<T> = { [K in keyof T]: T[K] } & {}

type _ExtractVars<Input extends string> =
  string extends Input
    ?
    {}
    :
    Input extends ""
      ?
      {}
      :
      Input extends `${string}{${infer Tail}`
        ? ExtractBraceBody<Tail> extends [infer BraceBody extends string, infer Next extends string]
          ?
          BraceBody extends `${infer FormatterInput},${infer FormatterTail}`
            ?
            { [P in FormatterInput]: string } & UnionToIntersection<_ExtractVars<ExtractFormatterMessages<FormatterTail>[number]>>
            :
            { [P in BraceBody]: string } & _ExtractVars<Next>
          : {}
        : {}
  ;

export type I18nT<Input extends string> = Normalize<_ExtractVars<Input>>;

type MessageDescriptorWithIdAsMessage<Message extends string> =
  {} extends I18nT<Message>
    ? { id: Message }
    : { id: Message, values: I18nT<Message> };

type MessageDescriptorWithMessageAsMessage<Message extends string> =
  ({ id: string }) &
  ({} extends I18nT<Message>
    ? { message: Message }
    : { message: Message, values: I18nT<Message> });

type MessageDescriptorRest = {
  comment?: string
}

export type MessageDescriptor<Message extends string> =
  (MessageDescriptorWithIdAsMessage<Message> | MessageDescriptorWithMessageAsMessage<Message>)
  & MessageDescriptorRest

export type TFnOptions = {
  formats?: Formats
  comment?: string
}

export type TFnOptionsWithMessage<Message extends string> = {
  message: Message
} & TFnOptions
