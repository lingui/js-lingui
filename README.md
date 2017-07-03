[![CircleCI](https://circleci.com/gh/lingui/js-lingui/tree/master.svg?style=svg)](https://circleci.com/gh/lingui/js-lingui/tree/master)

# Lingui - tools for ~~internationalization~~ i18n in javascript

Type-checked and intuitive way to internationalize applications in Javascript 
and ReactJS.

## Key features

- Small and fast - about 6kb gzipped (no hacks with `webpack.IgnorePlugin` required, no message parsing in production)
- Built on standard ICU MessageFormat (might replace react-intl completely)
  - Variable interpolation
  - Components inside translations (e.g: `Read <Link to="...">documentation</Link>.`)
  - Plurals, Ordinals and Categories (i.e. Select)
  - Number and Date formats (from Intl)
- Works with manual and generated message IDs
- Works in React and Vanilla JS (e.g: in redux-saga, CLI interface, etc.)
- CLI for extracting and compiling message catalogs
- Babel plugin for convenient, type-checked way of writing ICU MessageSyntax (recommended, but not required)

**TL;DR:** [Compare js-lingui with react-intl and react-i18next](https://github.com/lingui/js-lingui/wiki/Comparison-of-i18n-libraries)

## Overview

Internationalization consists of three steps:

1. [Specify parts for localization](#specify-parts-for-localization) - This is required even for monolingual apps, because it allows to use pluralization, polite forms, date/time formatting, etc.
2. [Build a message catalog](#build-message-catalog) - Message catalogs are passed to translators
3. [Load translated messages](#load-translated-messages) and switch application language

### Specify parts for localization

The first part of i18n process is wrapping all texts with component or function,
which replaces source text with translation during runtime. `js-lingui` uses 
[ICU Message Format](https://github.com/lingui/js-lingui/wiki/ICU-message-format) 
which allows using of variables, plural forms and date/number formats.

#### React

> :bulb: See [tutorial](https://github.com/lingui/js-lingui/tree/master/packages/lingui-react) about i18n in React

Install babel preset for using `js-lingui` in React apps and add it to your
babel config.

**Note**: Babel preset is optional. You can use this lib without it, but it
brings another level of conveniece.

```sh
yarn add --dev babel-preset-lingui-react
# or
npm install --save-dev babel-preset-lingui-react
```

[lingui-react](https://github.com/lingui/js-lingui/tree/master/packages/lingui-react) 
provides several component for React applications: `Trans` is the main component 
for general translation, `Plural` and `Select` for pluralization and custom 
forms (e.g: polite forms).

**Note:** If you prefer to set message ID manually, simply write it to `id` prop
of i18n components, e.g: `<Trans id="msg.hello>Hello World</Trans>`.

```jsx
import React from 'react'
import { Trans, Plural } from 'lingui-react'

const App = ({ name, count }) => (
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
```

As mentioned before, `lingui-react` works even without babel preset. All we need
is to write MessageFormat manually and pass it to `Trans` component directly
(in fact, that's what `babel-preset-lingui-rect` does). This is equivalent to
example above:

```jsx
import React from 'react'
import { Trans, Plural } from 'lingui-react'

const App = ({ name, count }) => (
  <div>
    // Static text
    <Trans id="January" />

    // Variables
    <Trans id="Hello, my name is {name}" values={{ name }} />

    // Components, now it get's a bit tricky
    <Trans id="See the <0>description</0> below." components={[<a href="/more" />]} />

    // Plurals
    <Trans 
      id="{count, plural, zero {<0>No books</0>} one {# book} other {# books}}" 
      values={{ name }}
      components={[<strong />]}
    />
  </div>
)
```

As you can see, `babel-preset-lingui-react` makes it really easy and error proof.
Source messages are type-checked and validated in preset.

Sometimes it's necessary to translate also a text attributes, which don't accept
React components. `lingui-react` has `WithI18n` decorator, which injects `i18n`
object from `lingui-i18n`. 

```jsx
import React from 'react'
import { WithI18n } from 'lingui-react'

// Translating text attributes
const LinkWithTooltip = WithI18n()(({ articleName, i18n }) => (
  <a 
    href="/more" 
    title={i18n.t`Link to ${articleName}`}
  >
    <Trans>Link</Trans>
  </a>
))
```

#### Javascript (wihout React)

Install babel preset for using `js-lingui` in Vanilla JS apps and add it 
to your babel config.

**Note**: Babel preset is optional. You can use this lib without it, but it
brings another level of conveniece.

```sh
yarn add --dev babel-preset-lingui-js
# or
npm install --save-dev babel-preset-lingui-js
```

Next, install `lingui-i18n` library. This is the core library which works in
any Javascript.

```sh
yarn add lingui-i18n
# or
npm install --save lingui-i18n
```

`lingui-js` provides `i18n.t` template tag for translation, `i18n.plural`, 
`i18n.select`, `i18n.selectOrdinal` methods for pluralization and custom forms:

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

As mentioned before, `lingui-i18n` works even without babel preset. All we need
is to write MessageFormat manually and pass it to low-level `i18n._` method
(in fact, that's what `babel-preset-lingui-js` does). This is equivalent to
example above:

```js
import i18n from 'lingui-i18n'

i18n._('January')

const name = "Fred"
i18n._('Hello, my name is {name}', { values: { name } })

i18n._('{count, plural, one {# Book} other {# Books}}', { values: { count } })
```

The main difference is: First example is type-checked and babel-preset provides
another validation, that ICU MessageFormat is correct.

### Build message catalog

At this point, application is available only in one language (English). When no 
translations are available the default texts are used.

Translators are working with message catalogs which are mapping of messages from
source to target language. The simplest form is a dictionary, where key is source
message and value is translated one:

```js
const fr = {
  "January": "Janvier",
  "Hello, my name is {name}": "Salut, je m'appelle {name}",
  "See the <0>description</0> below.": "...",
  "{count, plural, zero {<0>No books</0>} one {# book} other {# books}": "..."
}
```

The key is also called **message ID**. It must be unique across application. It 
should also include all parameters so translators can change the order of words 
and parameters if required.

`js-lingui` provides a CLI for building and compiling message catalogs:

```sh
npm install --save-dev lingui-cli
# or
yarn add --dev lingui-cli

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

The result is one message catalog per language (e.g: `locale/fr/messages.json`).

### Load translated messages

Translated message catalogs must be loaded back to application. The process 
depends on type of application. There's a how-to guide, how to do it in 
[webpack](https://github.com/lingui/js-lingui/wiki/HowTo:-Dynamic-loading-of-languages-with-Webpack).

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

 `lingui-react` provides `ProvideI18n` component which receives active language
 and messages for that language:

```jsx
import React from 'react'
import { ProvideI18n } from 'lingui-react'
import App from './App'
import messages from './locales/fr/messages.json'

// required in development only
import linguiDev from 'lingui-i18n/dev'

render(
    <ProvideI18n language="fr" messages={{ fr: messages }} development={linguiDev}>
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

See [wiki](https://github.com/lingui/js-lingui/wiki) for more info or 
[example-usecase](https://github.com/lingui/js-lingui/blob/master/packages/example-usecase/src/Usecases/Children.js) 
for detailed example.

## Packages

### `lingui-i18n` [Docs](https://github.com/lingui/js-lingui/tree/master/packages/lingui-i18n)

[![npm](https://img.shields.io/npm/v/lingui-i18n.svg)](https://www.npmjs.com/package/lingui-i18n)

Functions for I18n in Javascript.

### `lingui-react` [Docs](https://github.com/lingui/js-lingui/tree/master/packages/lingui-react)

[![npm](https://img.shields.io/npm/v/lingui-react.svg)](https://www.npmjs.com/package/lingui-react)

Components for I18n in React.

### `lingui-cli` [Docs](https://github.com/lingui/js-lingui/tree/master/packages/lingui-cli)

[![npm](https://img.shields.io/npm/v/lingui-cli.svg)](https://www.npmjs.com/package/lingui-cli) 

Command line interface for working with message catalogs.

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
