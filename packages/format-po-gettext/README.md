[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/format-po-gettext

> Reads and writes Lingui message catalogs as gettext PO files with native gettext plurals instead of ICU plurals

`@lingui/format-po-gettext` is part of [Lingui][documentation]. Lingui is a lightweight, open-source internationalization (i18n) library for JavaScript and TypeScript. It brings compile-time macros and a CLI for message extraction to React, React Native, Vue, SolidJS, Astro, Svelte, and Node.js.

Use this formatter when your translation platform does not understand ICU plural syntax in PO files. It converts ICU plurals to `msgid_plural` and `msgstr[n]` entries and back. Because gettext plurals are less expressive than ICU, nested plurals are not supported and `select` stays in ICU syntax, so prefer the default `@lingui/format-po` whenever your tools accept it.

## Usage

See the [catalog formats reference][reference].

## License

This package is licensed under the [MIT][license] license.

[license]: https://github.com/lingui/js-lingui/blob/main/LICENSE
[documentation]: https://lingui.dev
[reference]: https://lingui.dev/ref/catalog-formats#po-gettext
[package]: https://www.npmjs.com/package/@lingui/format-po-gettext
[badge-downloads]: https://img.shields.io/npm/dw/@lingui/format-po-gettext.svg
[badge-version]: https://img.shields.io/npm/v/@lingui/format-po-gettext.svg
[badge-license]: https://img.shields.io/npm/l/@lingui/format-po-gettext.svg
