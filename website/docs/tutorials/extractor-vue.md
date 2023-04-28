# Vue.js Extractor

The `@lingui/extractor-vue` package provides a custom extractor that handles Vue.js files.

## Installation

```bash npm2yarn
npm install --save-dev @lingui/extractor-vue
```

## Usage

It is required that you use JavaScript or TypeScript for your Lingui configuration.

```js title="lingui.config.{js,ts}"
import { vueExtractor } from "@lingui/extractor-vue"
import { extractor as defaultExtractor } from "@lingui/cli/api"

/** @type {import('@lingui/conf').LinguiConfig} */
const linguiConfig = {
  locales: ["en", "nb"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "<rootDir>/src/{locale}",
      include: ["<rootDir>/src"],
    },
  ],
  extractors: [babel, vueExtractor],
}

export default linguiConfig
```

## Further reading

- [Message Extraction](/docs/guides/message-extraction.md)
- [Custom Extractor](/docs/guides/custom-extractor.md)
- [GitHub Repository](https://github.com/lingui/js-lingui/tree/main/packages/extractor-vue)
