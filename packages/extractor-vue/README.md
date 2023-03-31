# Vue extractor

This package contains a set of custom extractors that handles Vue files. It supports extracting messages from script and setup scripts as well as limited support for extracting messages from templates.

## Installation

```sh
npm install @lingui/extractor-vue
```

## Usage

This custom extractor requires that you use typescript for your lingui configuration.

```ts
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

## Vue template limitations

This extractor assumes annotated `i18n` calls in Vue templates.

The following examples will be extracted:

- `i18n._(/*i18n*/ "Message")`
- `i18n.t(/*i18n*/ { id: "Message" })`
- `i18n.t(/*i18n*/ { message: "Message", id: "my.message", comment: "Comment" })`

While the following examples wont:

- `i18n._("Message")`
- `i18n.t({ id: "Message" })`
- `i18n.t({ message: "Message", id: "my.message", comment: "Comment" })`
