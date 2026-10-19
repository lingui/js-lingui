[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/vue

> Vue 3 bindings for Lingui i18n: I18nProvider, Trans and useLingui, with compile-time macros for templates and JSX

`@lingui/vue` is part of [Lingui][documentation]. Lingui is a lightweight, open-source internationalization (i18n) library for JavaScript and TypeScript. It brings compile-time macros and a CLI for message extraction to React, React Native, Vue, SolidJS, Astro, Svelte, and Node.js.

The package brings the Lingui workflow to Vue 3, single-file components included:

- `@lingui/vue` exports `I18nProvider`, `Trans`, `useLingui` and the `createLingui` app plugin.
- `@lingui/vue/compiler` exports a Vue template transform that compiles `<Trans>`, `<Plural>`, `<Select>`, `<SelectOrdinal>` and `` t`...` `` inside `<template>` blocks into ICU messages with precomputed IDs.
- `@lingui/vue/vite` exports `linguiVue()`, a Vite plugin that registers the template transform in `@vitejs/plugin-vue` and runs the Lingui Babel macro on `<script setup>`, `.ts` and `.js` modules.
- `@lingui/vue/macro` exports the `Trans`, `Plural`, `Select`, `SelectOrdinal` and `useLingui` macros for JSX/TSX.
- `@lingui/vue/config` exports `defineConfig`, which applies the Vue-specific settings to the Lingui configuration.

## Installation

```sh
npm install @lingui/core @lingui/vue
npm install --save-dev @lingui/cli @lingui/vite-plugin @lingui/extractor-vue
```

`@lingui/core` provides the `i18n` instance passed to the provider, `@lingui/extractor-vue` extracts messages from `.vue` files.

Vue 3.4 or later is required.

## Usage

<!-- prettier-ignore -->
```vue
<script setup lang="ts">
import { Trans, Plural, useLingui } from "@lingui/vue/macro"

defineProps<{ name: string; count: number }>()

const { t } = useLingui()
</script>

<template>
  <h1>
    <Trans>Hello <b>{{ name }}</b>, read the <a href="/docs">docs</a>.</Trans>
  </h1>
  <p><Plural :value="count" one="# message" other="# messages" /></p>
  <input :placeholder="t`Search`" />
</template>
```

See the [Vue tutorial][tutorial] and the [Vue reference][reference].

## License

This package is licensed under the [MIT][license] license.

[license]: https://github.com/lingui/js-lingui/blob/main/LICENSE
[documentation]: https://lingui.dev
[tutorial]: https://lingui.dev/tutorials/vue
[reference]: https://lingui.dev/ref/vue
[package]: https://www.npmjs.com/package/@lingui/vue
[badge-downloads]: https://img.shields.io/npm/dw/@lingui/vue.svg
[badge-version]: https://img.shields.io/npm/v/@lingui/vue.svg
[badge-license]: https://img.shields.io/npm/l/@lingui/vue.svg
