# Webpack Loader

The Webpack loader compiles catalogs on the fly. In summary, the `lingui compile` command isn't needed when using this loader.

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

See the [guide about dynamic loading catalogs](/docs/guides/dynamic-loading-catalogs.md) for more info.
