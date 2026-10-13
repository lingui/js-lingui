[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/babel-plugin-extract-messages

> Babel plugin to extract translatable messages from source code into Lingui catalogs

`@lingui/babel-plugin-extract-messages` is part of [Lingui][documentation]. Lingui is a lightweight, open-source internationalization (i18n) library for JavaScript and TypeScript. It brings compile-time macros and a CLI for message extraction to React, React Native, Vue, SolidJS, Astro, Svelte, and Node.js.

**Internal package.** `@lingui/cli` runs this plugin during `lingui extract` to collect the messages that go into the catalogs. You do not need to install it or add it to your Babel config. See the [message extraction guide][extraction] for what the extractor recognizes.

## License

This package is licensed under the [MIT][license] license.

[license]: https://github.com/lingui/js-lingui/blob/main/LICENSE
[documentation]: https://lingui.dev
[extraction]: https://lingui.dev/guides/message-extraction
[package]: https://www.npmjs.com/package/@lingui/babel-plugin-extract-messages
[badge-downloads]: https://img.shields.io/npm/dw/@lingui/babel-plugin-extract-messages.svg
[badge-version]: https://img.shields.io/npm/v/@lingui/babel-plugin-extract-messages.svg
[badge-license]: https://img.shields.io/npm/l/@lingui/babel-plugin-extract-messages.svg
