[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/solid

> SolidJS bindings for Lingui i18n: I18nProvider, Trans and useLingui, with compile-time macros

`@lingui/solid` is part of [Lingui][documentation]. Lingui is a lightweight, open-source internationalization (i18n) library for JavaScript and TypeScript. It brings compile-time macros and a CLI for message extraction to React, React Native, Vue, SolidJS, Astro, Svelte, and Node.js.

The package brings the Lingui workflow to SolidJS with reactive components. `@lingui/solid` exports `I18nProvider`, `Trans` and `useLingui`, `@lingui/solid/macro` exports the macros that generate ICU messages from JSX at build time, and `defineConfig` from `@lingui/solid/config` applies the Solid-specific settings to the Lingui configuration.

## Installation

```sh
npm install @lingui/core @lingui/solid
```

`@lingui/core` provides the `i18n` instance passed to the provider.

## Usage

See the [SolidJS tutorial][tutorial] and the [Solid reference][reference].

## License

This package is licensed under the [MIT][license] license.

[license]: https://github.com/lingui/js-lingui/blob/main/LICENSE
[documentation]: https://lingui.dev
[tutorial]: https://lingui.dev/tutorials/solid
[reference]: https://lingui.dev/ref/solid
[package]: https://www.npmjs.com/package/@lingui/solid
[badge-downloads]: https://img.shields.io/npm/dw/@lingui/solid.svg
[badge-version]: https://img.shields.io/npm/v/@lingui/solid.svg
[badge-license]: https://img.shields.io/npm/l/@lingui/solid.svg
