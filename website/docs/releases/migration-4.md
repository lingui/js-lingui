# Migration guide from 3.x to 4.x

## Backward incompatible changes

Minimal required versions are:

- TypeScript (if used on the project): 4.1
- Node: v16.x

### Extractor configuration changes

The big change in the v4 is in extractor internals. Now it is less fragile, and doesn't depend on the host project settings.

For most projects, it should work without extra configuration as long as it is a valid ES code.

`extractorBabelOptions` is not useful anymore, please delete it from your config.

```diff title="lingui.config.js"
module.exports = {
-  extractorBabelOptions: { [...] }
}
```

### Hash-based message ID generation and Context feature

The previous implementation had a flaw: there is an original message in the bundle at least 2 times + 1 translation.

For the line "Hello world" it'll exist in the source code as ID in i18n call, then as a key in the message catalog, and then as a translation itself. Strings could be very long, not just a couple of words, so this may bring more kB to the bundle.

A much better option is generating a "stable" ID based on the msg + context as a hash with a fixed length.

Hash would be calculated at build time by macros. So macros instead of:

```js
const message = t({
   context: 'My context',
   message: `Hello`
})

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core"
const message = i18n._(/*i18n*/{
   context: 'My context',
   id: `Hello`
})
```

now generates:

```js
import { i18n } from "@lingui/core"
const message = i18n._(/*i18n*/{
   id: "<hash(message + context)>",
   message: `Hello`,
})
```

Also, we've added a possibility to provide a context for the message. For more details, see the [Providing a context for a message](/docs/tutorials/react-patterns.md#providing-a-context-for-a-message).

The context feature affects the message ID generation and adds the `msgctxt` parameter in case of the PO catalog format extraction.

### Change in generated ICU messages for nested JSX Macros

We have made a small change in how Lingui generates ICU messages for nested JSX Macros. We have removed leading spaces from the texts in all cases.

The generated code from the following nested component:
``` jsx
<Plural
  id="message.id"
  one={
    <Trans>
      One hello
    </Trans>
  }
  other={
    <Trans>
      Other hello
    </Trans>
  }
  value={count}
/>
```

was changed as follows:
``` diff
  <Trans
    id="message.id"
    message={
-     "{count, plural, one { One hello} other { Other hello}}"
+     "{count, plural, one {One hello} other {Other hello}}"
    }
    values={{
      count: count
    }}
  />
```

### Flow Syntax supported in the Extractor with the flag

If your project uses Flow, you need to explicitly enable support in the extractor:

```js title="lingui.config.js"
module.exports = {
  extractorParserOptions: {
    flow: true
  }
}
```

### `@lingui/cli/api/extractors/typescript` was deleted

Extractor supports TypeScript out of the box. Please delete it from your configuration file.

### No need to have `NODE_ENV=development` before `lingui-extract`

If your extract command looks like:

```bash
NODE_ENV=development lingui-extract
```

Now you can safely change it to just:

```bash
lingui-extract
```

### Public interface of `ExtractorType` was changed

```diff
declare type ExtractorType = {
  match(filename: string): boolean
-   extract(filename: string, targetDir: string, options?: any): void
+   extract(
+    filename: string,
+    code: string,
+    onMessageExtracted: (msg: ExtractedMessage) => void,
+    ctx?: ExtractorCtx
+  ): Promise<void> | void
}
```

Read more about custom extractor on the [Advanced: Custom Extractor](/guides/custom-extractor) page.

### Configuration migrations for deprecated options were deleted

Migration for the following older options:
- `localeDir`,
- `srcPathDirs`,
- `srcPathIgnorePatterns`,
- `fallbackLocale`

were deleted from the source code. This should affect only users who are migrating from `v2` to `v4` directly.
