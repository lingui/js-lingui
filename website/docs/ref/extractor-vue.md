# Vue.js Extractor

The `@lingui/extractor-vue` package provides a custom extractor that handles Vue.js files.

## Installation

```bash npm2yarn
npm install --save-dev @lingui/extractor-vue
```

## Usage

It is required that you use JavaScript or TypeScript for your Lingui configuration.

```js title="lingui.config.{js,ts}"
import babel from "@lingui/cli/api/extractors/babel"
import type { LinguiConfig } from "@lingui/conf"
import { vueExtractor } from "@lingui/extractor-vue"

const config: LinguiConfig = {
	locales: ["en", "nb"],
	sourceLocale: "en",
	catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}",
      include: ["<rootDir>/src/locales"],
    },
	],
	extractors: [babel, vueExtractor],
}

export default config
```

## Further reading

- [Message Extraction](/docs/guides/message-extraction.md)
- [Custom Extractor](/docs/guides/custom-extractor.md)
- [GitHub Repository](https://github.com/lingui/js-lingui/tree/main/packages/extractor-vue)
