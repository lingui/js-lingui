[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/vite-plugin

> Vite plugin that compiles Lingui message catalogs on the fly, so .po files can be imported directly

`@lingui/vite-plugin` is part of [Lingui][documentation]. Lingui is a lightweight, open-source internationalization (i18n) library for JavaScript and TypeScript. It brings compile-time macros and a CLI for message extraction to React, React Native, Vue, SolidJS, Astro, Svelte, and Node.js.

The plugin compiles catalogs when they are imported, so there is no `lingui compile` step to run. Macros are still transformed by the Babel or SWC plugin in your Vite setup.

## Usage

See the [Vite setup][installation] in the installation guide and the [Vite plugin reference][reference].

## License

This package is licensed under the [MIT][license] license.

[license]: https://github.com/lingui/js-lingui/blob/main/LICENSE
[documentation]: https://lingui.dev
[installation]: https://lingui.dev/installation#vite
[reference]: https://lingui.dev/ref/vite-plugin
[package]: https://www.npmjs.com/package/@lingui/vite-plugin
[badge-downloads]: https://img.shields.io/npm/dw/@lingui/vite-plugin.svg
[badge-version]: https://img.shields.io/npm/v/@lingui/vite-plugin.svg
[badge-license]: https://img.shields.io/npm/l/@lingui/vite-plugin.svg
