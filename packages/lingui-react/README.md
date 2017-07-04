[Tutorial](#quickstart) | [API reference](#api)

# lingui-react 

> React Components for I18n using ICU message format

`lingui-react` provides React components for writing texts using ICU message format

## Install

```sh
npm install lingui-react
# or
yarn add lingui-react
```

:warning: It's possible to use this library without `babel-preset-lingui-react`.
However, it's highly encouraged to use this preset. All examples below assume
that it's installed.

## Quickstart

> This is an introductory tutorial. For [API reference](#api), scroll below.

`lingui-react` provides several components which represent ICU MessageFormat in 
React. It's useful to understand this format, but certainly not required.

Please make sure that you have `babel-preset-lingui-react` installed and added
to your babel config.

:bulb:  All components are exported from the top of `lingui-react` package.

### 1. Setup I18nProvider

Translations are loaded from message catalogs for given language. The top 
component which adds messages and language to React component tree is 
[I18nProvider](#i18nprovider):

```jsx
import React from 'react'
import { render } from 'react-dom'
import { I18nProvider } from 'lingui-react'

import messages from './locales/en.json'
import App from './App'

render(
    <I18nProvider language="en" catalogs={{ en: { messages } }}>
       <App />
    </I18nProvider>,
    document.getElementById("app")
)
```

:hammer_and_wrench: Under the hood this component adds messages and language to 
context. All `lingui-react` components access messages from this context, so 
it's not necessary to pass them in props manually.

:bulb:  Active language can be managed for example in `redux` store. In that case,
add [I18nProvider](#i18nprovider) in main component (e.g. `App`) and read 
`language` from `redux` store. Loading of messages dynamically can be achieved
in several ways depending on bundler (e.g. webpack) and it's not covered in this
tutorial.

### 2. Wrap messages in i18n components

The simplest i18n component is [Trans](#trans). It's used for simple, singular 
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
[Trans](#trans) component:

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

**:warning: Only simple variables are supported inside [Trans](#trans) component.**
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

#### :hammer_and_wrench: How the extracted messages are going to look like

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

Anything wrapped inside [Trans](#trans) component is considered as
a **source message**.

Names of variables are preserved. This is the reason why only simple variables
are allowed - variable names are used as placeholders.

Inline components are replaced with dummy `<0>`, `<1>`, etc. tags. Using 
anonymous tags has several advantages:

- Both built-in (e.g: `span`) and custom (e.g: `Link`) components are supported
- Change of props doesn't require update of translations (e.g. when class name is changed)

### 3. Translations of attributes

Sometimes it's necessary to translate element attributes, like link `title` or
`aria-label`. [Trans](#trans) is a React component, but in this case we need
just a text.

It's possible to access low-level i18n API using [WithI18n](#withi18n)
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

### 4. Plurals, categories, and formats

ICU MessageFormat is very powerful and extensible format. It supports plurals,
categories and date/number formats.

#### Plurals

[Plural](#plural) component selects the appropriate plural form based on given
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

In English, [Plural](#plural) will render `1 message`, but `3 messages` depending on
`value`. It means that `one` prop expresses singular while `other` is for plural. 
Plural forms for other than source language are defined in message catalogs.
If we use English as a source language, we'll always use only `one` and `other`
props in [Plural](#plural). 

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

#### Select

Some languages have different forms based on gender or level of politeness.
Such cases are handled using [Select](#select) component, which works like
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

There's no magic here. [Select](#select) uses the form based on `value`.
`other` prop defines default form.

#### DateFormat and NumberFormat

Localization isn't just about text, but also about different number and date
formats. [NumberFormat](#numberformat) is used for formatting numbers 
(decimals, percents, currencies), while [DateFormat](#dateformat) is for
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

### 6. What's next

Once the app is *internationalized*, it's ready to be *localized*. Localization
process includes extracting messages into message catalog, translating message
catalogs and importing them in the application.

`lingui-cli` provides `extract` command, which creates new or updates existing
message catalogs.

Finally, after the message catalog is translated, it can be loaded back to the
application. [I18nProvider](#i18nprovider) expects a dictionary of messages, 
where the key is a message in source language and the value is a message in target langauge.

Other useful links:
- [lingui-i18n](https://github.com/lingui/js-lingui/tree/master/packages/lingui-i18n) docs
- [lingui-cli](https://github.com/lingui/js-lingui/tree/master/packages/lingui-cli) CLI utility

## API

Component  | Example MessageFormat
---        | ---
[Trans](#trans) | `My name is {name}` 
**Categories** |
[Plural](#plural)     | `{count, plural, one {# book} other {# books}}`
[Select](#select) | `{gender, select, male {His} female {Her} other {Their}}`
[SelectOrdinal](#selectordinal) | `{count, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}`
**Formats** |
[DateFormat](#dateformat) | `{value, date, short}`
[NumberFormat](#numberformat) | `{value, number, percent}`

- Providers and HOCs
  - [I18nProvider](#i18nprovider)
  - [WithI18n](#withi18n)
  
### General concepts
  
#### Rendering in components

All i18n components support two optional props:

Prop name | Type | Description
--- | --- | ---
`className` | string | Class name to be added to `<span>` element
`render` | React.Element | React.Class | Custom wrapper element to render translation

Setting `className` is enough in most cases. If we need to replace `<span>`
with a custom element, we can pass it to `render` prop.

When `render` is React.Element, it is cloned with `translation` as children:

```jsx
<Trans render={<h1 />}>Heading</Trans>
```

Using React.Component (or stateless component) in `render` prop is useful to
get more control over the rendering of translation. Component passed to `render`
receive translation/value in `translation` prop.

```jsx
<Trans render={({ translation }) => <Icon label={translation} />}>
    Sign in
</Trans>
```

#### Variables inside components

**:warning: Only simple variables are supported inside [Trans](#trans) component
and as a `value` prop in other i18n components.**
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
<DateFormat value={new Date()}
```

### Trans

This is the main component for translation. It supports variables and components
inside messages. It's also possible to override generated message ID using `id`
prop.

Prop name | Type | Description
--- | --- | ---
`id` | string | Override auto-generated message ID

#### Examples:

```jsx
// basic use case
<Trans>Hello World</Trans>
```

```jsx
// custom message ID
<Trans id="msg.hello">Hello World</Trans>
```

```jsx
// variable interpolation
const name = "Fred"
<Trans>My name is {name}</Trans>
```

```jsx
// inline components
<Trans>See the <Link to="/more">description</Link> below.</Trans>
```

### Plural

MessageFormat: `{arg, plural, ...forms}`

Prop name | Type | Description
--- | --- | ---
`value` | number | Override auto-generated message ID
`offset` | number | Offsets plural forms but doesn't affect exact matches
`zero`  | string | Form for empty `value`
`one`   | string | *Singular* form
`two`   | string | *Dual* form
`few`   | string | *Paucal* form
`many`  | string | *Plural* form
`other` | string | (required) general *plural* form
`_0`, `_1`, ... | string | Exact match form, correspond to `=N` rule

See [Language Plural Rules](http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html) 
overview.

Based on language, the `value` is mapped to specific plural form. If such plural
form isn't defined, the `other` form is used. `#` character inside message is used
as a placeholder for `value`:

```jsx
const count = 42
// renders as '42 books'
<Plural 
    value={count}
    one="# book"
    other="# books"
/>
```

It's also possible to use exact matches. This is common used in combination with
`offset` prop. `offset` doesn't affect `value` for exact matches, only plural forms:

```jsx
const count = 42
<Plural 
    value={count}
    offset={1}
    // when value = 0
    _0="Nobody arrived"
    
    // when value = 1
    _1="Only you arrived"
    
    // when value = 2
    // value - offset = 1 -> `one` plural form
    one="You and # other guest"
    
    // when value >= 3
    other="You and # other guests"
/>
```

### Select

MessageFormat: `{arg, select, ...forms}`

Prop name | Type | Description
--- | --- | ---
`value` | number | Override auto-generated message ID
`other` | number | (required) Default, catch-all form

This component selects appropriate form based on content of `value`. It
behaves like an `switch` statement. `other` prop is used when no prop matches
`value`:

```jsx
// gender = "female" -> `Her book`
// gender = "male" -> `His book`
// gender = "unspecified" -> `Their book`
<Select 
    value={gender}
    male="His book"
    female="Her book"
    other="Their books"
/>
```

### SelectOrdinal

MessageFormat: `{arg, selectordinal, ...forms}`

Prop name | Type | Description
--- | --- | ---
`value` | number | Override auto-generated message ID
`offset` | number | Offsets plural forms but doesn't affect exact matches
`zero`  | string | Form for empty `value`
`one`   | string | *Singular* form
`two`   | string | *Dual* form
`few`   | string | *Paucal* form
`many`  | string | *Plural* form
`other` | string | (required) general *plural* form
`_0`, `_1`, ... | string | Exact match form, correspond to `=N` rule

See [Language Plural Rules](http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html) 
overview.

This component is equivalent to [Plural](#plural). The only difference is that it
uses **ordinal** plural forms, instead of **cardinal** ones.

```jsx
<SelectOrdinal
    value={count}
    one="#st"
    two="#nd"
    few="#rd"
    other="#th"
/>
```

### DateFormat

MessageFormat: `{arg, date, format}`

Prop name | Type | Description
--- | --- | ---
`value` | number | Date to be formatted
`format`  | string or Object | Date format passed as options to [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat)

This component is a wrapper around [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat).

```jsx
const now = new Date()
// default language format
<DateFormat value={now} />
```

```jsx
const now = new Date()
// custom format
<DateFormat value={now} format={{
    year: "numberic",
    month: "long",
    day: "numeric"
}}/>
```

### NumberFormat

MessageFormat: `{arg, number, format}`

Prop name | Type | Description
--- | --- | ---
`value` | number | Number to be formatted
`format`  | string or Object | Number format passed as options to [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat)

This component is a wrapper around [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat).

```jsx
const num = 0.42
// default language format
<NumberFormat value={num} />
```

```jsx
const amount = 3.14
// custom format
<NumberFormat value={amount} format={{
    style: "currency",
    currency: 'EUR',
    minimumFractionDigits: 2
}}/>
```

## Providers

Message catalogs and active language are passed to the context in 
[I18nProvider](#i18nprovider). However, context should never be accessed 
directly. [WithI18n](#withi18n) hoc passes i18n prop to wrapped component
and shadows all implementation details:

### I18nProvider

Prop name | Type | Description
--- | --- | ---
`language` | string | Active language
`messages` | object | Message catalog

`messages` must be in format: `{ [language]: messageCatalog }`. This component
should live above all i18n components. The good place is top-level application
component. However, if the `language` is stored in the `redux` store, this 
component should be inserted below `react-redux/Provider`.

```jsx
import React from 'react'
import { Provider, connect } from 'react-redux'
import { I18nProvider } from 'lingui-react'

const App = connect(state => ({ language: state.language }))(
    ({ language} ) => {
        const messages = require(`locales/${language}.json`)
        return (
            <I18nProvider language={language} messages={{ [language]: messages }}>
               // the rest of app
            </I18nProvider>,
        )
    }
)
```

### WithI18n

`WithI18n([ options ])`

Options | Description
--- | ---
`withRef` | Returns reference to wrapped instance in `getWrappedInstance`

This HOC injects `i18n` prop to wrapped component. It's useful when wrapped
component needs to access `lingui-i18n` API for plain text translations.

```jsx
import React from 'react'
import { Trans, WithI18n } from 'lingui-react'

// WithI18n injects `i18n` prop 
const LogoutIcon = WithI18n()(
    ({ i18n }) => <Icon name="turn-off" aria-label={i18n.t`Log out`}/>
)
```

# License

MIT
