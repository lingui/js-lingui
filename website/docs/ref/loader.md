# Webpack Loader

It's a good practice to use compiled message catalogs during development. However, running [`compile`](/docs/ref/cli#compile) everytime messages are changed soon becomes tedious.

`@lingui/loader` is a webpack loader, which compiles messages on the fly:

## Installation

Install `@lingui/loader` as a development dependency:

```bash npm2yarn
npm install --save-dev @lingui/loader
```

## Usage

Simply prepend `@lingui/loader!` in front of path to message catalog you want to import. Here's an example of dynamic import:

Extension is mandatory. If you use minimal or lingui file format, use `.json`. In case of using po format, use `.po`.

``` jsx
export async function dynamicActivate(locale: string) {
   const { messages } = await import(`@lingui/loader!./locales/${locale}/messages.json`)
   i18n.load(locale, messages)
   i18n.activate(locale)
}
```

See the [guide about dynamic loading catalogs](/docs/guides/dynamic-loading-catalogs) for more info.
