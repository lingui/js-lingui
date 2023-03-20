[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/format-json

> Read and write message catalogs in JSON 

`@lingui/format-json` is part of [LinguiJS][linguijs]. See the
[documentation][documentation] for all information, tutorials and examples.

## Installation

```sh
npm install --save-dev @lingui/format-json
# yarn add --dev @lingui/format-json
```

## Usage

```js
// lingui.config.{js,ts}
import {formatter} from "@lingui/format-json"

export default {
  [...]
  format: formatter({style: "lingui"}),
}
```

Possible options: 

```ts
export type JsonFormatterOptions = {
  /**
   * Print places where message is used
   *
   * @default true
   */
  origins?: boolean

  /**
   * Print line numbers in origins
   *
   * @default true
   */
  lineNumbers?: boolean
  /**
   * Different styles how information could be printed.
   *
   * @default "lingui"
   */
  style?: "lingui" | "minimal"
}
```


### Style: minimal

Simple JSON with message ID -> translation mapping. All metadata (default message, comments for translators, message origin, etc) are stripped:

```json
{
"MessageID": "Translated Message"
}
```

### Style: lingui

Raw catalog data serialized to JSON:

```json
{
"MessageID": {
  "translation": "Translated Message",
  "message": "Default string (from source code)",
  "origin": [
    ["path/to/src.js", 42]
  ]
}
}
```

## License

This package is licensed under [MIT][license] license.

[license]: https://github.com/lingui/js-lingui/blob/main/LICENSE
[linguijs]: https://github.com/lingui/js-lingui
[documentation]: https://lingui.dev
[package]: https://www.npmjs.com/package/@lingui/format-json
[badge-downloads]: https://img.shields.io/npm/dw/@lingui/format-json.svg
[badge-version]: https://img.shields.io/npm/v/@lingui/format-json.svg
[badge-license]: https://img.shields.io/npm/l/@lingui/format-json.svg
