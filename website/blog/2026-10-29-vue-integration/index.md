---
title: "Lingui for Vue: Macros in Single-File Component Templates"
authors: [andrii-bodnar]
tags: [news, features]
---

Vue projects could already use Lingui through `@lingui/core` and `@lingui/extractor-vue`, but there were no Vue bindings, and templates had to call `i18n._` directly instead of using macros. The new `@lingui/vue` package adds Vue 3 bindings: `Trans`, `useLingui`, an app plugin, and a template transform that makes Lingui macros work inside `<template>` blocks.

![social-card image](./social-card.png)

<!--truncate-->

## Macros in templates

A single-file component now looks much like a React component with Lingui macros:

<!-- prettier-ignore -->
```html title="src/Inbox.vue"
<script setup lang="ts">
import { Trans, Plural, useLingui } from "@lingui/vue/macro";

defineProps<{ name: string; count: number }>();

const { t } = useLingui();
</script>

<template>
  <h1>
    <Trans>Hello <b>{{ name }}</b>, read the <a href="/docs">docs</a>.</Trans>
  </h1>
  <p><Plural :value="count" one="# message" other="# messages" /></p>
  <input :placeholder="t`Search`" />
</template>
```

`<Trans>`, `<Plural>`, `<Select>` and `<SelectOrdinal>` work as template elements, and `` t`...` `` works in interpolations, bound attributes and event handlers. The `t` returned by `useLingui` in `<script setup>` is the same function, so you can use it in `computed` too.

## How it works

Templates are compiled by the Vue compiler, not Babel, so the Babel macro can't see the macros inside them. `@lingui/vue` adds a Vue compiler transform that produces the same ICU messages and IDs as the JSX macros:

<!-- prettier-ignore -->
```vue
<Trans>Hello <b>{{ name }}</b>, read the <a :href="url" @click="track">docs</a>.</Trans>

<!-- ↓ ↓ ↓ ↓ ↓ ↓ -->

<Trans v-bind="{ id: 'YFoG-s', message: 'Hello <0>{name}</0>, read the <1>docs</1>.', values: { name } }">
  <template #0><b /></template>
  <template #1><a :href="url" @click="track" /></template>
</Trans>
```

Inline elements become named slots, so their attributes and event listeners stay in the template, and translators only see `<0>` and `<1>`. Production builds drop the source message and keep only the ID. The transform also runs in server builds, so `Trans` works with `renderToString` and hydration. See the [reference](/ref/vue#server-side-rendering) for the per-request `i18n` setup.

## Setup

Install the packages (Vue 3.4 or later is required):

```bash npm2yarn
npm install @lingui/core @lingui/vue
npm install --save-dev @lingui/cli @lingui/vite-plugin @lingui/extractor-vue
```

Use `defineConfig` from `@lingui/vue/config`, which sets the Vue-specific options, and add the Vue extractor next to the default Babel one:

```ts title="lingui.config.ts"
import { defineConfig } from "@lingui/vue/config";
import { createVueExtractor } from "@lingui/extractor-vue";
import babel from "@lingui/cli/api/extractors/babel";

export default defineConfig({
  locales: ["en", "cs"],
  sourceLocale: "en",
  catalogs: [{ path: "src/locales/{locale}", include: ["src"] }],
  extractors: [babel, createVueExtractor()],
});
```

Then add `linguiVue()` after `vue()` in your Vite config:

```ts title="vite.config.ts"
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { lingui } from "@lingui/vite-plugin";
import { linguiVue } from "@lingui/vue/vite";

export default defineConfig({
  plugins: [vue(), linguiVue(), lingui()],
});
```

`linguiVue()` registers the template transform and runs the macro on `<script setup>`, regular modules and Vue JSX. The [native macro transform](/ref/vite-plugin#native-macro-transform) doesn't support Vue yet, so it uses the Babel macro for now.

Finally, provide the `i18n` instance with `<I18nProvider>` or `app.use(createLingui({ i18n }))`. For Nuxt, see the [Nuxt section](/ref/vue#nuxt) of the reference.

## Try it out

`@lingui/vue` is available in the latest Lingui release. Start with the [Vue tutorial](/tutorials/vue), the [reference](/ref/vue) or the [Vite + Vue example](https://github.com/lingui/js-lingui/tree/main/examples/vite-project-vue). Share feedback in [GitHub Discussions](https://github.com/lingui/js-lingui/discussions), and if a template doesn't compile the way you expect, please [open an issue](https://github.com/lingui/js-lingui/issues).

Big thanks to [@yves-riot](https://github.com/yves-riot) for the implementation!
