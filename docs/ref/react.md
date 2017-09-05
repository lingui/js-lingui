# Reference: React Components

- Providers
  - [I18nProvider](#i18nprovider)
  - [withI18n](#withi18n)
- Helpers
  - [i18nMark](#i18nMark)
  
|| Example MessageFormat
---        | --
[Trans](#trans) | `My name is {name}` 
**Categories** ||
[Plural](#plural) | `{count, plural, one {# book} other {# books}}`
[SelectOrdinal](#selectordinal) | `{count, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}`
[Select](#select) | `{gender, select, male {His} female {Her} other {Their}}`
**Formats** ||
[DateFormat](#dateformat) | `{value, date, short}`
[NumberFormat](#numberformat) | `{value, number, percent}`
  
## General concepts
  
### Rendering of translations

All i18n components render translation inside `<span>` tag. This tag can be
customized using in two ways: globally using `defaultRender` prop on [I18nProvider](#i18nprovider)
component or locally using `render` prop on i18n components. Each component
also support `className` as a shortcut for the most basic usecases.

#### Global configuration

Default rendering component can be set using `defaultRender` prop in [I18nProvider](#i18nprovider)
The main usecase is rendering translations in `Text` component in React Native.

It's possible to pass either string for built-in elements (`span`, `h1`),
React elements or React classes. This props has the type as `render` prop on
i18n components described below.

#### Local configuration

Prop name | Type | Description 
--- | --- | --- |
`className` | string | Class name to be added to `<span>` element
`render` | React.Element, React.Class string | Custom wrapper element to render translation

`className` is ignored, when `render` is set.

When `render` is **React.Element** or **string** (built-in tags), it is cloned with `translation` as children:

```jsx
// built-in tags
<Trans render="h1">Heading</Trans>
// renders as <h1>Heading</h1>

// custom elements
<Trans render={<Link to="/docs" />}>Link to docs</Trans>
// renders as <Link to="/docs">Link to docs</Link>
```

Using React.Component (or stateless component) in `render` prop is useful to get more control over the rendering of translation. Component passed to `render` receive translation/value in `translation` prop.

```jsx
// custom component
<Trans render={
  ({ translation }) => <Icon label={translation} />
}>
    Sign in
</Trans>

// renders as <Icon label="Sign in" />
```

## Components

### Trans

This is the main component for translation. It supports variables and components inside messages.

Message ID is either automatically generated in babel plugin or it's possible to manually override it in `id` prop.

Prop name | Type | Description
--- | --- | ---
`id` | string | Override auto-generated message ID

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

### Trans (without babel plugin)

It's also possible to use `Trans` component without babel plugin. In fact, it's the only i18n component you'll need if you decide to go without babel plugin.

**Note:** If you're using `babel-preset-lingui`, you don't need to use any of these props. It will be set automatically. 

Prop name | Type | Description
--- | --- | ---
`id` | string | Message ID
`defaults` | string | Default translation
`values` | Object | Variables for interpolation
`components` | Array | Components used in message
`formats` | Object | Custom formats used in message

#### Examples

```jsx
<Trans id="Hello World" />
```

```jsx
<Trans 
  id="Hello {name}" 
  values={{ name: 'Arthur' }}
/>
```

```jsx
// number of tag corresponds to index in `components` prop
<Trans 
  id="Read <0>Description</0> below." 
  components={[<Link to="/docs" />]} 
/>
```

```jsx
<Trans 
  id="Today is {today, date, short_date}"
  values={{ today: new Date() }}
  formats={{ 
    short_date: {
      year: "numberic",
      month: "long",
      day: "numeric"
    }
  }} 
/>
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

See [Language Plural Rules](http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html) overview.

Based on language, the `value` is mapped to specific plural form. If such plural form isn't defined, the `other` form is used. `#` character inside message is used as a placeholder for `value`:

```jsx
const count = 42
// renders as '42 books'
<Plural 
    value={count}
    one="# book"
    other="# books"
/>
```

It's also possible to use exact matches. This is common used in combination with `offset` prop. `offset` doesn't affect `value` for exact matches, only plural forms:

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

This component selects appropriate form based on content of `value`. It behaves like an `switch` statement. `other` prop is used when no prop matches `value`:

```jsx
// gender = "female"      -> `Her book`
// gender = "male"        -> `His book`
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

See [Language Plural Rules](http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html) overview.

This component is equivalent to [Plural](#plural). The only difference is that it uses **ordinal** plural forms, instead of **cardinal** ones.

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
directly. [withI18n](#withi18n) hoc passes i18n prop to wrapped component
and shadows all implementation details:

### I18nProvider

Prop name | Type | Description
--- | --- | ---
`language` | string | Active language
`catalogs` | object | Message catalogs
`defaultRender` | React.Element, React.Class string | Default element to render translation

`defaultRender` has the same meaning as `render` in other i18n props.
[Rendering](#localconfiguration) is explained at the beginning of this document.

`catalogs` is a type of `Catalogs`:

```js
// One catalog per language
type Catalogs = {
  [language: string]: Catalog
}

// Catalog contains messages and language data (i.e: plurals)
type Catalog = {
  messages: Messages,
  languageData?: {
    plurals: Function
  }
}

// Message is either function (compiled message) or string
type Messages = {
  [messageId: string]: string | Function
}
```

This component should live above all i18n components. The good place is top-level application component. However, if the `language` is stored in the `redux` store, this component should be inserted below `react-redux/Provider`.

```jsx
import React from 'react'
import { Provider, connect } from 'react-redux'
import { I18nProvider } from 'lingui-react'

const App = connect(state => ({ language: state.language }))(
    ({ language} ) => {
        const catalogs = require(`locales/${language}.js`)
        return (
            <I18nProvider language={language} catalogs={{ [language]: catalogs }}>
               // the rest of app
            </I18nProvider>,
        )
    }
)
```

### withI18n

`withI18n([ options ])`

Options | Description
--- | ---
`withRef` | Returns reference to wrapped instance in `getWrappedInstance`

This HOC injects `i18n` prop to wrapped component. It's useful when wrapped component needs to access `lingui-i18n` API for plain text translations.

```jsx
import React from 'react'
import { Trans, withI18n } from 'lingui-react'

// withI18n injects `i18n` prop 
const LogoutIcon = withI18n()(
    ({ i18n }) => <Icon name="turn-off" aria-label={i18n.t`Log out`}/>
)
```

*Changed in lingui-react@1.1.0:*

Previous version of this component, named `WithI18n` (upper-cased first letter),
is deprecated and will be removed in lingui-react@2.x

### i18nMark

`i18nMark(source: string)`

Mark text for translation, but don't translate it immediatelly. In development, the `i18nMark` function is identity, returning the source string. Such string is extracted to message catalog, so it can be referred in `<Trans>` dynamically:

```jsx
const message = i18nMark('Source string')

<Trans id={message} />
// is the same as
<Trans id="Source string" />
```

This is useful for defining translations outside components:

```jsx
const languages = {
  en: i18nMark('English'),
  fr: i18nMark('French')
}

Object.keys(languages).map(language =>
  <Trans key={language} id={languages[language]} />
)
```
