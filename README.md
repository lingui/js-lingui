[Docs](https://github.com/lingui/js-lingui/wiki)

[![CircleCI](https://circleci.com/gh/lingui/js-lingui/tree/master.svg?style=svg)](https://circleci.com/gh/lingui/js-lingui/tree/master)

# Lingui - tools for ~~internationalization~~ i18n in javascript

Type-checked and intuitive way to internationalize applications in Javascript and ReactJS using ICU message format.

> Internationalization is the design and development of a product, application or document content that enables easy localization for target audiences that vary in culture, region, or language.
>
> --- [ W3C Web Internationalization FAQ](https://www.w3.org/International/questions/qa-i18n)

Building applications and products for international audiences involves internationalization (i.e: preparing app for translation) and localization (i.e: adoption of application to meet language and cultural requirements). Lingui provides tools to make i18n of JS applications using ICU message format as easy as possible. 

## Overview

Internationalization consists of three steps:

1. [Specify parts for localization](#specify-parts-for-localization) - This is required even for monolingual apps, because it allows to use pluralization, polite forms, date/time formatting, etc.
2. [Build a message catalog](#build-message-catalog) - Message catalogs are passed to translators
3. [Load translated messages](#load-translated-messages) and switch application language

### Specify parts for localization

The first part of i18n process is wrapping all texts with component or function, which replaces source text with translation during runtime. `js-lingui` uses [ICU Message Format](https://github.com/lingui/js-lingui/wiki/ICU-message-format) which allows using of variables and plural forms.

#### Javascript

`lingui-js` provides `i18n.t` template tag for translation, `i18n.plural`, `i18n.select`, `i18n.selectOrdinal` methods for pluralization and custom forms:

```js
import i18n from 'lingui-i18n'

i18n.t`January`

const name = "Fred"
i18n.t`Hello, my name is ${name}`

i18n.plural({
  value: count,
  one: `# Book`,
  other: `# Books`
})
```

#### React

[lingui-react](https://github.com/lingui/js-lingui/tree/master/packages/lingui-react) provides several component for React applications: `Trans` is the main component for general translation, `Plural` and `Select` for pluralization and custom forms (e.g: polite forms):

```jsx
import React from 'react'
import { Trans, Plural } from 'lingui-react'

class App extends React.Component {
  render() {
    const name = "Fred"
    const count = 42
    
    return (
      <div>
        // Static text
        <Trans>January</Trans>

        // Variables
        <Trans>Hello, my name is {name}</Trans>

        // Components
        <Trans>See the <a href="/more">description</a> below.</Trans>

        // Plurals
        <Plural 
          value={count} 
          zero={<strong>No books</strong>}
          one="# book" 
          other="# books" 
        />
      </div>
    )
  }
}
```

Sometimes it's necessary to translate also a text attributes, which doesn't accept React components. `lingui-react` has `WithReact` decorator, which injects `i18n` object from `lingui-i18n`. 

```jsx
import React from 'react'
import { WithI18n } from 'lingui-react'

// Translating text attributes
class LinkWithTooltip extends React.Component {
  render() {
    const { articleName, i18n } = this.props
    
    return (
      <a 
        href="/more" 
        title={i18n.t`Link to ${articleName}`}
      >
        <Trans>Link</Trans>
      </a>
    )
  }
}

// Decorate component. WithReact actually expects options as a first
// argument and return customized decorator:
// Signature: WithReact = (options) => (WrappedComponent)
LinkWithTooltip = WithReact()(LinkWithTooltip)
```

At this point, application is available only in one language (English). When no translations are available the default texts are used.

:bulb: See [tutorial](https://github.com/lingui/js-lingui/tree/master/packages/lingui-react) about i18n in React

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

`js-lingui` provides three babel plugins and CLI for building message catalogs:

```sh
npm install --save-dev lingui-i18n
# or
yarn add --dev lingui-i18n

# add directories for target languages
lingui add-locale en fr

# extract messages from source to message catalogs
lingui extract
```

Target directory for locales is configured in `package.json`:

```json
{
  "lingui": {
    "localeDir": "./locale"
  }
}
```

Under the hood, there're three babel plugins responsible for creating message catalogs:

1. `babel-plugin-lingui-transform-js`

    This plugin transforms methods and template tag from `lingui-i18n` into ICU message format which becomes message ID.
    
    ```js
    i18n.t`Hello, my name is ${name}`
    /* becomes this entry in source language file:
     * {
     *   "Hello, my name is {name}": "" 
     * } 
     */
    ```

2. `babel-plugin-lingui-transform-react`

    This plugin transforms components from `lingui-react` (e.g: `Trans`) into ICU message format which becomes message ID. 
    
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

3. `babel-plugin-lingui-extract-messages` - It extracts all message IDs into temporary catalogs, one catalog per file.

The result is one message catalog per language (e.g: `locale/fr/messages.json`).

### Load translated messages

Translated message catalogs must be loaded back to application. The process depends on type of application.

#### Javascript

`lingui-i18n` uses `.load(messages)` method to load message catalog and
`.use(language)` to select a language:

```js
import i18n from 'lingui-i18n'
import messagesEn from './locales/en/messages.json'
import messagesFr from './locales/fr/messages.json'

// load message catalogs
i18n.load({
  en: messagesEn,
  fr: messagesFr
})

// activate english language
i18n.activate('en')
```

#### React

 `lingui-react` provides `ProvideI18n` component which receives active language and messages for that language:

```jsx
import React from 'react'
import { ProvideI18n } from 'lingui-react'
import App from './App'
import messages from './locales/fr/messages.json'

render(
    <ProvideI18n language="fr" messages={{ fr: messages }}>
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

See [wiki](https://github.com/lingui/js-lingui/wiki) for more info or [example-usecase](https://github.com/lingui/js-lingui/blob/master/packages/example-usecase/src/Usecases/Children.js) for detailed example.

## Packages

### `lingui-cli` [Docs](https://github.com/lingui/js-lingui/tree/master/packages/lingui-cli)

[![npm](https://img.shields.io/npm/v/lingui-cli.svg)](https://www.npmjs.com/package/lingui-cli) 

Command line interface for working with message catalogs.

### `lingui-i18n` [Docs](https://github.com/lingui/js-lingui/tree/master/packages/lingui-i18n)

[![npm](https://img.shields.io/npm/v/lingui-i18n.svg)](https://www.npmjs.com/package/lingui-i18n)

Functions for I18n in Javascript.

### `lingui-react` [Docs](https://github.com/lingui/js-lingui/tree/master/packages/lingui-react)

[![npm](https://img.shields.io/npm/v/lingui-react.svg)](https://www.npmjs.com/package/lingui-react)

Components for I18n in React.

### `babel-preset-lingui-js` [Docs](https://github.com/lingui/js-lingui/tree/master/packages/babel-preset-lingui-js)

[![npm](https://img.shields.io/npm/v/babel-preset-lingui-js.svg)](https://www.npmjs.com/package/babel-preset-lingui-js)

### `babel-preset-lingui-react` [Docs](https://github.com/lingui/js-lingui/tree/master/packages/babel-preset-lingui-react)

[![npm](https://img.shields.io/npm/v/babel-preset-lingui-react.svg)](https://www.npmjs.com/package/babel-preset-lingui-react)

### `babel-plugin-lingui-transform-js` [Docs](https://github.com/lingui/js-lingui/tree/master/packages/babel-plugin-lingui-transform-js)

[![npm](https://img.shields.io/npm/v/babel-plugin-lingui-transform-js.svg)](https://www.npmjs.com/package/babel-plugin-lingui-transform-js)

Transform function from `lingui-i18n` into ICU message format.

### `babel-plugin-lingui-transform-react` [Docs](https://github.com/lingui/js-lingui/tree/master/packages/babel-plugin-lingui-transform-react)

[![npm](https://img.shields.io/npm/v/babel-plugin-lingui-transform-react.svg)](https://www.npmjs.com/package/babel-plugin-lingui-transform-react)

Transform components from `lingui-react` into ICU message format.

### [`babel-plugin-lingui-extract-messages`](https://github.com/lingui/js-lingui/tree/master/packages/babel-plugin-lingui-extract-messages) [Docs](https://github.com/lingui/js-lingui/tree/master/packages/babel-plugin-lingui-extract-messages)

[![npm](https://img.shields.io/npm/v/babel-plugin-lingui-extract-messages.svg)](https://www.npmjs.com/package/babel-plugin-lingui-extract-messages)

Extract all messages for translation to external files.

## License

[MIT](./LICENSE.md)
