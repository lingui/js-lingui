`lingui-react` provides components which represent ICU MessageFormat in React. It's useful to understand this format, but certainly not required.

:bulb:  All components are exported from the top of `lingui-react` package.

# Install dependencies and configure Babel

1. Install `babel-preset-lingui-react` and `lingui-cli` as development dependencies:

  {% sample lang="js" -%}
  ```bash
  yarn add --dev babel-preset-lingui-react lingui-cli
  # npm install --save-dev babel-preset-lingui-react lingui-cli  
  ```  

2. Install `lingui-react` as runtime dependency:

  {% sample lang="js" -%}
  ```bash
  yarn add --dev lingui-react
  # npm install --save-dev lingui-react
  ```

3. Add `lingui-react` preset to babel config:

  {% sample lang="js" -%}
  ```js
  // .babelrc
  {
    "presets": [
      "env",
      "react",
      "lingui-react"
    ]
  }
  ```

# Setup I18nProvider

Translations are loaded from message catalogs. The topmost 
component which adds messages and language to React component tree is 
[I18nProvider](https://github.com/lingui/js-lingui/wiki/Ref:-React#i18nprovider):

```jsx
import React from 'react'
import { render } from 'react-dom'
import { I18nProvider } from 'lingui-react'

// This is for development only. It contains message parser for
// compiling messages on the fly and language data for all languages
import linguiDev from 'lingui-i18n/dev'

import messages from './locales/en.json'
import App from './App'

render(
    <I18nProvider 
      language="en" 
      messages={{ en: messages }}
      development={linguiDev}>
       <App />
    </I18nProvider>,
    document.getElementById("app")
)
```

:hammer_and_wrench: Under the hood this component adds messages and language to 
context. All `lingui-react` components access messages from this context, so 
it's not necessary to pass them in props manually.

:bulb:  Active language can be managed for example in `redux` store. In that case,
add [I18nProvider](https://github.com/lingui/js-lingui/wiki/Ref:-React#i18nprovider) 
in main component (e.g. `App`) and read `language` from `redux` store. Loading 
of messages dynamically can be achieved in several ways depending on bundler 
(e.g. webpack) and it's not covered in this tutorial. See the
[HowTo: Dynamic loading of languages in Webpack](https://github.com/lingui/js-lingui/wiki/HowTo:-Dynamic-loading-of-languages-with-Webpack)

# Wrap messages in i18n components

The simplest i18n component is [Trans](https://github.com/lingui/js-lingui/wiki/Ref:-React#trans). 
It's used for simple, singular 
translations. It supports both variables and inline components.

Suppose we have a `Header` component, which displays the name of currently
logged in user:

```jsx
import React from 'react'

const Header = ({ username }) => (
  <div>
    <h1>Documentation</h1>
    
    <div className="UserProfile">
        Welcome, <Link to="/profile">{username}</Link>
    </div>
  </div>
)
```

If we want to translate this component, just wrap all messages in
[Trans](https://github.com/lingui/js-lingui/wiki/Ref:-React#trans) component:

```jsx
import React from 'react'
import { Trans } from 'lingui-react'

const Header = ({ username }) => (
  <div>
    <h1><Trans>Documentation</Trans></h1>
    
    <div className="UserProfile">
        <Trans>Welcome, <Link to="/profile">{username}</Link></Trans>
    </div>
  </div>
)
```

This process is completely seamless and doesn't require any other changes
to `Header` component.

**:warning: Only simple variables are supported inside [Trans](https://github.com/lingui/js-lingui/wiki/Ref:-React#trans) component.**
It's not possible to use constants, function calls or object properties.
Any of following examples won't work:

```js
const messages = [
  "Hello",
  "World"
]

<Trans>{messages.length}</Trans>
<Trans>{isEmpty(messages)}</Trans>
<Trans>The answer is {42}</Trans>
```

## :hammer_and_wrench: How the extracted messages are going to look like

Extraction of messages into external message catalogs isn't covered in this
tutorial because it's a responsibility of `lingui-cli` package. However, now it's
probably the best and only time to mention, how extracted messages are going
to look like.

Given the example above, we'll get two messages:

```js
// example of empty message catalog
export default {
  "Documentation": "",
  "Welcome, <0>{username}</0>": ""
}
```

Anything wrapped inside [Trans](https://github.com/lingui/js-lingui/wiki/Ref:-React#trans) component is considered as
a **source message**.

Names of variables are preserved. This is the reason why only simple variables
are allowed - variable names are used as placeholders.

Inline components are replaced with dummy `<0>`, `<1>`, etc. tags. Using 
anonymous tags has several advantages:

- Both built-in (e.g: `span`) and custom (e.g: `Link`) components are supported
- Change of props doesn't require update of translations (e.g. when class name is changed)

# Translations of attributes

Sometimes it's necessary to translate element attributes, like link `title` or
`aria-label`. [Trans](https://github.com/lingui/js-lingui/wiki/Ref:-React#trans) is a React component, but in this case we need
just a text.

It's possible to access low-level i18n API using [WithI18n](https://github.com/lingui/js-lingui/wiki/Ref:-React#withi18n)
high-order component. 
All we need to do is wrap our component and then
we can use `lingui-i18n` API from `i18n` prop:

```jsx
import React from 'react'
import { Trans, WithI18n } from 'lingui-react'

// WithI18n injects `i18n` prop 
const LogoutIcon = WithI18n()(
    ({ i18n }) => <Icon name="turn-off" aria-label={i18n.t`Log out`}/>
)
```

**:warning: Watch the empty braces after `WithI18n`. `WithI18n` expects options
as a first argument and return configured HOC.**

`i18n.t` returns plain text. It's the same API which can be used outside React
context and it's described in `lingui-i18n`

# Plurals, categories, and formats

ICU MessageFormat is very powerful and extensible format. It supports plurals,
categories and date/number formats.

## Plurals

[Plural](https://github.com/lingui/js-lingui/wiki/Ref:-React#plural) component selects the appropriate plural form based on given
`value`. For example in English, there are only two plural forms: singular and
plural. If we want to translate message with plural support, we need to define
both:

```jsx
import React from 'react'
import { Trans } from 'lingui-react'

const Notifications = ({ newMessageCount }) => {
  return (
    <div>
      <Plural 
         value={newMessageCount}
         one="# message"
         other="# messages"
      />
    </div>
  )
}
```

In English, [Plural](https://github.com/lingui/js-lingui/wiki/Ref:-React#plural) will render `1 message`, but `3 messages` depending on
`value`. It means that `one` prop expresses singular while `other` is for plural. 
Plural forms for other than source language are defined in message catalogs.
If we use English as a source language, we'll always use only `one` and `other`
props in [Plural](https://github.com/lingui/js-lingui/wiki/Ref:-React#plural). 

Just to clarify, the message above is extracted as:

`{newMessageCount, plural, one {# message} other {# messages}}`

In Czech, it would be translated as:

`{newMessageCount, plural, one {# zpráva} few {# zprávy} other {# zpráv}}`

This is different compared to `gettext`, which maps singular/plural to
language specific plural forms. In ICU message format, we always have only
one message with all plural forms per language.

:hammer_and_wrench: All possible plural forms are `zero`, `one`, `two`, `few`, 
`many`, `other`.

:bulb: Plural forms for all languages are listed at CLDR page - 
[Language Plural Rules](http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html).

## Select

Some languages have different forms based on gender or level of politeness.
Such cases are handled using [Select](https://github.com/lingui/js-lingui/wiki/Ref:-React#select) component, which works like
a `switch` statement:

```jsx
import React from 'react'
import { Trans } from 'lingui-react'

const Book = ({ gender }) => {
  return (
    <div>
      <Select 
         value={gender}
         male="His book"
         female="Her book"
         other="Their book"
      />
    </div>
  )
}
```

There's no magic here. [Select](https://github.com/lingui/js-lingui/wiki/Ref:-React#select) uses the form based on `value`.
`other` prop defines default form.

## DateFormat and NumberFormat

Localization isn't just about text, but also about different number and date
formats. [NumberFormat](https://github.com/lingui/js-lingui/wiki/Ref:-React#numberformat) is used for formatting numbers 
(decimals, percents, currencies), while [DateFormat](https://github.com/lingui/js-lingui/wiki/Ref:-React#dateformat) is for
dates:

```jsx
import React from 'react'
import { DateFormat, NumberFormat } from 'lingui-react'

const Invoice = ({ invoiceNumber, datePaid, amount }) => {
  return (
    <div>
      <h1><Trans>Invoice {invoiceNumber}</Trans></h1>

      <Trans>
        Amount <NumberFormat 
          value={amount} 
          format={{ style: 'currency', currency: 'EUR' }} 
        /> paid on <DateFormat value={datePaid} />
      </Trans>
    </div>
  )
}
```

# What's next

Once the app is *internationalized*, it's ready to be *localized*. Localization
process includes extracting messages into message catalog, translating message
catalogs and importing them in the application.

`lingui-cli` provides `extract` command, which creates new or updates existing
message catalogs.

Finally, after the message catalog is translated, it can be loaded back to the
application. [I18nProvider](https://github.com/lingui/js-lingui/wiki/Ref:-React#i18nprovider) expects a dictionary of messages, 
where the key is a message in source language and the value is a message in target language.

Follow up links:

- [Reference: React API](https://github.com/lingui/js-lingui/wiki/Ref:-React)
- [How-to guide: Dynamic loading of languages with Webpack](https://github.com/lingui/js-lingui/wiki/HowTo:-Dynamic-loading-of-languages-with-Webpack) 
