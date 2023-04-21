[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/vue-extractor

This package contains a custom extractor that handles Vue.js files. It supports extracting messages from script and setup scripts as well as Vue templates.

`@lingui/vue-extractor` is part of [LinguiJS][linguijs]. See the [documentation][documentation] for all information, tutorials and examples.

## Installation

```sh
npm install --save-dev @lingui/extractor-vue
```

## Usage

This custom extractor requires that you use JavaScript for your Lingui configuration.

```js
import { vueExtractor } from "@lingui/extractor-vue"
import babel from "@lingui/cli/api/extractors/babel"

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

## License

This package is licensed under [MIT][license] license.

[license]: https://github.com/lingui/js-lingui/blob/main/LICENSE
[linguijs]: https://github.com/lingui/js-lingui
[documentation]: https://lingui.dev/tutorials/extractor-vue
[package]: https://www.npmjs.com/package/@lingui/extractor-vue
[badge-downloads]: https://img.shields.io/npm/dw/@lingui/extractor-vue.svg
[badge-version]: https://img.shields.io/npm/v/@lingui/extractor-vue.svg
[badge-license]: https://img.shields.io/npm/l/@lingui/extractor-vue.svg
