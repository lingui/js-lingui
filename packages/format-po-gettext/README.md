[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/format-po-gettext

> Read and write message catalogs in Gettext PO format with gettext-style plurals

`@lingui/format-po-gettext` is part of [LinguiJS][linguijs]. See the
[documentation][documentation] for all information, tutorials and examples.

## Catalog example

```po
#. js-lingui-id: WGI12K
#. js-lingui:icu=%7BanotherCount%2C+plural%2C+one+%7BSingular+case%7D+other+%7BCase+number+%7BanotherCount%7D%7D%7D&pluralize_on=anotherCount
msgid "Singular case"
msgid_plural "Case number {anotherCount}"
msgstr[0] "Singular case"
msgstr[1] "Case number {anotherCount}"
```

## Installation

```sh
npm install --save-dev @lingui/format-po-gettext
# yarn add --dev @lingui/format-po-gettext
```

## Usage

```js
// lingui.config.{js,ts}
import {formatter} from "@lingui/format-po-gettext"

export default {
  [...]
  format: formatter({lineNumbers: false}),
}
```

Possible options:

```ts
export type PoGettextFormatterOptions = {
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
  
  disableSelectWarning?: boolean
}
```

## License

This package is licensed under [MIT][license] license.

[license]: https://github.com/lingui/js-lingui/blob/main/LICENSE
[linguijs]: https://github.com/lingui/js-lingui
[documentation]: https://lingui.dev
[package]: https://www.npmjs.com/package/@lingui/format-po-gettext
[badge-downloads]: https://img.shields.io/npm/dw/@lingui/format-po-gettext.svg
[badge-version]: https://img.shields.io/npm/v/@lingui/format-po-gettext.svg
[badge-license]: https://img.shields.io/npm/l/@lingui/format-po-gettext.svg
