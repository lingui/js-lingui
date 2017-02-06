[Docs](https://github.com/lingui/js-lingui/wiki) 

[![CircleCI](https://circleci.com/gh/lingui/js-lingui/tree/master.svg?style=svg)](https://circleci.com/gh/lingui/js-lingui/tree/master)

Lingui - javascript tools for ~~internationalization~~ i18n
=========================================================

Internationalization is hard, just try to spell it and pronounce it! `js-lingui` is a set of tools to help translate UI and maintain translations. The main parts are ReactJS components for writing multilingual messages and babel-plugin which transforms ReactJS components into ICU message format:

```js
<Trans>January</Trans>
// becomes <Trans id="January" />

const name = "Fred"
<Trans>Hello, my name is {name}</Trans>
// becomes <Trans id="Hello, my name is {name}" params={{ name }} />

<Trans>See the <a href="/more">description</a> below.</Trans>
// becomes <Trans id="See the <0>description</0> below." components={[<a href="/more" />]} />

const count = 42
<Plural 
  value={count} 
  zero={<strong>No books</strong>}
  one="# book" 
  other="# books" 
/>
/* becomes:
{count, plural, 
  zero {<0>No Books</0>} 
  one {# book} 
  other {# books}
}
*/
```

See [wiki](https://github.com/lingui/js-lingui/wiki) for more info or [example-usecase](https://github.com/lingui/js-lingui/blob/master/packages/example-usecase/src/Usecase.js) for detailed example.

Tools
-----

### `babel-plugin-lingui-transform-react`

[![npm](https://img.shields.io/npm/v/babel-plugin-lingui-transform-react.svg)](https://www.npmjs.com/package/babel-plugin-lingui-transform-react)

Write multilingual messages in human-readable format and let `babel` to preprocess it.

Example:

```js
/* Variable interpolation & inlined components */
<Trans>Hello world, my name is <strong>{joe}</strong></Trans>
/* <Trans id="Hello world, my name is <0>{joe}</0>" params={{joe}} /> */

/* Plural format */
<Plural 
  count={count} 
  zero="There're no bottles left on the wall."
  one="There's 1 bottle hanging on the wall."
  many="There're # bottles hanging on the wall."
/>
/* (truncated) <Trans id="{count, plural, zero {...} one {...} many {...}}" params={{count}} /> */
```

### [`babel-plugin-lingui-extract-messages`](https://github.com/lingui/js-lingui/tree/master/packages/babel-plugin-lingui-extract-messages)

[![npm](https://img.shields.io/npm/v/babel-plugin-lingui-extract-messages.svg)](https://www.npmjs.com/package/babel-plugin-lingui-extract-messages)

Extract all messages for translation to external file.

### `lingui-react`

[![npm](https://img.shields.io/npm/v/lingui-react.svg)](https://www.npmjs.com/package/lingui-react)

React bindings for message formating.

#### Components
- `I18nProvider` – context provider of all i18n data (messages, current language, etc)
- `InjectI18n` - HOC for passing i18n data from context to props of wrapped component
- [`Trans`](https://github.com/lingui/js-lingui/wiki/Trans) – component for message formating and translation
- `Select` – select message based on variable
- [`Plural`](https://github.com/lingui/js-lingui/wiki/Plural) – select plural based on number
- `SelectOrdinal` – select ordinal number

## License

[MIT](./LICENSE.md)
