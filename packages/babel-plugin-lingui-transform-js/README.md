# react-plugin-lingui-transform-js

> This plugin transforms messages written using `lingui-i18n` methods to static ICU message format.

The transformation speeds up translation at runtime while using helper methods allows to type-check messages.

## Installation

```sh
npm install --save-dev babel-plugin-lingui-transform-js
# or
yarn add --dev babel-plugin-lingui-transform-js
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["lingui-transform-js"]
}
```

### Via CLI

```sh
babel --plugins lingui-transform-js script.js
```

### Via Node API

```js
require("babel-core").transform("code", {
  plugins: ["lingui-transform-js"]
})
```

## Details

Plugin performs following transformations:

### Static message

```js
i18n.t`Hello World`

// becomes
i18n.t({ id: "Hello World" })
```

### Message with variables

```js
i18n.t`Hi, my name is ${name}`

// becomes 
i18n.t({ id: "Hi, my name is {name}", params: { name }})
```

### Plurals, select, ordinal and other formats

Format is basically a function which receives a `value` and format options. It's transformed to `{variable, format, options}` form. The most common formats are `plural`, `select` and `ordinal`:

```js
i18n.plural({
  value: count,
  one: "# Book",
  other: "# Books"
})

// becomes
i18n.t({ 
  id: "{count, plural, one {# Book} other {# Books}}", 
  params: { count }
})
```

Number/date formats:

```js
i18n.t`The answer is ${i18n.number(answer)}`

// becomes
i18n.t({ 
  id: "The answer is {answer, number}", 
  params: { answer }
})
```

Custom formats:

```js
const currency = {
  style: 'currency',
  currency: 'EUR'
}

i18n.t`The price is ${i18n.number(amount, currency)}`

// becomes
i18n.t({ 
  id: "The price is {amount, number, currency}", 
  params: { answer },
  formats: { currency }
})
```

### Combination of any above

```js
i18n.select({
  value: gender,
  male: i18n.plural({
    value: numOfGuests,
    offset: 1,
    0: `${host} doesn't invite any guests`,
    1: `${host} invite ${guest} to his party`,
    other: `${host} invite ${guest} and # other to his party`
  }),
  female: i18n.plural({ ... })
})

// becomes
i18n.t({ 
  id: "{gender, select, male {{numOfGuests, plural, offset:1 =0 {...}}} female {...}}", 
  params: { gender, numOfGuests, host, guest }
})
```
