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

:::note
Catalogs with the `.json` extension are treated differently by Webpack-compatible bundlers. They load as ES module with default export, so your import should look like this:

```ts
const { messages } = (await import(`@lingui/loader!./locales/${locale}/messages.json`)).default;
```

:::

## See Also

- [Dynamic Loading of Message Catalogs](/guides/dynamic-loading-catalogs)
- [Catalog Formats](/ref/catalog-formats)
