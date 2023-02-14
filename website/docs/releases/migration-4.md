# Migration guide from 3.x to 4.x

## Backward incompatible changes

Minimal required versions are:

- TypeScript (if used on the project): 4.1

### Extractor configuration changes

The big change in the v4 is in extractor internals. Now it is less fragile, and doesn't depend on the host project settings.

For most projects, it should work without extra configuration as long as it is a valid ES code.

`extractorBabelOptions` is not useful anymore, please delete it from your config.

```diff title="lingui.config.js"
module.exports = {
-  extractorBabelOptions: { [...] }
}
```

#### Flow Syntax supported in the Extractor with the flag

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
+    options?: ExtractorOptions
+  ): Promise<void> | void
}
```

Read more about custom extractor on the [Advanced: Custom Extractor](/guides/custom-extractor) page.
