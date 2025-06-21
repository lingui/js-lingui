# Webpack Loader

The Webpack loader compiles catalogs on the fly. It's an alternative to the [`lingui compile`](/ref/cli#compile) command: the loader enables you to `import` `.po` files directly, instead of running `lingui compile` and `import`ing the resulting JavaScript (or TypeScript) files.

## Installation

Install `@lingui/loader` as a development dependency:

```bash npm2yarn
npm install --save-dev @lingui/loader
```

## Usage

Simply prepend `@lingui/loader!` in front of path to message catalog you want to import. Here's an example of dynamic import:

The extension is mandatory.

```ts
export async function dynamicActivate(locale: string) {
  const { messages } = await import(`@lingui/loader!./locales/${locale}/messages.po`);
  i18n.load(locale, messages);
  i18n.activate(locale);
}
```

:::note
Catalogs with the `.json` extension are treated differently by Webpack. They load as ES module with default export, so your import should look like this:

```ts
const { messages } = (await import(`@lingui/loader!./locales/${locale}/messages.json`)).default;
```

:::

See the [guide about dynamic loading catalogs](../guides/dynamic-loading-catalogs.md) for more info.
