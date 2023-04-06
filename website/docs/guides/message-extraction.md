# Message Extraction

Message extraction is an essential step in the internationalization process. It involves analyzing your code and extracting all messages defined in it so that your message catalogs are always up-to-date with the source code.

To extract messages from your application with the lingui functions, use the `lingui extract` command.

## Supported patterns

The extractor tool is simple and analyzes your code without executing it. Therefore, complicated patterns and dynamic code are not supported.

### Macro usages

The tool supports all macro usages, such as the following examples:

```tsx
t`Message`

t({
  id: "ID Some",
  message: "Message with id some",
})

const jsx = <Trans>Hi, my name is {name}</Trans>
```
For more usage examples, refer to the [macro documentation](/docs/ref/conf.md).

### Non-Macro usages

The tool matches `i18n._` or `i18n.t` function calls. It also matches when these functions are called from other member expressions, such as `ctx.i18n.t()`.

:::note
The tool matches call expressions only by name. It doesn't check whether they were really imported from Lingui packages.
:::

```ts
i18n._("message.id")
i18n._({id: "message.id"})

ctx.i18n._("message.id")
ctx.i18n.t("message.id")

ctx.request.i18n.t("message.id")

// and so on
```

You can ignore a call expression from exraction using `lingui-extract-ignore` comment

```ts
/* lingui-extract-ignore */
ctx.i18n._("Message")
```

This message would not be extracted.

### Explicitly marking messages

Apart from call expressions, which are the most commonly used method, the extractor tool also supports simple string literals and message descriptors with explicit annotations.

To do this, simply prefix your expression with the `/*i18n*/` comment, like so:

```ts
const messageDescriptor: MessageDescriptor = /*i18n*/ { id: 'Description', comment: "description" }
const stringLiteral = /*i18n*/ 'Message'
```

## Unsupported Patterns

The extractor is limited to extracting messages from code that is written in a certain way. It cannot extract messages from variables or function calls. It also cannot follow program structure and get the value of a variable defined elsewhere.

This means that in order for a message to be extracted, it must be defined directly in the function call.

For example, the following code cannot be extracted:
```ts
const message = 'Message'
i18n._(message)
```

Instead, you should define the message directly in the function arguments:

```ts
i18n._('Message')
```
