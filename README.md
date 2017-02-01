[![CircleCI](https://circleci.com/gh/lingui/js-lingui/tree/master.svg?style=svg)](https://circleci.com/gh/lingui/js-lingui/tree/master)

Lingui - javascript tools for internationalization
==================================================

`js-lingui` is a set of tools to help translate UI and maintain translations.

Tools
-----

### `babel-plugin-transform-react-trans`

[![npm](https://img.shields.io/npm/v/babel-plugin-transform-react-trans.svg)](https://www.npmjs.com/package/babel-plugin-transform-react-trans)

Write strings for translation in human-readable format and let `babel` to preprocess it.

Example:

```js
/* Variable interpolation & inlined components */
<Trans>Hello world, my name is <strong>{joe}</strong></Trans>
/* <Trans id="Hello world, my name is <0>{joe}</0>" params={{joe}} /> */

/* ICU format messages */
<Plural 
  count={count} 
  zero="There're no bottles left on the wall."
  one="There's 1 bottle hanging on the wall."
  many="There're # bottles hanging on the wall."
/>
/* <Trans id="{plural, count, zero {...} one {...} many {...}}" params={{count}} /> */
```

### `babel-plugin-extract-messages`

[![npm](https://img.shields.io/npm/v/babel-plugin-extract-messages.svg)](https://www.npmjs.com/package/babel-plugin-extract-messages)

Extract all messages for translation to external file.

### `react-trans`

[![npm](https://img.shields.io/npm/v/react-trans.svg)](https://www.npmjs.com/package/react-trans)

React bindings for message formating.

#### Components
- `I18nProvider` – context provider of all i18n data (messages, current language, etc)
- `InjectI18n` - HOC for passing i18n data from context to props of wrapped component
- `Trans` – component for message formating and translation
- `Select` – select message based on variable
- `Plural` – select plural based on number
- `SelectOrdinal` – select ordinal number

## License

[MIT](./LICENSE.md)
