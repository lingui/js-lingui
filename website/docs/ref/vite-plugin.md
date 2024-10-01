---
title: Lingui Vite Plugin
description: Use Lingui with Vite and compile your message catalogs on the fly
---

# Vite Plugin

`@lingui/vite-plugin` is a Vite plugin, which compiles Lingui catalogs on the fly and provides additional required configuration for Vite.

[![npm-version](https://img.shields.io/npm/v/@lingui/vite-plugin?logo=npm&cacheSeconds=1800)](https://www.npmjs.com/package/@lingui/vite-plugin)
[![npm-downloads](https://img.shields.io/npm/dt/@lingui/vite-plugin?cacheSeconds=500)](https://www.npmjs.com/package/@lingui/vite-plugin)

## Installation

Install `@lingui/vite-plugin` as a development dependency:

```bash npm2yarn
npm install --save-dev @lingui/vite-plugin
```

For a complete installation guide, see [Setup with Vite](/docs/tutorials/setup-vite.md).

## Usage

Simply add `@lingui/vite-plugin` inside your `vite.config.ts`:

```ts title="vite.config.ts"
import { UserConfig } from "vite";
import { lingui } from "@lingui/vite-plugin";

const config: UserConfig = {
  plugins: [lingui()],
};
```

Then in your code all you need is to use [dynamic imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports) to load only necessary catalog. Extension is mandatory.

```ts
export async function dynamicActivate(locale: string) {
  const { messages } = await import(`./locales/${locale}.po`);

  i18n.load(locale, messages);
  i18n.activate(locale);
}
```

:::tip
If you are using a format that has a different extension than `*.po`, you need to specify the `?lingui` suffix:

```ts
const { messages } = await import(`./locales/${language}.json?lingui`);
```

:::

## See Also

- [Dynamic Loading](/docs/guides/dynamic-loading-catalogs.md)
- [Dynamic Import in Vite](https://vitejs.dev/guide/features.html#dynamic-import)
