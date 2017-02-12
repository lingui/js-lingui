[Docs](https://github.com/lingui/js-lingui/wiki) 

[![CircleCI](https://circleci.com/gh/lingui/js-lingui/tree/master.svg?style=svg)](https://circleci.com/gh/lingui/js-lingui/tree/master)

# Lingui - tools for ~~internationalization~~ i18n in javascript

> Internationalization is the design and development of a product, application or document content that enables easy localization for target audiences that vary in culture, region, or language.
>
> --- [ W3C Web Internationalization FAQ](https://www.w3.org/International/questions/qa-i18n)

Building applications and products for international audiences involves internationalization (i.e: preparing app for translation) and localization (i.e: adoption of application to meet language and cultural requirements). Lingui provides tools to make i18n of JS applications as easy as possible. 

## Overview

Internationalization consists of three steps:

1. [Specify parts for localization](#specify-parts-for-localization) - This is required even for monolingual apps, because it allows to use pluralization, polite forms, date/time formatting, etc.
2. [Build a message catalog](#build-message-catalog) - Message catalogs are passed to translators
3. [Load translated messages](#load-translated-messages) and switch application language

### Specify parts for localization

The first part of i18n process is wrapping all texts with component or function, which replaces source text with translation during runtime. `js-lingui` uses [ICU Message Format](https://github.com/lingui/js-lingui/wiki/ICU-message-format) which allows using of variables and plural forms.

`lingui-react` provides several component for React applications: `Trans` is the main component for general translation, `Plural` and `Select` for pluralization and custom forms (e.g: polite forms):

```jsx
import { Trans, Plural } from 'lingui-react'

// Static text
<Trans>January</Trans>

// Variables
const name = "Fred"
<Trans>Hello, my name is {name}</Trans>

// Components
<Trans>See the <a href="/more">description</a> below.</Trans>

// Plurals
const count = 42
<Plural 
  value={count} 
  zero={<strong>No books</strong>}
  one="# book" 
  other="# books" 
/>
```

At this point, application is available only in one language (English). When no translations are available the default texts are used.

### Build message catalog

Translators are working with message catalogs which are mapping of messages from source to target language. The simplest form is a dictionary, where key is source message and value is translated one:

```js
const fr = {
  "January": "Janvier",
  "Hello, my name is {name}": "Salut, je m'appelle {name}",
  "See the <0>description</0> below.": "...",
  "{count, plural, zero {<0>No books</0>} one {# book} other {# books}": "..."
}
```

The key is also called **message ID**. It must be unique across application. It should also include all parameters so translators can change the order of words and parameters if required.

`js-lingui` provides two babel plugins and CLI for building message catalogs:

1. `babel-plugin-lingui-transform-react`

    It takes children of i18n components (e.g: `Trans`) and generate message ID. 
    
    **Note**: It's also possible to use custom message IDs. Simply pass `id` attribute to `Trans` component and children's going to be used as a default message only.
     
    ```jsx
    <Trans id="month.january">January</Trans>
    /* becomes this entry in source language file:
     * {
     *    "month.january": "January",
     *    ...
     * }
     */
    ```

2. `babel-plugin-lingui-extract-messages` - It extracts all message IDs into temporary catalogs, one catalog per file.

3. `lingui-cli` - It reads all generated catalogs and merges them into one with existing ones.

The result is one message catalog per language (e.g: `locale/fr/messages.json`).

### Load translated messages

Translated message catalogs must be loaded back to application. `lingui-react` provides `ProvideI18n` component which receives active language and messages for that language:

```jsx
import React from 'react'
import { ProvideI18n } from 'lingui-react'
import App from './App'
import messages from './locales/fr/messages.json'

render(
    <ProvideI18n language="fr" messages={messages}>
        <App />
    </ProvideI18n>,
    document.getElementById('app')
)
```

When we render messages from the first part, we get them translated in French:

```jsx
<Trans>January</Trans>
// becomes: Janvier

const name = "Fred"
<Trans>Hello, my name is {name}</Trans>
// becomes: Salut, je m'appelle Fred

<Trans>See the <a href="/more">description</a> below.</Trans>
// becomes: Voir <a href="/more">la description</a> ci-dessous

const count = 42
<Plural 
  value={count} 
  zero={<strong>No books</strong>}
  one="# book" 
  other="# books" 
/>
// becomes: 42 livres
```

See [wiki](https://github.com/lingui/js-lingui/wiki) for more info or [example-usecase](https://github.com/lingui/js-lingui/blob/master/packages/example-usecase/src/Usecase.js) for detailed example.

## Tools

### `babel-plugin-lingui-transform-react`

[![npm](https://img.shields.io/npm/v/babel-plugin-lingui-transform-react.svg)](https://www.npmjs.com/package/babel-plugin-lingui-transform-react)

Write multilingual messages in human-readable format and let `babel` generate message IDs.

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

Extract all messages for translation to external files.

### `lingui-react`

[![npm](https://img.shields.io/npm/v/lingui-react.svg)](https://www.npmjs.com/package/lingui-react)

React components for i18n.

#### Components
- `I18nProvider` – context provider of all i18n data (messages, current language, etc.)
- `WithI18n` - HOC for passing i18n data from context to props of wrapped component. Also takes care of updates when context data changes, but some ancestor skip update (`shouldComponentUpdate` returns `false`).
- [`Trans`](https://github.com/lingui/js-lingui/wiki/Trans) – component for message formating and translation
- `Select` – select message based on variable
- [`Plural`](https://github.com/lingui/js-lingui/wiki/Plural) – select plural based on number
- `SelectOrdinal` – select ordinal number

## License

[MIT](./LICENSE.md)
