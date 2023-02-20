# Macros

The `@lingui/macro` package transforms JavaScript objects and JSX elements into ICU MessageFormat messages. You can use [Babel macros](#babel) or [SWC plugin](#swc) for this transformation.

## Installation

Installing `@lingui/macro` can be done in two ways, depending on whether you use Babel or SWC as your compiler.

### Babel

Babel macros require [babel-plugin-macros](https://github.com/kentcdodds/babel-plugin-macros) to work. If you use a framework (for example GatsbyJS, Create React App > 2.0) you might already have macros enabled. Otherwise, install it as any other Babel plugin:

1. Install `babel-plugin-macros` as a dev dependency and `@lingui/macro` as dependency:

  ```bash npm2yarn
  npm install --save-dev babel-plugin-macros
  npm install --save @lingui/macro
  ```

2. Add `macros` to the top of plugins section in your Babel config:

  ```json
  {
     "plugins": [
        "macros"
     ]
  }
  ```

### SWC

For those who prefer not to use Babel, Lingui offers the [SWC Plugin](/docs/ref/swc-plugin.md) as an alternative.

1. Install `@lingui/swc-plugin` as a dev dependency and `@lingui/macro` as dependency:

  ```bash npm2yarn
  npm install --save-dev @lingui/swc-plugin
  npm install --save @lingui/macro
  ```

2. [Add necessary configurations](/docs/ref/swc-plugin.md#usage).

:::note
It's recommended to install `@lingui/macro` package as a production dependency rather than development one to avoid `import/no-extraneous-dependencies`  errors in ESLint.
:::

## Overview

The advantages of using macros are:

- You don't need to learn ICU MessageFormat syntax. You always use familiar JS and JSX code.
- Components and functions are type checked.
- Additional validation of plural rules is performed during transformation.
- Non-essential data are removed from the production build (e.g. comments and default messages) to shave a few bytes.

**JSX macros** are transformed to [`Trans`](/docs/ref/react.md#trans) component from [`@lingui/react`](/docs/ref/react.md):

``` jsx
import { Trans } from "@lingui/macro"
<Trans>Attachment {name} saved</Trans>

// ↓ ↓ ↓ ↓ ↓ ↓

import { Trans } from "@lingui/react"
<Trans id="Attachment {name} saved" values={{ name }} />
```

**JS macros** (i.e. macros that looks like a simple JavaScript functions) are transformed into [`i18n._`](/docs/ref/core.md#i18n._) call.

``` jsx
import { t } from "@lingui/macro"
t`Attachment ${name} saved`

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core"
/*i18n*/
i18n._("Attachment {name} saved", { name })
```

:::note
By default, the `i18n` object is imported from `@lingui/core`. If you use a custom instance of `i18n` object, you need to set [`runtimeConfigModule`](/docs/ref/conf.md#runtimeconfigmodule) or pass a custom instance to [`t`](/docs/ref/macro.md#t).
:::

The only exception is [`defineMessage`](/docs/ref/macro.md#definemessage) which is transformed into message descriptor. In other words, the message isn't translated directly and can be used anytime later:

``` jsx
import { i18n } from "@lingui/core"
import { defineMessage } from "@lingui/macro"

// define message
const message = defineMessage({ message: `Attachment ${name} saved` })

// translate it
i18n._(message)

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core"

// define message
const message = /*i18n*/{ id: "Attachment {name} saved", values: { name }})

// translate it
i18n._(message)
```

### Examples of JS macros

``` js
t`Refresh inbox`

// ↓ ↓ ↓ ↓ ↓ ↓

/*i18n*/
i18n._("Refresh inbox")
```
``` js
t`Attachment ${name} saved`

// ↓ ↓ ↓ ↓ ↓ ↓

/*i18n*/
i18n._("Attachment {name} saved", { name })
```
``` js
t(customI18n)`Refresh inbox`

// ↓ ↓ ↓ ↓ ↓ ↓

/*i18n*/
customI18n._("Refresh inbox")
```
``` js
t(customI18n)`Attachment ${name} saved`

// ↓ ↓ ↓ ↓ ↓ ↓

/*i18n*/
customI18n._("Attachment {name} saved", { name })
```
``` js
plural(count, {
  one: "Message",
  other: "Messages"
})

// ↓ ↓ ↓ ↓ ↓ ↓

/*i18n*/
i18n._("{count, plural, one {Message} other {Messages}}", {
  count
})
```
``` js
t({
  id: "msg.refresh",
  message: "Refresh inbox"
})

// ↓ ↓ ↓ ↓ ↓ ↓

i18n._(/*i18n*/{
  id: "msg.refresh",
  message: "Refresh inbox"
})
```
``` js
t(customI18n)({
  id: "msg.refresh",
  message: "Refresh inbox"
})

// ↓ ↓ ↓ ↓ ↓ ↓

customI18n._(/*i18n*/{
  id: "msg.refresh",
  message: "Refresh inbox"
})
```
``` js
defineMessage({
  id: "msg.refresh",
  message: "Refresh inbox"
})

// ↓ ↓ ↓ ↓ ↓ ↓

/*i18n*/{
  id: "msg.refresh",
  message: "Refresh inbox"
}
```

### Examples of JSX macros

``` js
<Trans>Attachment {name} saved</Trans>

// ↓ ↓ ↓ ↓ ↓ ↓

<Trans
   id="Attachment {name} saved"
   values={{ name }}
/>
```
``` js
<Plural
   value={count}
   one="Message"
   other="Messages"
/>

// ↓ ↓ ↓ ↓ ↓ ↓

<Trans
   id="{count, plural, one { Message} other {Messages}}"
   values={{ count }}
/>
```
``` js
<Trans id="msg.refresh">
   Refresh inbox
</Trans>

// ↓ ↓ ↓ ↓ ↓ ↓

<Trans
   id="msg.refresh"
   message="Refresh inbox"
/>
```

## JS macros

These macros can be used in any context (e.g. outside JSX). All JS macros are transformed into a *Message Descriptor* wrapped inside of [`i18n._`](/docs/ref/core.md#i18n._) call.

:::note
By default, the `i18n` object is imported from `@lingui/core`. If you use a custom instance of `i18n` object, you need to set [`runtimeConfigModule`](/docs/ref/conf.md#runtimeconfigmodule) or pass a custom instance to [`t`](/docs/ref/macro.md#t).
:::

*Message Descriptor* is an object with message ID, default message and other parameters. [`i18n._`](/docs/ref/core.md#i18n._) accepts message descriptors and performs translation and formatting:

``` jsx
type MessageDescriptor = {
   id: String,
   message?: String,
   values?: Object,
   formats?: Object,
   comment?: string
}
```

`id` is message ID and the only required parameter. `id` and `message` are extracted to message catalog. Only `id`, `values`, and `formats` are used at runtime, all other attributes are removed from production code for size optimization.

:::info Note
i18n comment

In the examples below you might notice `/*i18n*/` comment in macro output. This comment tells the extract plugin that following object or string should be collected to message catalog.
:::

### `t`

The most common macro for messages. It transforms tagged template literal into message in ICU MessageFormat:

``` jsx
import { t } from "@lingui/macro"
const message = t`Hello World`

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core"
const message =
/*i18n*/
i18n._("Hello World")
```

Message variables are supported:

``` jsx
import { t } from "@lingui/macro"
const message = t`My name is ${name}`

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core"
const message =
/*i18n*/
i18n._("My name is {name}", {
  name
})
```

In fact, any expression can be used inside template literal. However, only simple variables are referenced by name in a transformed message. All other expressions are referenced by numeric index:

``` jsx
import { t } from "@lingui/macro"
const message = t`Today is ${new Date()}`

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core";

const message =
/*i18n*/
i18n._("Today is {0}", {
  0: new Date()
});
```

Optionally, a custom `i18n` instance can be passed that can be used instead of the global instance:

``` jsx
import { t } from "@lingui/macro"
import { i18n } from "./lingui"
const message = t(i18n)`Hello World`

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "./lingui"
const message =
/*i18n*/
i18n._("Hello World")
```

It's also possible to pass custom `id` and `comment` for translators by calling `t` macro with a message descriptor:

``` jsx
import { t } from "@lingui/macro"
const message = t({
   id: 'msg.hello',
   comment: 'Greetings at the homepage',
   message: `Hello ${name}`
})

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core"
const message = i18n._(/*i18n*/{
   id: 'msg.hello',
   comment: 'Greetings at the homepage',
   message: 'Hello {name}',
   values: { name }
})
```

In this case the `message` is used as a default message and it's transformed as if it were wrapped in `t` macro. `message` also accepts any other macros:

``` jsx
import { t } from "@lingui/macro"
const message = t({
   id: 'msg.plural',
   message: plural(value, { one: "...", other: "..." })
})

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core"
const message = i18n._(/*i18n*/{
   id: 'msg.plural',
   message: '{value, plural, one {...} other {...}}',
   values: { value }
})
```

### `plural`

``` jsx
plural(value: string | number, options: Object)
```

`plural` macro is used for pluralization, e.g: messages which has different form based on counter. The first argument `value` determines the plural form. The second argument is an object with available plural forms. Plural form used in the source code depends on your source locale (e.g. English has only `one` and `other`).

``` jsx
import { plural } from "@lingui/macro"
const message = plural(count, {
   one: "# Book",
   other: "# Books"
})

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core"
const message =
/*i18n*/
i18n._('{count, plural, one {# Book} other {# Books}}', {
  count
})
```

If you need to add variables to plural form, you can use template string literals. This time [`t`](/docs/ref/macro.md#t) macro isn't required as template strings are transformed automatically:

``` jsx
import { plural } from "@lingui/macro"
const message = plural(count, {
   one: `${name} has # friend`,
   other: `${name} has # friends`
})

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core"
const message =
/*i18n*/
i18n._('{count, plural, one {{name} has # friend} other {{name} has # friends}}', {
  count, name
})
```

Plurals can also be nested to form complex messages. Here's an example using two counters:

``` jsx
import { plural } from "@lingui/macro"
const message = plural(numBooks, {
   one: plural(numArticles, {
      one: `1 book and 1 article`,
      other: `1 book and ${numArticles} articles`,
   }),
   other: plural(numArticles, {
      one: `${numBooks} books and 1 article`,
      other: `${numBooks} books and ${numArticles} articles`,
   }),
})

// ↓ ↓ ↓ ↓ ↓ ↓
// Generated message was wrapped for better readability

import { i18n } from "@lingui/core"
const message =
/*i18n*/
i18n._(`{numBooks, plural,
         one {{numArticles, plural,
            one {1 book and 1 article}
            other {1 book and {numArticles} articles}
         }}
         other {{numArticles, plural,
            one {{numBooks} books and 1 article}
            other {{numBooks} books and {numArticles} articles}
         }}
      }`,
  { numBooks, numArticles }
)
```

:::tip
This is just an example how macros can be combined to create a complex messages. However, simple is better because in the end it's the translator who's gonna have to translate these long and complex strings.
:::

:::caution
Use `plural` inside [`t`](#t) macro if you want to add custom `id` or `comment` for translators.
:::

### `selectOrdinal`

``` jsx
selectOrdinal(value: string | number, options: Object)
```

`selectOrdinal` macro is similar to [`plural`](#plural) but instead of using cardinal plural forms it uses ordinal forms:

``` jsx
import { selectOrdinal } from "@lingui/macro"
const message = selectOrdinal(count, {
   one: "#st",
   two: "#nd",
   few: "#rd",
   other: "#th",
})

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core"
const message =
/*i18n*/
i18n._('{count, selectOrdinal, one {#st} two {#nd} few {#rd} other {#th}}', {
  count
})
```

:::caution
Use `selectOrdinal` inside [`t`](#t) macro if you want to add custom `id` or `comment` for translators.
:::

### `select`

``` jsx
select(value: string | number, options: Object)
```

`select` macro works as a switch statement — it select one of the forms provided in `options` object which key matches exactly `value`:

``` jsx
import { select } from "@lingui/macro"
const message = select(gender, {
   male: "he",
   female: "she",
   other: "they"
})

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core"
const message =
/*i18n*/
i18n._('{gender, select, male {he} female {she} other {they}}', {
  gender
})
```

:::caution
Use `select` inside [`t`](#t) macro if you want to add custom `id` or `comment` for translators.
:::

### `defineMessage`

`defineMessage` macro is a wrapper around macros above which allows you to add comments for translators or override the message ID.

Unlike the other JS macros, it doesn't wrap generated *MessageDescription* into [`i18n._`](/docs/ref/core.md#i18n._) call.

``` ts
type MessageDescriptor = {
  id?: string,
  message?: string,
  comment?: string
}

defineMessage(message: MessageDescriptor)
```

Either `id` or `message` property is required. `id` is a custom message id. If it isn't set, the `message` is used instead.

``` jsx
import { defineMessage } from "@lingui/macro"
const message = defineMessage({
   id: "Navigation / About",
   message: "About us"
})

// ↓ ↓ ↓ ↓ ↓ ↓

const message = /*i18n*/{
  id: 'Navigation / About',
  message: "About us"
}
```

`message` is the default message. Any JS macro can be used here. Template string literals don't need to be tagged with [`t`](#t).

``` jsx
import { defineMessage, t } from "@lingui/macro"

const name = "Joe"

const message = defineMessage({
   comment: "Greetings on the welcome page",
   message: `Welcome, ${name}!`
})

// ↓ ↓ ↓ ↓ ↓ ↓

const message = /*i18n*/{
   comment: "Greetings on the welcome page",
   message: "Welcome, {name}",
   values: {
     name
   }
}
```

`comment` is a comment for translators. It's extracted to the message catalog and it gives extra context for translators. It's removed from production code:

``` jsx
import { defineMessage } from "@lingui/macro"
const message = defineMessage({
   comment: "Link in navigation pointing to About page",
   message: "About us"
})

// ↓ ↓ ↓ ↓ ↓ ↓

const message = /*i18n*/{
  comment: "Link in navigation pointing to About page",
  id: "About us"
}
```

:::caution Note
In production build, the macro is stripped of `message` and `comment` properties:

``` jsx
import { defineMessage } from "@lingui/macro"
const message = defineMessage({
   id: "msg.navigation.about",
   comment: "Link in navigation pointing to About page",
   message: "About us",
   context: "Context about the link"
})

// process.env.NODE_ENV === "production"
// ↓ ↓ ↓ ↓ ↓ ↓

const message = /*i18n*/{
  context: "Context about the link",
  id: "msg.navigation.about"
}
```

`message` and `comment` are used in message catalogs only.
:::

## JSX Macros

### Common props

All macros share following props:

#### `id`

Each message in catalog is identified by **message ID**.

While all macros use generated message as the ID, it's possible to override it. In such case, generated message is used as a default translation.

``` jsx
import { Trans } from "@lingui/macro"
<Trans id="message.attachment_saved">Attachment {name} saved.</Trans>

// ↓ ↓ ↓ ↓ ↓ ↓
import { Trans } from "@lingui/react"
<Trans id="message.attachment_saved" message="Attachment {name} saved." />
```

#### `comment`

Comment for translators to give them additional context about the message. It's removed from production code.

#### `render`

Render prop function used to render translation. This prop is directly passed to [`Trans`](/docs/ref/react.md#trans) component from [`@lingui/react`](/docs/ref/react.md). See [rendering of translations](/docs/ref/react.md#rendering-translations) for more info.

### `Trans`

| Prop name | Type   | Description             |
| --------- | ------ | ----------------------- |
| `id`      | string | Custom message ID       |
| `comment` | string | Comment for translators |

[`Trans`](/docs/ref/react.md#trans) is the basic macro for static messages, messages with variables, but also for messages with inline markup:

``` jsx
import { Trans } from "@lingui/macro"
<Trans>Refresh inbox</Trans>;

// ↓ ↓ ↓ ↓ ↓ ↓
import { Trans } from "@lingui/react"
<Trans id="Refresh inbox" />
```

Custom `id` is preserved:

``` jsx
import { Trans } from "@lingui/macro"
<Trans id="message.attachment_saved">Attachment {name} saved.</Trans>

// ↓ ↓ ↓ ↓ ↓ ↓

import { Trans } from "@lingui/react"
<Trans id="message.attachment_saved" message="Attachment {name} saved." />
```

This macro is especially useful when message contains inline markup.

``` jsx
import { Trans } from "@lingui/macro"

<Trans>Read the <a href="/docs">docs</a>.</Trans>;

// ↓ ↓ ↓ ↓ ↓ ↓

import { Trans } from "@lingui/macro"
<Trans id="Read the <0>docs</0>." components={{0: <a href="/docs" />}} />
```

Components and HTML tags are replaced with dummy indexed tags (`<0></0>`) which has several advantages:

-   both custom React components and built-in HTML tags are supported
-   change of component props doesn't break the translation
-   the message is extracted as a whole sentence (this seems to be obvious, but most i18n libs simply split message into pieces by tags and translate them separately)

### `Plural`

| Prop name   | Type           | Description                                                                                                                                           |
| ----------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`     | number         | (required) Value is mapped to plural form below                                                                                                       |
| `format`    | string\|Object | Number format passed as options to [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat) |
| `offset`    | number         | Offset of value when calculating plural forms                                                                                                         |
| `zero`      | string         | Form for empty `value`                                                                                                                                |
| `one`       | string         | *Singular* form                                                                                                                                       |
| `two`       | string         | *Dual* form                                                                                                                                           |
| `few`       | string         | *Paucal* form                                                                                                                                         |
| `many`      | string         | *Plural* form                                                                                                                                         |
| `other`     | string         | (required) general *plural* form                                                                                                                      |
| `_<number>` | string         | Exact match form, corresponds to `=N` rule                                                                                                            |

 > MessageFormat: `{arg, plural, ...forms}`

Props of [`Plural`](/docs/ref/macro.md#plural-1) macro are transformed into [`plural`](/docs/ref/message-format.md) format.

``` jsx
import { Plural } from "@lingui/macro"
<Plural value={numBooks} one="Book" other="Books" />

// ↓ ↓ ↓ ↓ ↓ ↓
import { Trans } from "@lingui/react"
<Trans id="{numBooks, plural, one {Book} other {Books}}" values={{ numBooks }} />
```

`#` are formatted using `number` format. `format` prop is passed to this formatter.

Exact matches in MessageFormat syntax are expressed as `=int` (e.g. `=0`), but in React this isn't a valid prop name. Therefore, exact matches are expressed as `_int` prop (e.g. `_0`). This is commonly used in combination with `offset` prop. `offset` affects only plural forms, not exact matches.

``` jsx
import { Plural } from "@lingui/macro"

<Plural
    value={count}
    offset={1}

    // when value == 0
    _0="Nobody arrived"

    // when value == 1
    _1="Only you arrived"

    // when value == 2
    // value - offset = 1 -> `one` plural form
    one="You and # other guest arrived"

    // when value >= 3
    other="You and # other guests arrived"
/>

/*
  This is transformed to Trans component with ID:
  {count, plural, offset:1 _0    {Nobody arrived}
                           _1    {Only you arrived}
                           one   {You and # other guest arrived}
                           other {You and # other guests arrived}}
*/
```

### `SelectOrdinal`

| Prop name   | Type           | Description                                                                                                                                           |
| ----------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`     | number         | (required) Value is mapped to plural form below                                                                                                       |
| `offset`    | number         | Offset of value for plural forms                                                                                                                      |
| `zero`      | string         | Form for empty `value`                                                                                                                                |
| `one`       | string         | *Singular* form                                                                                                                                       |
| `two`       | string         | *Dual* form                                                                                                                                           |
| `few`       | string         | *Paucal* form                                                                                                                                         |
| `many`      | string         | *Plural* form                                                                                                                                         |
| `other`     | string         | (required) general *plural* form                                                                                                                      |
| `_<number>` | string         | Exact match form, correspond to `=N` rule. (e.g: `_0`, `_1`)                                                                                          |
| `format`    | string\|Object | Number format passed as options to [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat) |

 > MessageFormat: `{arg, selectordinal, ...forms}`

Props of `SelectOrdinal` macro are transformed into [`selectOrdinal`](/docs/ref/message-format.md) format:

``` jsx
import { SelectOrdinal } from "@lingui/macro"

// count == 1 -> 1st
// count == 2 -> 2nd
// count == 3 -> 3rd
// count == 4 -> 4th
<SelectOrdinal
    value={count}
    one="#st"
    two="#nd"
    few="#rd"
    other="#th"
/>
```

### `Select`

| Prop name | Type   | Description                                         |
| --------- | ------ | --------------------------------------------------- |
| `value`   | number | (required) Value determines which form is outputted |
| `other`   | number | (required) Default, catch-all form                  |

 > MessageFormat: `{arg, select, ...forms}`

:::note
The select cases except `other` should be prefixed with underscore: `_male` or `_female`.
:::

Props of `Select` macro are transformed into [`select`](/docs/ref/message-format.md) format:

``` jsx
import { Select } from "@lingui/macro"

// gender == "female"      -> Her book
// gender == "male"        -> His book
// gender == "non-binary"  -> Their book
<Select
    value={gender}
    _male="His book"
    _female="Her book"
    other="Their book"
/>
```
