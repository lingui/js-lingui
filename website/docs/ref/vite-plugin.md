---
title: Lingui Vite Plugin
description: Use Lingui with Vite and compile your message catalogs on the fly
---

# Vite Plugin

Vite is a blazing fast frontend build tool powering the next generation of web applications.

The `@lingui/vite-plugin` is a Vite plugin that compiles Lingui catalogs on the fly, can transform Lingui macros natively and provides the necessary configuration for seamless integration with Vite.

[![npm-version](https://img.shields.io/npm/v/@lingui/vite-plugin?logo=npm&cacheSeconds=1800)](https://www.npmjs.com/package/@lingui/vite-plugin)
[![npm-downloads](https://img.shields.io/npm/dt/@lingui/vite-plugin?cacheSeconds=500)](https://www.npmjs.com/package/@lingui/vite-plugin)

## Installation

Install `@lingui/vite-plugin` as a development dependency:

```bash npm2yarn
npm install --save-dev @lingui/vite-plugin
```

For a complete installation guide, see [Installation and Setup](/installation#vite).

## Usage

To integrate Lingui with Vite, add the `@lingui/vite-plugin` inside your `vite.config.ts` as follows:

```ts title="vite.config.ts"
import { UserConfig } from "vite";
import { lingui } from "@lingui/vite-plugin";

const config: UserConfig = {
  plugins: [lingui({ macroTransform: true })],
};
```

With `macroTransform: true`, the plugin also transforms Lingui macros, so you don't need a separate Babel or SWC plugin for Lingui. This is the recommended setup. See [Native Macro Transform](#native-macro-transform) for details.

Then use [dynamic imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports) in your code to load only necessary catalog:

```ts
export async function dynamicActivate(locale: string) {
  const { messages } = await import(`./locales/${locale}.po`);

  i18n.load(locale, messages);
  i18n.activate(locale);
}
```

Remember that the file extension is mandatory.

:::tip
If you are using a format that has a different extension than `*.po`, you need to specify the `?lingui` suffix:

```ts
const { messages } = await import(`./locales/${language}.json?lingui`);
```

:::

## Native Macro Transform

The plugin can transform Lingui macros (`t`, `msg`, `<Trans>`, and others) natively using [`@lingui/native-tools`](https://www.npmjs.com/package/@lingui/native-tools), a Rust and SWC based toolchain. When enabled, `@rolldown/plugin-babel` with `linguiTransformerBabelPreset`, `@lingui/babel-plugin-lingui-macro` or `@lingui/swc-plugin` are no longer needed for Lingui macros.

The native transform is up to 2.5x faster than SWC with the Lingui plugin and up to 29x faster than Babel. It is disabled by default and will become the default in the next major release.

```ts title="vite.config.ts"
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { lingui } from "@lingui/vite-plugin";

export default defineConfig({
  plugins: [react(), lingui({ macroTransform: true })],
});
```

This works with `@vitejs/plugin-react`, `@vitejs/plugin-react-swc` and Vite 8+ with Rolldown. The transform runs in the `pre` stage and only touches files that import Lingui macros.

:::caution
The native transform doesn't support [`macro.jsxRuntime: "solid"`](/ref/conf#macrojsxruntime) yet and fails with an error when it is set. Solid projects should keep transforming macros with `@lingui/babel-plugin-lingui-macro`, see the [Solid tutorial](/tutorials/solid#configure-vite).
:::

Macro options such as `macro.corePackage`, `macro.jsxPackage`, `macro.jsxPlaceholderAttribute`, `macro.jsxPlaceholderDefaults`, `macro.idPrefixLeader` and `runtimeConfigModule` are read from your [Lingui configuration](/ref/conf), so in most cases `true` is all you need.

Production builds emit `id`-only message descriptors, while development builds keep the `message` as well. This matches the behavior of the Babel and SWC plugins. To change it, set `descriptorFields` in the `macro` overrides, for example `"message"` to keep messages in production builds.

:::info
`@lingui/native-tools` ships prebuilt binaries for macOS, Linux, Windows and Android. There is no WASM fallback, so make sure your build environment matches one of the supported platforms. The binary is loaded lazily, only when `macroTransform` is enabled.
:::

:::note
`lingui extract` still uses Babel by default. Use the [native extractor](/guides/custom-extractor#native-extractor) to extract without Babel as well.
:::

### Options Reference

`macroTransform` accepts `true` to enable the transform with default options, or an object to fine-tune it:

```ts title="vite.config.ts"
lingui({
  macroTransform: {
    macro: {
      jsxPlaceholderAttribute: "_t",
    },
    parser: {
      syntax: "typescript",
      decorators: true,
    },
  },
});
```

- `macro` - overrides for the macro options derived from your Lingui configuration. Accepts a partial [`LinguiMacroOptions`](https://www.npmjs.com/package/@lingui/native-tools) object from `@lingui/native-tools`, for example `corePackage`, `jsxPackage`, `jsxPlaceholderAttribute`, `jsxPlaceholderDefaults`, `runtimeModules`, `idPrefixLeader` or `descriptorFields`. Explicit values take precedence over the values from `lingui.config`.
- `parser` - SWC parser options, the same as [`jsc.parser`](https://swc.rs/docs/configuration/compilation#jscparser) in `.swcrc`. The actual syntax (ECMAScript or TypeScript) and JSX support are inferred from the file name, Decorators are enabled by default. A custom `parser` replaces the defaults, so set `decorators: true` yourself if you need them.

## Options

### `failOnMissing`

Fail the build when missing translations are detected.

- `true` or `"resolved"`: fail only if a translation is still missing after `fallbackLocales` are applied.
- `"catalog"`: fail if the target locale catalog itself has missing translations before `fallbackLocales` are applied.
- `false` or omitted: do not fail the build on missing translations.

### `failOnCompileError`

Fail the build when message compilation produces errors.

### `macroTransform`

Enable the native macro transform. Accepts `true` or an object with `macro` and `parser` overrides. Default: `false`. See [Native Macro Transform](#native-macro-transform).

## `linguiTransformerBabelPreset`

If you use `@rolldown/plugin-babel`, `@lingui/vite-plugin` exports `linguiTransformerBabelPreset` as a convenience helper for macro transformation:

```ts title="vite.config.ts"
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { lingui, linguiTransformerBabelPreset } from "@lingui/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    lingui(),
    babel({
      presets: [linguiTransformerBabelPreset()],
    }),
  ],
});
```

The preset prints a notice recommending the native macro transform. Set the `LINGUI_SUPPRESS_BABEL_WARNING=1` environment variable to hide it. The preset is not deprecated, but the native transform will become the default in the next major release.

### Migrating to the Native Macro Transform

1.  Enable the native transform: `lingui({ macroTransform: true })`.
2.  Remove `linguiTransformerBabelPreset` from the `@rolldown/plugin-babel` presets. If Babel was only used for Lingui, remove `@rolldown/plugin-babel` entirely, together with `@lingui/babel-plugin-lingui-macro` if nothing else uses it.
3.  If you keep `@rolldown/plugin-babel` for other presets (for example React Compiler), place `lingui()` before `babel()` in the `plugins` array so macros are transformed first.

```ts title="vite.config.ts"
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { lingui } from "@lingui/vite-plugin";

export default defineConfig({
  plugins: [react(), lingui({ macroTransform: true })],
});
```

## See Also

- [Dynamic Loading](/guides/dynamic-loading-catalogs)
- [Dynamic Import in Vite](https://vitejs.dev/guide/features.html#dynamic-import)
