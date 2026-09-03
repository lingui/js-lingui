[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/babel-plugin-lingui-macro

> Babel plugin that transforms Lingui compile-time macros into optimized runtime calls

`@lingui/babel-plugin-lingui-macro` is part of [Lingui][documentation]. Lingui is a lightweight, open-source internationalization (i18n) library for JavaScript and TypeScript. It brings compile-time macros and a CLI for message extraction to React, React Native, Vue, SolidJS, Astro, Svelte, and Node.js.

The plugin expands the macros from `@lingui/core/macro`, `@lingui/react/macro` and `@lingui/solid/macro` at build time into ICU messages and calls to the Lingui runtime. Projects that compile with SWC use [`@lingui/swc-plugin`][swc-plugin] instead.

## Installation

```sh
npm install --save-dev @lingui/babel-plugin-lingui-macro
```

## Usage

See the [Babel setup][installation] in the installation guide.

## License

This package is licensed under the [MIT][license] license.

[license]: https://github.com/lingui/js-lingui/blob/main/LICENSE
[documentation]: https://lingui.dev
[installation]: https://lingui.dev/installation#choosing-a-transpiler
[swc-plugin]: https://lingui.dev/ref/swc-plugin
[package]: https://www.npmjs.com/package/@lingui/babel-plugin-lingui-macro
[badge-downloads]: https://img.shields.io/npm/dw/@lingui/babel-plugin-lingui-macro.svg
[badge-version]: https://img.shields.io/npm/v/@lingui/babel-plugin-lingui-macro.svg
[badge-license]: https://img.shields.io/npm/l/@lingui/babel-plugin-lingui-macro.svg
