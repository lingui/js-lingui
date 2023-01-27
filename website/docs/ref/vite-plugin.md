# Vite Plugin

It's a good practice to use compiled message catalogs during development. However, running [`compile`](/docs/ref/cli.md#compile) everytime messages are changed soon becomes tedious.

`@lingui/vite-plugin` is a Vite plugin, which compiles `.po` catalogs on the fly:

## Installation

Install `@lingui/vite-plugin` as a development dependency:

```bash npm2yarn
npm install --save-dev @lingui/vite-plugin
```

## Usage

Simply add `@lingui/vite-plugin` inside your `vite.config.ts`:

```ts title="vite.config.ts"
import { UserConfig } from 'vite';
import lingui from '@lingui/vite-plugin'

const config: UserConfig = {
  plugins: [lingui()]
}
```

Then in your code all you need is to use [dynamic imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports) to load only necessary catalog. Extension is mandatory.

```ts
export async function dynamicActivate(locale: string) {
   const { messages } = await import(`./locales/${locale}.po`);

   i18n.load(locale, messages)
   i18n.activate(locale)
}
```

See the [guide about dynamic loading catalogs](/docs/guides/dynamic-loading-catalogs.md) for more info.

See [Vite's official documentation](https://vitejs.dev/guide/features.html#dynamic-import) for more info about Vite dynamic imports.

:::note
You also need to set up [babel-plugin-macros](https://github.com/kentcdodds/babel-plugin-macros) to support [macros](/docs/ref/macro.md).
:::
