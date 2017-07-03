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