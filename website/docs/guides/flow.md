# Flow

Lingui does not ship with [Flow](https://flow.org/) typings. However, you can use Lingui in projects written in Flow. All you need to do is inform the extractor that your sources use Flow syntax:

```js title="lingui.config.js"
module.export = {
  extractorParserOptions: {
    flow: true,
  },
};
```
