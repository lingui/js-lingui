[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/cli

> Lingui CLI: extracts i18n messages from source code into catalogs and compiles the translated catalogs for the runtime

`@lingui/cli` is part of [Lingui][documentation]. Lingui is a lightweight, open-source internationalization (i18n) library for JavaScript and TypeScript. It brings compile-time macros and a CLI for message extraction to React, React Native, Vue, SolidJS, Astro, Svelte, and Node.js.

The `lingui` command reads `lingui.config.js` (or `.ts`) from the project root: the source locale, the target locales and where the catalogs live. The [installation guide][installation] shows the minimal file and the [configuration reference][conf] lists every option.

## Installation

```sh
npm install --save-dev @lingui/cli
```

## Usage

- `lingui extract` finds the messages in the source, merges them into one catalog per locale, keeps existing translations and marks removed messages as obsolete.
- `lingui compile` compiles the translated catalogs into JavaScript modules for the runtime and reports messages with invalid ICU syntax.
- `lingui extract-template` writes a single `.pot` template with the source messages, for translation platforms that create the locale files themselves.
- `lingui extract-experimental` follows the imports from each entry point instead of a glob, so a multi-page app gets one catalog per page.

Extraction parses JavaScript and TypeScript out of the box; Vue single-file components need [`@lingui/extractor-vue`][extractor-vue]. Catalogs are PO files by default, with [other formats][catalog-formats] available as separate packages. To let the bundler compile catalogs instead of running `lingui compile`, use [`@lingui/vite-plugin`][vite-plugin], [`@lingui/loader`][loader] or [`@lingui/metro-transformer`][metro-transformer].

See the [CLI reference][reference] for all commands and options.

## License

This package is licensed under the [MIT][license] license.

[license]: https://github.com/lingui/js-lingui/blob/main/LICENSE
[documentation]: https://lingui.dev
[installation]: https://lingui.dev/installation
[conf]: https://lingui.dev/ref/conf
[reference]: https://lingui.dev/ref/cli
[catalog-formats]: https://lingui.dev/ref/catalog-formats
[extractor-vue]: https://lingui.dev/ref/extractor-vue
[vite-plugin]: https://lingui.dev/ref/vite-plugin
[loader]: https://lingui.dev/ref/loader
[metro-transformer]: https://lingui.dev/ref/metro-transformer
[package]: https://www.npmjs.com/package/@lingui/cli
[badge-downloads]: https://img.shields.io/npm/dw/@lingui/cli.svg
[badge-version]: https://img.shields.io/npm/v/@lingui/cli.svg
[badge-license]: https://img.shields.io/npm/l/@lingui/cli.svg
