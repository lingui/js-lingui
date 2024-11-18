# Vue.js Extractor

The `@lingui/extractor-vue` package provides a custom extractor that handles Vue.js files.

## Installation

```bash npm2yarn
npm install --save-dev @lingui/extractor-vue
```

## Usage

It is required that you use JavaScript or TypeScript for your Lingui configuration.

```js title="lingui.config.{js,ts}"
import { defineConfig } from "@lingui/cli";
import { vueExtractor } from "@lingui/extractor-vue";
import babel from "@lingui/cli/api/extractors/babel";

export default defineConfig({
  locales: ["en", "nb"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "<rootDir>/src/{locale}",
      include: ["<rootDir>/src"],
    },
  ],
  extractors: [babel, vueExtractor],
});
```

## See Also

- [Message Extraction](/guides/message-extraction)
- [Custom Extractor](/guides/custom-extractor)
