---
title: Webpack-compatible loader
description: Import PO catalogs directly and compile them on the fly with @lingui/loader in Webpack, Rspack and Rsbuild, instead of running lingui compile
---

# Webpack-compatible loader

The `@lingui/loader` is a Webpack-compatible loader for Lingui message catalogs. It can be used with Webpack, Rspack, and Rsbuild. It offers an alternative to the [`lingui compile`](/ref/cli#compile) and compiles catalogs on the fly.

It enables you to `import` `.po` files directly, instead of running `lingui compile` and `import`ing the resulting JavaScript (or TypeScript) files.

## Installation

Install `@lingui/loader` as a development dependency:

```bash npm2yarn
npm install --save-dev @lingui/loader
```

## Usage

The recommended setup is to configure the loader in your bundler config and import catalogs without the inline loader syntax.

```js
module: {
  rules: [
    {
      test: /\.po$/,
      use: [
        {
          loader: "@lingui/loader",
          options: {
            failOnCompileError: true,
          },
        },
      ],
    },
    ...otherRules
  ],
}
```

Here's an example of dynamic import:

```ts
export async function dynamicActivate(locale: string) {
  const { messages } = await import(`../locales/${locale}/messages.po`);
  i18n.loadAndActivate({
    locale,
    messages,
  });
}
```

You can also prepend `@lingui/loader!` in front of the catalog path if you prefer inline loader syntax:

```ts
export async function dynamicActivate(locale: string) {
  const { messages } = await import(`@lingui/loader!./locales/${locale}/messages.po`);
  i18n.loadAndActivate({
    locale,
    messages,
  });
}
```

Remember that the file extension is mandatory.

## Options

### `failOnMissing`

Fail the build when missing translations are detected.

- `true` or `"resolved"`: fail only if a translation is still missing after `fallbackLocales` are applied.
- `"catalog"`: fail if the target locale catalog itself has missing translations before `fallbackLocales` are applied.
- `false` or omitted: do not fail the build on missing translations.

### `failOnCompileError`

Fail the build when message compilation produces errors.

:::note
Catalogs with the `.json` extension are treated differently by Webpack-compatible bundlers. They load as ES module with default export, so your import should look like this:

```ts
const { messages } = (await import(`@lingui/loader!./locales/${locale}/messages.json`)).default;
```

:::

## Native Macro Transform

`@lingui/loader/macro` is a second loader in the same package. It transforms [Lingui macros](/ref/macro) with the Rust-based [`@lingui/native-tools`](https://www.npmjs.com/package/@lingui/native-tools), so you don't need `@lingui/babel-plugin-lingui-macro` or `@lingui/swc-plugin`. It works with Webpack, Rspack, and Next.js (Turbopack and webpack). For Next.js, follow the [Next.js installation guide](/installation#nextjs).

Register it for your source files and make sure it runs before your JavaScript compiler (Babel, SWC, or the built-in one):

```js
module: {
  rules: [
    {
      test: /\.[cm]?[jt]sx?$/,
      exclude: /node_modules/,
      enforce: "pre",
      use: {
        loader: "@lingui/loader/macro",
      },
    },
    ...otherRules
  ],
}
```

The loader reads macro options from your [Lingui configuration](/ref/conf), found from the bundler's root directory, and only transforms files that import a macro package. Other files are passed through unchanged. In production builds (`NODE_ENV=production`), message descriptors keep only the message ID, like the Babel and SWC plugins do.

The output matches the Babel and SWC plugins. The native transform doesn't support `macro.jsxRuntime: "solid"` yet. Use `@lingui/babel-plugin-lingui-macro` for Solid.

### Options

#### `config`

Path to the Lingui configuration file. If omitted, the configuration is looked up from the bundler's root directory.

#### `macro`

Overrides for the macro options read from the Lingui configuration.

#### `parser`

The same options as [`jsc.parser`](https://swc.rs/docs/configuration/compilation#jscparser) in `.swcrc`. The syntax (ECMAScript or TypeScript) and JSX support are inferred from the file extension, so you rarely need to set this.

## See Also

- [Dynamic Loading of Message Catalogs](/guides/dynamic-loading-catalogs)
- [Catalog Formats](/ref/catalog-formats)
