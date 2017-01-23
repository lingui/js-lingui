| master | next |
| :---: | :---: |
| [![CircleCI](https://circleci.com/gh/lingui/js-lingui/tree/master.svg?style=svg)](https://circleci.com/gh/lingui/js-lingui/tree/master) | [![CircleCI](https://circleci.com/gh/lingui/js-lingui/tree/next.svg?style=svg)](https://circleci.com/gh/lingui/js-lingui/tree/next) | 

Lingui - javascript tools for internationalization
==================================================

`js-lingui` is a set of tools to help translate UI and maintain translations.

Tools
-----

### `babel-plugin-transform-react-trans`

Status: *in progress*

Write strings for translation in human-readable format and let `babel` to preprocess it.

Example:

```js
/* Variable interpolation & inlined components */
<Trans>Hello world, my name is <strong>{joe}</strong></Trans>
/* <Trans id="Hello world, my name is <0>{joe}</0>" params={{joe}} /> */

/* ICU format messages */
<Trans>
    <Plural 
      count={count} 
      zero="There're no bottles left"
      one="There's 1 bottle hanging"
      many="There're # bottles hanging"
    /> on the wall.
</Trans>
/* <Trans id="{plural, count, zero {...} one {...} many {...}}" params={{count}} /> */
```

### `babel-plugin-extract-messages`

Status: *upcoming*

Extract all messages for translation to external file.

### `react-trans`

Status: *in progress*

React bindings for message formating.

#### Components
- `Trans` – component for message formating and translation
- `I18nProvider` – context provider of all i18n data (messages, current language, etc)
- `InjectI18n` - HOC for passing i18n data from context to props of wrapped component

## License

[MIT](./LICENSE.md)
