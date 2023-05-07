[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/format-po-gettext

> Read and write message catalogs in Gettext PO format with gettext-style plurals
>
> Converts ICU Plural expressions into native gettext plurals

`@lingui/format-po-gettext` is part of [LinguiJS][linguijs]. See the
[documentation][documentation] for all information, tutorials and examples.

> **Warning**
> This formatter is made for compatibility with translation management systems, which do not support ICU expressions in PO files.
> 
> It does not support all features of LinguiJS and should be carefully considered over other formats.
>
> Not supported features (native gettext doesn't support this):
> - SelectOrdinal
> - Select
> - Nested ICU Expressions
> - Signed digits and fractions (-5, and 0.15) in plurals

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

  /**
   * Disable warning about unsupported `Select` feature encountered in catalogs
   * 
   * @default false
   */
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
