[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/format-po

> Read and write message catalogs in Gettext PO format with ICU plurals

`@lingui/format-po` is part of [LinguiJS][linguijs]. See the
[documentation][documentation] for all information, tutorials and examples.

## Catalog example

```po
#, Comment for translators
#: src/App.js:4, src/Component.js:2
msgid "MessageID"
msgstr "Translated Message"
```

## Installation

```sh
npm install --save-dev @lingui/format-po
# yarn add --dev @lingui/format-po
```

## Usage

```js
// lingui.config.{js,ts}
import {formatter} from "@lingui/format-po"

export default {
  [...]
  format: formatter({lineNumbers: false}),
}
```

Possible options:

```ts
export type PoFormatterOptions = {
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
   * Print `js-lingui-id: Xs4as` statement in extracted comments section
   *
   * @default false
   */
  printLinguiId?: boolean
  
  /**
   * By default, the po-formatter treats the pair `msgid` + `msgctx` as the source
   * for generating an ID by hashing its value.
   *
   * For messages with explicit IDs, the formatter adds a special comment `js-lingui-explicit-id` as a flag.
   * When this flag is present, the formatter will use the `msgid` as-is without any additional processing.
   *
   * Set this option to true if you exclusively use explicit-ids in your project.
   *
   * https://lingui.dev/tutorials/explicit-vs-generated-ids#using-custom-id
   *
   * @default false
   */
  explicitIdAsDefault?: boolean
  
  /**
   * Custom attributes to append to the PO file header
   *
   * @default {}
   */
  customHeaderAttributes?: { [key: string]: string }
}
```

## License

This package is licensed under [MIT][license] license.

[license]: https://github.com/lingui/js-lingui/blob/main/LICENSE
[linguijs]: https://github.com/lingui/js-lingui
[documentation]: https://lingui.dev
[package]: https://www.npmjs.com/package/@lingui/format-po
[badge-downloads]: https://img.shields.io/npm/dw/@lingui/format-po.svg
[badge-version]: https://img.shields.io/npm/v/@lingui/format-po.svg
[badge-license]: https://img.shields.io/npm/l/@lingui/format-po.svg
