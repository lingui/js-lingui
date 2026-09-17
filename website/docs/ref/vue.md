---
title: Lingui Vue API
description: Reference for the Lingui Vue API, components, template macros and Vite integration
---

# Vue API Reference

The Lingui Vue API, provided by the `@lingui/vue` package, integrates Lingui's core JavaScript functionality directly into Vue 3, extending Vue components with the ability to dynamically manage localization.

This API provides Vue-specific components that automatically update the user interface when the active language or interpolated variables change, and a template compiler transform that brings Lingui macros to single-file components.

## Installation

```bash npm2yarn
npm install --save @lingui/core @lingui/vue
npm install --save-dev @lingui/cli @lingui/vite-plugin @lingui/extractor-vue
```

Vue 3.4 or later is required.

## `defineConfig`

We recommend using `defineConfig` from `@lingui/vue/config` to configure Lingui for Vue projects. It applies the Vue-specific settings, so you don't need to configure them manually. Add the [Vue extractor](/ref/extractor-vue) to extract messages from `.vue` files:

```ts title="lingui.config.ts"
import { defineConfig } from "@lingui/vue/config";
import { createVueExtractor } from "@lingui/extractor-vue";
import babel from "@lingui/cli/api/extractors/babel";

export default defineConfig({
  locales: ["en", "cs"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "src/locales/{locale}",
      include: ["src"],
    },
  ],
  extractors: [babel, createVueExtractor()],
});
```

It is equivalent to configuring the Vue-specific options manually:

```ts title="lingui.config.ts"
export default {
  locales: ["en", "cs"],
  sourceLocale: "en",
  catalogs: [
    {
      path: "src/locales/{locale}",
      include: ["src"],
    },
  ],
  extractors: [babel, createVueExtractor()],
  macro: {
    jsxPackage: ["@lingui/vue/macro"],
  },
  runtimeConfigModule: {
    Trans: ["@lingui/vue", "Trans"],
    useLingui: ["@lingui/vue", "useLingui"],
  },
};
```

## Vite Integration

The `linguiVue` plugin from `@lingui/vue/vite` wires everything up in a Vite project:

1. It registers the [template transform](#template-transform) in `@vitejs/plugin-vue`, so macros work inside `<template>` blocks.
2. It runs [`@lingui/babel-plugin-lingui-macro`](/ref/babel-plugin-lingui-macro) on `.vue`, `.js`, `.ts`, `.jsx` and `.tsx` modules that import from `@lingui/core/macro` or `@lingui/vue/macro`.

Place it after `vue()`:

```ts title="vite.config.ts"
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { lingui } from "@lingui/vite-plugin";
import { linguiVue } from "@lingui/vue/vite";

export default defineConfig({
  plugins: [vue(), linguiVue(), lingui()],
});
```

| Option             | Type                                              | Description                                                                                                                                      |
| ------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `descriptorFields` | `"auto"` \| `"all"` \| `"id-only"` \| `"message"` | Which message descriptor fields are kept in the compiled code. Defaults to `"id-only"` in production builds and `"all"` otherwise.               |
| `template`         | `false` \| `LinguiTemplateTransformOptions`       | Options of the template transform, or `false` to disable it (when registering [`linguiTemplateTransform`](#template-transform) yourself).       |
| `macro`            | `boolean`                                         | Set to `false` to skip the Babel macro transform, e.g. when you run `@rolldown/plugin-babel` with [`linguiTransformerBabelPreset`](/ref/vite-plugin). |
| `cwd`, `configPath`, `skipValidation` | | Passed to the Lingui config discovery, same as in [`@lingui/vite-plugin`](/ref/vite-plugin). |

:::tip JSX and TSX
Vue JSX is compiled by `@vitejs/plugin-vue-jsx`. Import the macros from `@lingui/vue/macro` in `.jsx`/`.tsx` files: `linguiVue()` transforms them before `vueJsx()` compiles the JSX away, whatever the order of the two plugins. Passing the macro plugin to `vueJsx({ babelPlugins: ["@lingui/babel-plugin-lingui-macro"] })` works as well.
:::

### Nuxt

Nuxt registers `@vitejs/plugin-vue` and `@vitejs/plugin-vue-jsx` itself, so only the Lingui plugins have to be added to the Vite options. Create the `i18n` instance in a Nuxt plugin: it runs once per request on the server and once per page load on the client, which is exactly what [server-side rendering](#server-side-rendering) needs.

```ts title="nuxt.config.ts"
import { lingui } from "@lingui/vite-plugin";
import { linguiVue } from "@lingui/vue/vite";

export default defineNuxtConfig({
  vite: {
    plugins: [linguiVue(), lingui()],
  },
});
```

```ts title="app/plugins/lingui.ts"
import { setupI18n } from "@lingui/core";
import { createLingui } from "@lingui/vue";
import { messages as en } from "../../locales/en.po";
import { messages as fr } from "../../locales/fr.po";

export default defineNuxtPlugin((nuxtApp) => {
  const locale = useRequestURL().searchParams.get("lang") === "fr" ? "fr" : "en";
  const i18n = setupI18n({ locale, messages: { en, fr } });

  nuxtApp.vueApp.use(createLingui({ i18n }));
});
```

Point `catalogs[].include` of the Lingui config to the `app` directory, add `createVueExtractor()` from [`@lingui/extractor-vue`](/ref/extractor-vue) to `extractors`, and run `lingui extract` as usual.

## Template Transform

Vue templates are compiled by the Vue compiler, not by Babel, so the Babel macro can't see them. `@lingui/vue/compiler` exports `linguiTemplateTransform()`, a Vue compiler [node transform](https://github.com/vuejs/core/tree/main/packages/compiler-core) that compiles the Lingui macros inside `<template>` blocks:

- `<Trans>`, `<Plural>`, `<Select>` and `<SelectOrdinal>` elements,
- `` t`...` `` tagged templates and `t({ ... })` descriptor calls in interpolations, bound attributes, `v-on` handlers and `v-for` sources.

The transform is registered automatically by [`linguiVue()`](#vite-integration). You can also register it manually:

```ts title="vite.config.ts"
import vue from "@vitejs/plugin-vue";
import { linguiTemplateTransform } from "@lingui/vue/compiler";

vue({
  template: {
    compilerOptions: {
      nodeTransforms: [linguiTemplateTransform()],
    },
  },
});
```

| Option                 | Type                                              | Description                                                                                                  |
| ---------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `descriptorFields`     | `"auto"` \| `"all"` \| `"id-only"` \| `"message"` | Which message descriptor fields are kept in the compiled template. `"auto"` keeps only the `id` in production. |
| `tags`                 | `{ Trans?, Plural?, Select?, SelectOrdinal? }`    | Tag names of the macro components. Matching is case-insensitive and accepts kebab-case.                      |
| `macroNames`           | `{ t?, plural?, select?, selectOrdinal?, ph? }`   | Names of the macros recognized inside template expressions.                                                  |
| `placeholderAttribute` | `string`                                          | Same as [`macro.jsxPlaceholderAttribute`](/ref/conf#macro.jsxplaceholderattribute).                          |
| `placeholderDefaults`  | `Record<string, string>`                          | Same as [`macro.jsxPlaceholderDefaults`](/ref/conf#macro.jsxplaceholderdefaults).                            |

### How templates are compiled

The transform produces the same message descriptors as the JSX macros. Inline elements are moved into indexed named slots, so all their attributes, bindings and event listeners stay in the template:

```vue
<template>
  <Trans>Hello <b>{{ name }}</b>, read the <a :href="url" @click="track">docs</a>.</Trans>
</template>

<!-- ↓ ↓ ↓ ↓ ↓ ↓ -->

<template>
  <Trans v-bind="{ id: 'YFoG-s', message: 'Hello <0>{name}</0>, read the <1>docs</1>.', values: { name } }">
    <template #0><b /></template>
    <template #1><a :href="url" @click="track" /></template>
  </Trans>
</template>
```

Expressions in interpolations follow the same rules as in JSX: `{{ name }}` becomes the `{name}` placeholder, other expressions become positional placeholders (`{0}`), and `{{ ph({ name: user.name }) }}` names the placeholder explicitly.

`` t`...` `` in expressions compiles to a call of the `t` function returned by [`useLingui`](#uselingui):

```vue
<script setup>
import { useLingui } from "@lingui/vue/macro";

const { t } = useLingui();
</script>

<template>
  <input :placeholder="t`Search`" />
  <p>{{ t`Hello ${name}` }}</p>
</template>

<!-- ↓ ↓ ↓ ↓ ↓ ↓ -->

<template>
  <input :placeholder="t({ id: 'A1taO8', message: 'Search' })" />
  <p>{{ t({ id: "OVaF9k", message: "Hello {name}", values: { name } }) }}</p>
</template>
```

:::tip Imports in templates
Import `Trans`, `Plural`, `Select`, `SelectOrdinal` and `useLingui` from `@lingui/vue/macro` in `<script setup>`. The Babel macro (run by [`linguiVue()`](#vite-integration)) rewrites the references of the compiled template to the runtime components from `@lingui/vue`. Without a Babel step, import them from `@lingui/vue` directly.
:::

### Limitations

- Macros are matched by name: the transform doesn't see the imports of `<script setup>`. Every `<Trans>` element with content, every `<Plural>`, `<Select>` and `<SelectOrdinal>` with an `other` case, and every `` t`...` `` or `t({ id, message })` call is compiled, whatever `Trans` or `t` refers to. Rename the macros with the `tags` and `macroNames` options if they collide with other components or functions.
- `v-if`, `v-else`, `v-for` and `v-slot` can be used on the macro element itself, but not on elements inside a message. Move the condition or loop outside of `<Trans>`.
- `<slot>` outlets can't be placed inside a message.
- Labeled expressions `${{ name: value }}` can't be written inside `{{ }}` interpolations, because the closing braces end the interpolation. Use `${ph({ name: value })}` instead.
- Template refs and custom directives on elements inside a message are not preserved, as the elements are re-created with the translated content.
- Whitespace follows the [`whitespace`](https://vuejs.org/api/application.html#app-config-compileroptions-whitespace) strategy of the Vue compiler. With the default `condense`, text is trimmed at the boundaries of the message and consecutive whitespace is collapsed. If you change `whitespace`, `delimiters` or other `compilerOptions` in your build, pass the same [`compilerOptions`](/ref/extractor-vue#compiler-options) to the extractor, as the message IDs depend on them.

### Server-side rendering

The template transform is applied to server builds as well (Vue's SSR compiler keeps user node transforms), and `Trans` renders through `renderToString` and hydrates without mismatches. Two rules apply to any SSR app:

- Create the `i18n` instance per request with `setupI18n()` instead of the shared `i18n` singleton from `@lingui/core`, so concurrent requests don't leak their locale into each other.
- Activate the locale before rendering on the server and before mounting on the client. `I18nProvider` renders nothing until a locale is active, which would otherwise cause a hydration mismatch.

Without a `render`, `component` or `defaultComponent`, `Trans` renders a fragment, which shows up as `<!--[-->` and `<!--]-->` markers in the server HTML. Vue needs them to hydrate a translation that sits next to other text.

```ts title="src/entry-server.ts"
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { setupI18n } from "@lingui/core";
import { I18nProvider } from "@lingui/vue";
import App from "./App.vue";

export async function render(locale: string, messages: Messages) {
  const i18n = setupI18n({ locale, messages: { [locale]: messages } });

  const app = createSSRApp({
    render: () => h(I18nProvider, { i18n }, { default: () => h(App) }),
  });

  return renderToString(app);
}
```

## Rendering of Translations {#rendering-translations}

All i18n components render translations as plain text by default, without a wrapping tag. You can customize this behavior in two ways:

- Globally: Set the `defaultComponent` prop on the [`I18nProvider`](#i18nprovider) component.
- Locally: Use the `render` or `component` props on individual i18n components.

### Global Configuration

You can set a default rendering component using the `defaultComponent` prop in [`I18nProvider`](#i18nprovider). This is especially useful in cases where you may want translations to be rendered inside a specific component by default.

### Local Configuration

You can customize how translations are rendered locally within individual i18n components using the following props:

| Prop name   | Type                                     | Description                                                   |
| ----------- | ---------------------------------------- | ------------------------------------------------------------- |
| `render`    | Function(props) -> `VNodeChild` \| `null` | Custom render callback to render translation                  |
| `component` | `Component` \| `string` \| `null`         | Vue component (or tag name) to wrap the translation           |
| `comment`   | `string`                                 | Comment picked up by extractor to provide translation context |

When using the `render` callback, it accepts an object of type `TransRenderProps` as an argument:

```ts
type TransRenderProps = {
  id: string;
  translation: VNodeChild;
  message?: string | null;
};
```

- `id` - The message ID.
- `translation` - The translated message.
- `message` - The compiled message (generally not needed).

If you choose to use the `component` prop, the same object is passed as props to your custom component, and the translation is also passed as its default slot. Declare the `id`, `message` and `translation` props in the component (or set `inheritAttrs: false`), otherwise Vue renders them as attributes on its root element.

#### Important Notes

- You cannot use both `render` and `component` props simultaneously.
- Both `render` and `component` can be set to `null` to override the global `defaultComponent` and render a string without a wrapping component.

#### Examples

Using a custom component:

```vue
<script setup>
import Label from "./Label.vue"; // <span class="label"><slot /></span>
</script>

<template>
  <Trans :component="Label">Link to docs</Trans>
  <!-- renders as <span class="label">Link to docs</span> -->
</template>
```

Using a tag name or a render function:

```vue
<template>
  <Trans component="p">Link to docs</Trans>
  <!-- renders as <p>Link to docs</p> -->

  <Trans :render="({ translation }) => h(Icon, { label: translation })">Sign in</Trans>
  <!-- renders as <Icon label="Sign in" /> -->
</template>
```

## Lingui Context

Message catalogs and the active locale are provided through Vue's provide/inject in the [`I18nProvider`](#i18nprovider). You can access this context using the [`useLingui`](#uselingui) composable.

The `LinguiInjectionKey` symbol is exported from the `@lingui/vue` package. While most users will not need to interact with it directly, it can be useful for advanced scenarios where the default behavior of `I18nProvider` doesn't meet your specific needs.

### `I18nProvider`

The `I18nProvider` provides Lingui context to all components in the subtree. It should be rendered as top-level component of your application.

It ensures that its children are only rendered after a locale has been activated, guaranteeing that any components relying on `i18n` have access to the translations. Additionally, the `I18nProvider` subscribes to change events emitted by the `i18n` object, automatically updating components that consume the Lingui context whenever messages are updated or a new locale is activated.

| Prop name          | Type        | Description                                                                  |
| ------------------ | ----------- | ---------------------------------------------------------------------------- |
| `i18n`             | `I18n`      | The `I18n` object instance (usually the one imported from `@lingui/core`)    |
| `defaultComponent` | `Component` | A Vue component within which translation strings will be rendered (optional) |

The `defaultComponent` serves the same purpose as the `component` prop in other i18n components. For a detailed explanation of how translations are rendered, see the [Rendering of Translations](#rendering-translations) section at the beginning of this document.

#### Examples

```vue title="src/App.vue"
<script setup>
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/vue";
import { messages as messagesEn } from "./locales/en";
import DefaultI18n from "./DefaultI18n.vue";
import Inbox from "./Inbox.vue";

i18n.load({
  en: messagesEn,
});
i18n.activate("en");
</script>

<template>
  <I18nProvider :i18n="i18n" :default-component="DefaultI18n">
    <Inbox />
  </I18nProvider>
</template>
```

### `createLingui`

`createLingui` is a Vue plugin alternative to the `I18nProvider` component. It provides the Lingui context to the whole application:

```ts title="src/main.ts"
import { createApp } from "vue";
import { i18n } from "@lingui/core";
import { createLingui } from "@lingui/vue";
import App from "./App.vue";

i18n.load("en", messages);
i18n.activate("en");

createApp(App).use(createLingui({ i18n })).mount("#app");
```

| Option             | Type        | Description                                                      |
| ------------------ | ----------- | ---------------------------------------------------------------- |
| `i18n`             | `I18n`      | The `I18n` object instance                                       |
| `defaultComponent` | `Component` | Same as the `defaultComponent` prop of `I18nProvider` (optional) |

Unlike `I18nProvider`, the plugin does not wait for `i18n.activate()` before rendering the application.

### `useLingui`

The `useLingui` composable provides access to the Lingui context. It returns an object with the following properties:

| Key                | Type               | Description                                                                              |
| ------------------ | ------------------ | ---------------------------------------------------------------------------------------- |
| `i18n`             | `ShallowRef<I18n>` | Reactive reference to the `I18n` object instance that you passed to `I18nProvider`       |
| `_`                | `I18n["_"]`        | Reference to the [`i18n._`](/ref/core#i18n._) function, explained below                  |
| `t`                | `I18n["_"]`        | Alias of `_`, called by templates compiled with the [template transform](#template-transform) |
| `defaultComponent` | `Component`        | The same `defaultComponent` you passed to `I18nProvider`, if provided                    |

The `i18n` value returned from `useLingui` is a shallow ref that is triggered whenever the locale or the catalogs change. Read `i18n.value.locale` in a `computed` or in the render function to react to updates. In templates and `<script setup>`, refs are unwrapped automatically, so `{{ i18n.locale }}` just works.

To keep translations reactive, `useLingui` provides the `_` function, which is the same as [`i18n._`](/ref/core#i18n._) but bound to the current Lingui context. You can safely call this `_` function inside `computed`:

```vue
<script setup>
import { computed } from "vue";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/vue";

const { _, i18n } = useLingui();
const label = computed(() => _(msg`Current locale`));
</script>

<template>
  <span>{{ label }}: {{ i18n.locale }}</span>
</template>
```

:::tip
There is a [macro version](/ref/macro#uselingui) of the `useLingui` composable which supports all features of the [`t` macro](/ref/macro#t) and uses the runtime `useLingui` composable (from `@lingui/vue`) under the hood:

```vue
<script setup>
import { computed } from "vue";
import { useLingui } from "@lingui/vue/macro";

const { t } = useLingui();

const userName = "Tim";
const greeting = computed(() => t`Hello ${userName}`);
</script>
```

In templates, `` t`...` `` is compiled by the [template transform](#template-transform) into a call of the same `t` function, so one `useLingui()` in `<script setup>` serves both the script and the template.
:::

## Components

The `@lingui/vue` package provides the `Trans` component for rendering translations in your application. It is a low-level component that allows you to render translations with dynamic values and components.

`Plural`, `Select` and `SelectOrdinal` are exported as aliases of `Trans`: the [template transform](#template-transform) compiles them into a `Trans` message descriptor, the aliases only let templates resolve them without a Babel step.

:::caution
While this component is available, you will likely find [Macros](/ref/macro) to be more convenient and developer-friendly. Macros simplify the translation process and reduce boilerplate code.
:::

This section serves as a reference for those who prefer to use the components directly.

### `Trans`

| Prop name    | Type     | Description                                                          |
| ------------ | -------- | -------------------------------------------------------------------- |
| `id`         | `string` | Key, the message ID                                                  |
| `message`    | `string` | Default message                                                      |
| `values`     | `object` | Variables to interpolate into the message                            |
| `components` | `object` | VNodes, components or tag names used for inline elements (`<0>...</0>`) |

The `values` and `components` props allow to pass dynamic values and components used for formatting the translation. Named slots can be used instead of the `components` prop: a slot named `0` (or `link`) provides the element for the `<0>` (or `<link>`) placeholder. In addition, the `comment` prop provides context to translators, helping them to understand the intent behind the message.

:::tip
Write the message directly in the [`Trans`](/ref/macro#trans) element instead if you use the template transform. It will be transformed into the runtime `Trans` usage automatically:

```vue
<Trans>Refresh inbox</Trans>

<!-- ↓ ↓ ↓ ↓ ↓ ↓ -->

<Trans v-bind="{ id: 'EsCV2T', message: 'Refresh inbox' }" />
```

:::

It's also possible to use the `Trans` component directly without macros. In this case `id` identifies the message to be translated. Static `id`, `message`, `comment` and `context` attributes are extracted and stripped in production like the macro form. Bound attributes (`:message`) are only known at runtime and aren't extracted, use the [`msg`](/ref/macro#msg) macro for messages picked dynamically.

#### Examples

```vue
<script setup>
import { h } from "vue";
import { Trans } from "@lingui/vue";
</script>

<template>
  <div>
    <!-- Simple translation without dynamic values -->
    <Trans id="my.message" message="Hello World" />

    <!-- Translation with dynamic values -->
    <Trans id="greeting" message="Hello {name}" :values="{ name: 'Arthur' }" />

    <!-- Translation with a comment for translators -->
    <Trans id="hello.world" message="Hello world" comment="A message that greets the user" />

    <!-- Translation with an element for formatting, provided as a slot -->
    <Trans id="link" message="Read <link>Description</link> below.">
      <template #link><a href="/docs" /></template>
    </Trans>

    <!-- The same with the `components` prop -->
    <Trans id="link" message="Read <link>Description</link> below." :components="{ link: h('a', { href: '/docs' }) }" />
  </div>
</template>
```

#### Plurals

If for some reason you cannot use the template transform, you can render plurals using the simple `Trans` component by passing the [ICU MessageFormat](/guides/message-format) string as the `message` prop:

```vue
<template>
  <Trans
    id="application.pages.carsList"
    message="{count, plural, =1 {# car} other {# cars}}"
    :values="{ count: cars.length }"
  />
</template>
```
