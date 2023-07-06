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
  "plugins": ["macros"]
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
It's recommended to install `@lingui/macro` package as a production dependency rather than development one to avoid `import/no-extraneous-dependencies` errors in ESLint.
:::

## Overview

The advantages of using macros are:

- You don't need to learn ICU MessageFormat syntax. You always use familiar JS and JSX code.
- Components and functions are type checked.
- Short ID generated for your messages.
- Additional validation of plural rules is performed during transformation.
- Non-essential data are removed from the production build (e.g. comments and default messages) to shave a few bytes.

**JSX macros** are transformed to [`Trans`](/docs/ref/react.md#trans) component from [`@lingui/react`](/docs/ref/react.md):

```jsx
import { Trans } from "@lingui/macro";
<Trans>Attachment {name} saved</Trans>;

// ↓ ↓ ↓ ↓ ↓ ↓

import { Trans } from "@lingui/react";
<Trans id={"nwR43V"} message="Attachment {name} saved" values={{ name }} />;
```

**JS macros** (i.e. macros that looks like a simple JavaScript functions) are transformed into [`i18n._`](/docs/ref/core.md#i18n._) call.

```jsx
import { t } from "@lingui/macro";
t`Attachment ${name} saved`;

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core";

i18n._(
  /*i18n*/ {
    id: "nwR43V",
    message: "Attachment {name} saved",
    values: { name },
  }
);
```

:::note
By default, the `i18n` object is imported from `@lingui/core`. If you use a custom instance of `i18n` object, you need to set [`runtimeConfigModule`](/docs/ref/conf.md#runtimeconfigmodule) or pass a custom instance to [`t`](/docs/ref/macro.md#t).
:::

The only exception is [`defineMessage`](/docs/ref/macro.md#definemessage) which is transformed into message descriptor. In other words, the message isn't translated directly and can be used anytime later:

```jsx
import { i18n } from "@lingui/core"
import { defineMessage } from "@lingui/macro"

// define message
const message = defineMessage({ message: `Attachment ${name} saved` })

// translate it
i18n._(message)

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core"

// define message
const message = /*i18n*/{ id: "nwR43V", message: "Attachment {name} saved", values: { name }})

// translate it
i18n._(message)
```

### Examples of JS macros

```js
t`Refresh inbox`;

// ↓ ↓ ↓ ↓ ↓ ↓

i18n._(
  /*i18n*/ {
    id: "EsCV2T",
    message: "Refresh inbox",
  }
);
```

```js
t`Attachment ${name} saved`;

// ↓ ↓ ↓ ↓ ↓ ↓

i18n._(
  /*i18n*/ {
    id: "nwR43V",
    message: "Attachment {name} saved",
    values: { name },
  }
);
```

```js
t(customI18n)`Refresh inbox`;

// ↓ ↓ ↓ ↓ ↓ ↓

customI18n._(
  /*i18n*/ {
    id: "EsCV2T",
    message: "Refresh inbox",
  }
);
```

```js
t(customI18n)`Attachment ${name} saved`;

// ↓ ↓ ↓ ↓ ↓ ↓

customI18n._(
  /*i18n*/ {
    id: "nwR43V",
    message: "Attachment {name} saved",
    values: { name },
  }
);
```

```js
plural(count, {
  one: "# Message",
  other: "# Messages",
});

// ↓ ↓ ↓ ↓ ↓ ↓

i18n._(
  /*i18n*/ {
    id: "4w2nim",
    message: "{count, plural, one {# Message} other {# Messages}}",
    values: { count },
  }
);
```

```js
t({
  id: "msg.refresh",
  message: "Refresh inbox",
});

// ↓ ↓ ↓ ↓ ↓ ↓

i18n._(
  /*i18n*/ {
    id: "msg.refresh",
    message: "Refresh inbox",
  }
);
```

```js
t(customI18n)({
  id: "msg.refresh",
  message: "Refresh inbox",
});

// ↓ ↓ ↓ ↓ ↓ ↓

customI18n._(
  /*i18n*/ {
    id: "msg.refresh",
    message: "Refresh inbox",
  }
);
```

```js
const msg = defineMessage`Refresh inbox`;

// ↓ ↓ ↓ ↓ ↓ ↓

const msg = /*i18n*/ {
  id: "EsCV2T",
  message: "Refresh inbox",
};
```

```js
const msg = defineMessage({
  id: "msg.refresh",
  message: "Refresh inbox",
});

// ↓ ↓ ↓ ↓ ↓ ↓

const msg = /*i18n*/ {
  id: "msg.refresh",
  message: "Refresh inbox",
};
```

```js
const msg = defineMessage({
  id: "msg.plural",
  message: plural(count, {
    one: "# Message",
    other: "# Messages",
  }),
});

// ↓ ↓ ↓ ↓ ↓ ↓

const msg = /*i18n*/ {
  id: "msg.plural",
  message: "{count, plural, one {# Message} other {# Messages}}",
  values: { count },
};
```

### Examples of JSX macros

```jsx
<Trans>Attachment {name} saved</Trans>

// ↓ ↓ ↓ ↓ ↓ ↓

<Trans
   id={"nwR43V"}
   message="Attachment {name} saved"
   values={{ name }}
/>
```

```jsx
<Plural
   value={count}
   one="# Message"
   other="# Messages"
/>

// ↓ ↓ ↓ ↓ ↓ ↓

<Trans
   id={"4w2nim"}
   message="{count, plural, one {# Message} other {# Messages}}"
   values={{ count }}
/>
```

```jsx
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

These macros can be used in any context (e.g. outside JSX). All JS macros are transformed into a _Message Descriptor_ wrapped inside of [`i18n._`](/docs/ref/core.md#i18n._) call.

:::note
By default, the `i18n` object is imported from `@lingui/core`. If you use a custom instance of `i18n` object, you need to set [`runtimeConfigModule`](/docs/ref/conf.md#runtimeconfigmodule) or pass a custom instance to [`t`](/docs/ref/macro.md#t).
:::

_Message Descriptor_ is an object with message ID, default message and other parameters. [`i18n._`](/docs/ref/core.md#i18n._) accepts message descriptors and performs translation and formatting:

```ts
type MessageDescriptor = {
  id: string;
  message?: string;
  values?: Record<string, any>;
  comment?: string;
};
```

`id` is the message ID and the only required parameter. `id` and `message` are extracted to the message catalog. Only `id` and `values` are used at runtime, all other attributes are removed from production code for size optimization.

You don't need to provide your ID manually. Macro will automatically create a short ID from your message.

:::info Note
i18n comment

In the examples below you might notice `/*i18n*/` comment in macro output. This comment tells the extract plugin that following object should be collected to message catalog.
:::

### `t`

The most common macro for messages. It transforms tagged template literal into message in ICU MessageFormat:

```js
import { t } from "@lingui/macro";
const message = t`Hello World`;

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core";
const message = i18n._(
  /*i18n*/ {
    id: "mY42CM",
    message: "Hello World",
  }
);
```

Message variables are supported:

```js
import { t } from "@lingui/macro";
const message = t`My name is ${name}`;

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core";
const message = i18n._(
  /*i18n*/ {
    id: "mVmaLu",
    message: "My name is {name}",
    values: { name },
  }
);
```

In fact, any expression can be used inside template literal. However, only simple variables are referenced by name in a transformed message. All other expressions are referenced by numeric index:

```js
import { t } from "@lingui/macro";
const message = t`Today is ${new Date()}`;

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core";

const message = i18n._(
  /*i18n*/ {
    id: "2aJT27",
    message: "Today is {0}",
    values: { 0: new Date() },
  }
);
```

Optionally, a custom `i18n` instance can be passed that can be used instead of the global instance:

```jsx
import { t } from "@lingui/macro";
import { i18nCustom } from "./lingui";
const message = t(i18nCustom)`Hello World`;

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18nCustom } from "./lingui";

import { i18n } from "@lingui/core";
const message = i18nCustom._(
  /*i18n*/ {
    id: "mY42CM",
    message: "Hello World",
  }
);
```

It's also possible to pass custom `id` and `comment` for translators by calling `t` macro with a message descriptor:

```jsx
import { t } from "@lingui/macro";
const message = t({
  id: "msg.hello",
  comment: "Greetings at the homepage",
  message: `Hello ${name}`,
});

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core";
const message = i18n._(
  /*i18n*/ {
    id: "msg.hello",
    comment: "Greetings at the homepage",
    message: "Hello {name}",
    values: { name },
  }
);
```

In this case the `message` is used as a default message and it's transformed as if it were wrapped in `t` macro. `message` also accepts any other macros:

```js
import { t } from "@lingui/macro";
const message = t({
  id: "msg.plural",
  message: plural(value, { one: "...", other: "..." }),
});

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core";
const message = i18n._(
  /*i18n*/ {
    id: "msg.plural",
    message: "{value, plural, one {...} other {...}}",
    values: { value },
  }
);
```

### `plural`

```ts
plural(value: string | number, options: Object)
```

`plural` macro is used for pluralization, e.g: messages which has different form based on counter. The first argument `value` determines the plural form. The second argument is an object with available plural forms. Plural form used in the source code depends on your source locale (e.g. English has only `one` and `other`).

```js
import { plural } from "@lingui/macro";
const message = plural(count, {
  one: "# Book",
  other: "# Books",
});

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core";
const message = i18n._(
  /*i18n*/ {
    id: "V/M0Vc",
    message: "{count, plural, one {# Book} other {# Books}}",
    values: { count },
  }
);
```

If you need to add variables to plural form, you can use template string literals. This time [`t`](/docs/ref/macro.md#t) macro isn't required as template strings are transformed automatically:

```js
import { plural } from "@lingui/macro";
const message = plural(count, {
  one: `${name} has # friend`,
  other: `${name} has # friends`,
});

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core";
const message = i18n._(
  /*i18n*/ {
    id: "CvuUwE",
    message: "{count, plural, one {{name} has # friend} other {{name} has # friends}}",
    values: { count, name },
  }
);
```

Plurals can also be nested to form complex messages. Here's an example using two counters:

```js
import { plural } from "@lingui/macro";
const message = plural(numBooks, {
  one: plural(numArticles, {
    one: `1 book and 1 article`,
    other: `1 book and ${numArticles} articles`,
  }),
  other: plural(numArticles, {
    one: `${numBooks} books and 1 article`,
    other: `${numBooks} books and ${numArticles} articles`,
  }),
});

// ↓ ↓ ↓ ↓ ↓ ↓
// Generated message was wrapped for better readability

import { i18n } from "@lingui/core";
const message = i18n._(
  /*i18n*/ {
    id: "XnUh4j",
    message: `{numBooks, plural,
         one {{numArticles, plural,
            one {1 book and 1 article}
            other {1 book and {numArticles} articles}
         }}
         other {{numArticles, plural,
            one {{numBooks} books and 1 article}
            other {{numBooks} books and {numArticles} articles}
         }}
      }`,
    values: { numBooks, numArticles },
  }
);
```

:::tip
This is just an example how macros can be combined to create a complex messages. However, simple is better because in the end it's the translator who's gonna have to translate these long and complex strings.
:::

:::tip
Use `plural` inside [`t`](#t) or [`defineMessage`](#definemessage) macro if you want to add custom `id`, `context` or `comment` for translators.

```js
const message = t({
  id: "my.custom.id",
  comment: "My Comment",
  message: plural(count, {
    one: "# Book",
    other: "# Books",
  }),
});
```

:::

### `selectOrdinal`

```ts
selectOrdinal(value: string | number, options: Object)
```

`selectOrdinal` macro is similar to [`plural`](#plural) but instead of using cardinal plural forms it uses ordinal forms:

```js
import { selectOrdinal } from "@lingui/macro";
const message = selectOrdinal(count, {
  one: "#st",
  two: "#nd",
  few: "#rd",
  other: "#th",
});

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core";
const message = i18n._(
  /*i18n*/ {
    id: "V8xI3w",
    message: "{count, selectOrdinal, one {#st} two {#nd} few {#rd} other {#th}}",
    values: { count },
  }
);
```

:::tip
Use `selectOrdinal` inside [`t`](#t) or [`defineMessage`](#definemessage) macro if you want to add custom `id`, `context` or `comment` for translators.

```js
const message = t({
  id: "my.custom.id",
  comment: "My Comment",
  message: selectOrdinal(count, {
    one: "#st",
    two: "#nd",
    few: "#rd",
    other: "#th",
  }),
});
```

:::

### `select`

```ts
select(value: string | number, options: Object)
```

`select` macro works as a switch statement — it select one of the forms provided in `options` object which key matches exactly `value`:

```js
import { select } from "@lingui/macro";
const message = select(gender, {
  male: "he",
  female: "she",
  other: "they",
});

// ↓ ↓ ↓ ↓ ↓ ↓

import { i18n } from "@lingui/core";

const message = i18n._(
  /*i18n*/ {
    id: "VRptzI",
    message: "{gender, select, male {he} female {she} other {they}}",
    values: { gender },
  }
);
```

:::tip
Use `select` inside [`t`](#t) or [`defineMessage`](#definemessage) macro if you want to add custom `id`, `context` or `comment` for translators.

```js
const message = t({
  id: "my.custom.id",
  comment: "My Comment",
  message: select(gender, {
    male: "he",
    female: "she",
    other: "they",
  }),
});
```

:::

### `defineMessage` alias: `msg` {#definemessage}

`defineMessage` macro allows to define a message for later use. It has the same signature as `t` and returns a `MessageDescriptor` that you can pass to `i18n._` to get a translated string at any time later. This is useful for [lazy translations](/tutorials/react-patterns#lazy-translations).

In other words, `t` returns a translated string at the time when it's called, while `msg` returns a `MessageDescriptor` that can produce translated strings later.

```ts
import { defineMessage } from "@lingui/macro";
const message = defineMessage`Hello World`;

// ↓ ↓ ↓ ↓ ↓ ↓

const message = /*i18n*/ {
  id: "mY42CM",
  message: "Hello World",
};
```

You also can use shorter alias of `defineMessage` macro:

```ts
import { msg } from "@lingui/macro";
const message = msg`Hello World`;

// ↓ ↓ ↓ ↓ ↓ ↓

const message = /*i18n*/ {
  id: "mY42CM",
  message: "Hello World",
};
```

`defineMessage` macro also supports `MacroMessageDescriptor` object as input. That can be used to provide additional information for message such as comment or context.

```ts
type MacroMessageDescriptor = {
  id?: string;
  message?: string;
  comment?: string;
  context?: string;
};
```

Either `id` or `message` property is required. `id` is a custom message ID. If it isn't set, the `message` (and `context` if provided) are used for generating an ID.

```js
import { defineMessage } from "@lingui/macro";
const message = defineMessage({
  id: "Navigation / About",
  message: "About us",
});

// ↓ ↓ ↓ ↓ ↓ ↓

const message = /*i18n*/ {
  id: "Navigation / About",
  message: "About us",
};
```

`message` is the default message. Any JS macro can be used here. Template string literals don't need to be tagged with [`t`](#t).

```js
import { defineMessage } from "@lingui/macro";

const name = "Joe";

const message = defineMessage({
  comment: "Greetings on the welcome page",
  message: `Welcome, ${name}!`,
});

// ↓ ↓ ↓ ↓ ↓ ↓

const message = /*i18n*/ {
  id: "dgJjNB",
  comment: "Greetings on the welcome page",
  message: "Welcome, {name}",
  values: {
    name,
  },
};
```

`comment` is a comment for translators. It's extracted to the message catalog and it gives translators extra information about the message. It's removed from the production code:

```js
import { defineMessage } from "@lingui/macro";
const message = defineMessage({
  comment: "Link in navigation pointing to About page",
  message: "About us",
});

// ↓ ↓ ↓ ↓ ↓ ↓

const message = /*i18n*/ {
  id: "+mNwru",
  comment: "Link in navigation pointing to About page",
  message: "About us",
};
```

:::caution Note
In production build, the macro is stripped of `message`, `comment` and `context` properties:

```js
import { defineMessage } from "@lingui/macro";
const message = defineMessage({
  id: "msg.navigation.about",
  comment: "Link in navigation pointing to About page",
  message: "About us",
  context: "Context about the link",
});

// process.env.NODE_ENV === "production"
// ↓ ↓ ↓ ↓ ↓ ↓

const message = /*i18n*/ {
  id: "msg.navigation.about",
};
```

`message` and `comment` are used in message catalogs only. `context` is used only for generating ID and is stripped from the output.

:::

## JSX Macros

### `Trans`

| Prop name | Type   | Description                                                                                     |
| --------- | ------ | ----------------------------------------------------------------------------------------------- |
| `id`      | string | Custom message ID                                                                               |
| `comment` | string | Comment for translators                                                                         |
| `context` | string | Allows to extract the same messages with different IDs. See [Context](#context) for more detail |

[`Trans`](/docs/ref/react.md#trans) is the basic macro for static messages, messages with variables, but also for messages with inline markup:

#### `id`

Each message in catalog is identified by **message ID**.

While macro uses message (and `context` property if provided) to generate ID, it's possible to override it.

```jsx
import { Trans } from "@lingui/macro";
<Trans id="message.attachment_saved">Attachment {name} saved.</Trans>;

// ↓ ↓ ↓ ↓ ↓ ↓

import { Trans } from "@lingui/react";
<Trans id="message.attachment_saved" message="Attachment {name} saved." />;
```

#### `render`

Render prop function used to render translation. This prop is directly passed to [`Trans`](/docs/ref/react.md#trans) component from [`@lingui/react`](/docs/ref/react.md). See [rendering of translations](/docs/ref/react.md#rendering-translations) for more info.

#### `comment`

Comment for translators to give them additional information about the message. It will be visible in the [TMS](/tools/introduction) if supported by it, and the [catalog format](/ref/catalog-formats).

It's removed from the production code.

#### `context` {#context-prop}

Contextual information for translators. Similar to [`comment`](#comment) but also allows to extract the same messages with different IDs. It will be visible in the [TMS](/tools/introduction) if supported by it, and the [catalog format](/ref/catalog-formats).

It's removed from the production code. See [Context](#context) for more details.

```jsx
import { Trans } from "@lingui/macro";
<Trans>Refresh inbox</Trans>;

// ↓ ↓ ↓ ↓ ↓ ↓

import { Trans } from "@lingui/react";
<Trans id={"EsCV2T"} message="Refresh inbox" />;
```

Lingui generates different IDs when `context` is provided:

```jsx
import { Trans } from "@lingui/macro";
<Trans context="direction">right</Trans>;
<Trans context="correctness">right</Trans>;

// ↓ ↓ ↓ ↓ ↓ ↓

import { Trans } from "@lingui/react";
<Trans id={"d1wX4r"} message="right" />;
<Trans id={"16eaSK"} message="right" />;
```

Custom `id` is preserved:

```jsx
import { Trans } from "@lingui/macro";
<Trans id="message.attachment_saved">Attachment {name} saved.</Trans>;

// ↓ ↓ ↓ ↓ ↓ ↓

import { Trans } from "@lingui/react";
<Trans id="message.attachment_saved" message="Attachment {name} saved." />;
```

This macro is especially useful when message contains inline markup.

```jsx
import { Trans } from "@lingui/macro";

<Trans>
  Read the <a href="/docs">docs</a>.
</Trans>;

// ↓ ↓ ↓ ↓ ↓ ↓

import { Trans } from "@lingui/macro";
<Trans id={"mk8bSG"} message="Read the <0>docs</0>." components={{ 0: <a href="/docs" /> }} />;
```

Components and HTML tags are replaced with dummy indexed tags (`<0></0>`) which has several advantages:

- both custom React components and built-in HTML tags are supported
- change of component props doesn't break the translation
- the message is extracted as a whole sentence (this seems to be obvious, but most i18n libs simply split message into pieces by tags and translate them separately)

### `Plural`

| Prop name   | Type           | Description                                                                                                                                           |
| ----------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`     | number         | (required) Value is mapped to plural form below                                                                                                       |
| `format`    | string\|Object | Number format passed as options to [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat) |
| `offset`    | number         | Offset of value when calculating plural forms                                                                                                         |
| `zero`      | string         | Form for empty `value`                                                                                                                                |
| `one`       | string         | _Singular_ form                                                                                                                                       |
| `two`       | string         | _Dual_ form                                                                                                                                           |
| `few`       | string         | _Paucal_ form                                                                                                                                         |
| `many`      | string         | _Plural_ form                                                                                                                                         |
| `other`     | string         | (required) general _plural_ form                                                                                                                      |
| `_<number>` | string         | Exact match form, corresponds to `=N` rule                                                                                                            |

> MessageFormat: `{arg, plural, ...forms}`

Props of [`Plural`](/docs/ref/macro.md#plural-1) macro are transformed into [`plural`](/docs/ref/message-format.md) format.

```jsx
import { Plural } from "@lingui/macro";
<Plural value={numBooks} one="Book" other="Books" />;

// ↓ ↓ ↓ ↓ ↓ ↓

import { Trans } from "@lingui/react";
<Trans id={"is7n96"} message="{numBooks, plural, one {Book} other {Books}}" values={{ numBooks }} />;
```

`#` are formatted using `number` format. `format` prop is passed to this formatter.

Exact matches in MessageFormat syntax are expressed as `=int` (e.g. `=0`), but in React this isn't a valid prop name. Therefore, exact matches are expressed as `_int` prop (e.g. `_0`). This is commonly used in combination with `offset` prop. `offset` affects only plural forms, not exact matches.

```jsx
import { Plural } from "@lingui/macro";

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
/>;

/*
  This is transformed to Trans component with ID:
  {count, plural, offset:1 _0    {Nobody arrived}
                           _1    {Only you arrived}
                           one   {You and # other guest arrived}
                           other {You and # other guests arrived}}
*/
```

Use `<Plural>` inside `<Trans>` macro if you want to provide `id`, `context` or `comment`.

```jsx
<Trans context={"my context"}>
  <Plural value={numBooks} one="Book" other="Books" />;
</Trans>
```

### `SelectOrdinal`

| Prop name   | Type           | Description                                                                                                                                           |
| ----------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`     | number         | (required) Value is mapped to plural form below                                                                                                       |
| `offset`    | number         | Offset of value for plural forms                                                                                                                      |
| `zero`      | string         | Form for empty `value`                                                                                                                                |
| `one`       | string         | _Singular_ form                                                                                                                                       |
| `two`       | string         | _Dual_ form                                                                                                                                           |
| `few`       | string         | _Paucal_ form                                                                                                                                         |
| `many`      | string         | _Plural_ form                                                                                                                                         |
| `other`     | string         | (required) general _plural_ form                                                                                                                      |
| `_<number>` | string         | Exact match form, correspond to `=N` rule. (e.g: `_0`, `_1`)                                                                                          |
| `format`    | string\|Object | Number format passed as options to [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat) |

> MessageFormat: `{arg, selectordinal, ...forms}`

Props of `SelectOrdinal` macro are transformed into [`selectOrdinal`](/docs/ref/message-format.md) format:

```jsx
import { SelectOrdinal } from "@lingui/macro";

// count == 1 -> 1st
// count == 2 -> 2nd
// count == 3 -> 3rd
// count == 4 -> 4th
<SelectOrdinal value={count} one="#st" two="#nd" few="#rd" other="#th" />;
```

Use `<SelectOrdinal>` inside `<Trans>` macro if you want to provide `id`, `context` or `comment`.

```jsx
<Trans context={"my context"}>
  <SelectOrdinal value={count} one="#st" two="#nd" few="#rd" other="#th" />
</Trans>
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

```jsx
import { Select } from "@lingui/macro";

// gender == "female"      -> Her book
// gender == "male"        -> His book
// gender == "non-binary"  -> Their book
<Select value={gender} _male="His book" _female="Her book" other="Their book" />;
```

Use `<Select>` inside `<Trans>` macro if you want to provide `id`, `context` or `comment`.

```jsx
<Trans context={"my context"}>
  <Select value={gender} _male="His book" _female="Her book" other="Their book" />
</Trans>
```

## Context

By default, when using generated IDs, the same text elements are extracted with the same ID, and then translated once. This, however, may not always be desired because the same text can have different meaning and translation: For example, consider the word "right" and its two possible meanings:

- correct as in "you are right"
- direction as in "turn right"

To distinguish these two cases, you can add `context` to messages. The same text elements with different contexts are extracted with different IDs. Then, they can be translated differently and merged back into the application as different translation entries.

Regardless of whether you use generated IDs or not, adding context makes the translation process less challenging and helps translators interpret the source accurately. You, in return, get translations of better quality faster and decrease the number of context-related issues you would need to solve.
