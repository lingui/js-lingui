---
title: Vue.js Extractor
description: Extract messages from Vue single-file components with @lingui/extractor-vue. Installation, configuration and options
---

# Vue.js Extractor

The `@lingui/extractor-vue` package provides a custom extractor that handles Vue.js files.

It extracts messages from `<script>` and `<script setup>` blocks as well as from `<template>` blocks, including the [`@lingui/vue`](/ref/vue) template macros (`<Trans>`, `<Plural>`, `<Select>`, `<SelectOrdinal>` and `` t`...` ``).

## Installation

```bash npm2yarn
npm install --save-dev @lingui/extractor-vue
```

To extract the template macros, the extractor needs `@lingui/vue`, the runtime package of the [Vue integration](/ref/vue), and Vue 3.4 or later. The configuration below also imports it. Install it as a regular dependency if your app doesn't have it yet:

```bash npm2yarn
npm install @lingui/vue
```

`@lingui/vue` is an optional peer dependency: without it, the extractor still extracts messages from `<script>` blocks and `i18n._()` calls from `<template>` blocks.

## Usage

It is required that you use JavaScript or TypeScript for your Lingui configuration.

```js title="lingui.config.{js,ts}"
import { defineConfig } from "@lingui/vue/config";
import { createVueExtractor } from "@lingui/extractor-vue";
import babel from "@lingui/cli/api/extractors/babel";

export default defineConfig({
  locales: ["en", "nb"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "<rootDir>/src/{locale}",
      include: ["<rootDir>/src"],
    },
  ],
  extractors: [babel, createVueExtractor()],
});
```

:::tip
`defineConfig` from `@lingui/vue/config` applies the Vue-specific settings of the [`@lingui/vue`](/ref/vue#defineconfig) package. If you only extract `i18n._()` calls from Vue files, `defineConfig` from `@lingui/cli` works as well.
:::

## Options

### Template Macros

Messages written with the [`@lingui/vue` template macros](/ref/vue#template-transform) are compiled before extraction, so the extracted IDs match the ones generated at build time. Pass options of the template transform, or `false` to extract only `i18n._()` calls from templates:

```js title="lingui.config.{js,ts}"
import { createVueExtractor } from "@lingui/extractor-vue";

export default defineConfig({
  // ... other config
  extractors: [babel, createVueExtractor({ template: { tags: { Trans: "T" } } })],
});
```

### Compiler Options

The text of a message, and therefore its generated ID, depends on how the Vue compiler parses the template: the [`whitespace`](https://vuejs.org/api/application.html#app-config-compileroptions-whitespace) strategy decides which line breaks and spaces are kept, and custom [`delimiters`](https://vuejs.org/api/application.html#app-config-compileroptions-delimiters) decide what an interpolation is. If your build passes `compilerOptions` to `@vitejs/plugin-vue`, mirror them in the extractor so the extracted IDs match the ones generated at build time:

```js title="lingui.config.{js,ts}"
import { createVueExtractor } from "@lingui/extractor-vue";

export default defineConfig({
  // ... other config
  extractors: [
    babel,
    createVueExtractor({
      compilerOptions: {
        whitespace: "preserve",
        delimiters: ["${", "}"],
        isCustomElement: (tag) => tag.startsWith("my-"),
      },
    }),
  ],
});
```

Any option of `@vue/compiler-sfc` is accepted.

### Vue Reactivity Transform

With Vue's [Reactive Props Destructure](https://github.com/vuejs/rfcs/discussions/502), the Vue compiler rewrites destructured props (`name` becomes `__props.name`), which changes the message of `` t`Hello ${name}` `` and therefore its ID. The `reactivityTransform` option compiles `<script setup>` blocks before extraction so that message IDs match between extraction and runtime.

It is enabled by default when `macro.jsxRuntime` is `"vue"`, which `defineConfig` from [`@lingui/vue/config`](/ref/vue#defineconfig) sets. Otherwise, enable it explicitly:

```js title="lingui.config.{js,ts}"
import { createVueExtractor } from "@lingui/extractor-vue";

export default defineConfig({
  // ... other config
  extractors: [babel, createVueExtractor({ reactivityTransform: true })],
});
```

### Underlying Extractor

The Vue extractor compiles the `<script>`, `<script setup>` and `<template>` blocks to JavaScript and passes the result to the Babel extractor. Use the `extractor` option to pass the code to another extractor instead, for example the SWC-based [native extractor](/guides/custom-extractor#native-extractor):

```js title="lingui.config.{js,ts}"
import { createVueExtractor } from "@lingui/extractor-vue";
import { createSwcExtractor } from "@lingui/native-tools";

const swc = createSwcExtractor();

export default defineConfig({
  // ... other config
  extractors: [swc, createVueExtractor({ extractor: swc })],
});
```

The SWC extractor reads the source maps the Vue extractor passes from `@lingui/native-tools` 0.2.0, so use that version or later to get origins that point into the `.vue` file.

## See Also

- [`@lingui/vue` Reference](/ref/vue)
- [Message Extraction](/guides/message-extraction)
- [Custom Extractor](/guides/custom-extractor)
