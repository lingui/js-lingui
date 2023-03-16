# Webpack Loader

Webpack loader which compiles catalogs on the fly. In summary, `lingui compile` command isn't required when using this loader

## Installation

Install `@lingui/loader` as a development dependency:

```bash npm2yarn
npm install --save-dev @lingui/loader
```

## Usage

Simply prepend `@lingui/loader!` in front of path to message catalog you want to import. Here's an example of dynamic import:

Extension is mandatory.
```ts
export async function dynamicActivate(locale: string) {
   const { messages } = await import(`@lingui/loader!./locales/${locale}/messages.po`)
   i18n.load(locale, messages)
   i18n.activate(locale)
}
```

:::note
Catalogs with `.json` extension treated differently by Webpack. They loaded as ES module with default export, so your import should look like that:

```ts
const { messages } = (await import(`@lingui/loader!./locales/${locale}/messages.po`)).default
```
:::

See the [guide about dynamic loading catalogs](/docs/guides/dynamic-loading-catalogs.md) for more info.
