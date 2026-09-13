[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/conf

> Resolve and validate Lingui configuration

`@lingui/conf` is part of [Lingui][documentation]. Lingui is a lightweight, open-source internationalization (i18n) library for JavaScript and TypeScript. It brings compile-time macros and a CLI for message extraction to React, React Native, Vue, SolidJS, Astro, Svelte, and Node.js.

**Internal package.** `@lingui/conf` locates `lingui.config.js`, fills in the defaults and validates the options for the Lingui CLI and the bundler plugins. Application code does not need it; `defineConfig` is available from `@lingui/cli`. See the [configuration reference][reference] for all options.

## License

This package is licensed under the [MIT][license] license.

[license]: https://github.com/lingui/js-lingui/blob/main/LICENSE
[documentation]: https://lingui.dev
[reference]: https://lingui.dev/ref/conf
[package]: https://www.npmjs.com/package/@lingui/conf
[badge-downloads]: https://img.shields.io/npm/dw/@lingui/conf.svg
[badge-version]: https://img.shields.io/npm/v/@lingui/conf.svg
[badge-license]: https://img.shields.io/npm/l/@lingui/conf.svg
