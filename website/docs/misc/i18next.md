---
title: Lingui vs i18next
description: Comparison of Lingui and i18next internationalization libraries
---

# Comparison with i18next

[i18next](https://www.i18next.com/) is a widely used internationalization framework designed specifically for JavaScript applications. Both i18next and Lingui are popular libraries for translating and localizing JavaScript-based projects, each offering unique strengths and features.

The choice between them ultimately depends on the specific needs of your project.

## Basic Comparison

Here's a simple example of how to use i18next:

```js
import i18next from "i18next";

i18next.init({
  lng: "en",
  resources: {
    en: {
      translation: {
        key: "Hello world",
      },
    },
  },
});
```

```js
import i18next from "i18next";

document.getElementById("output").innerHTML = i18next.t("key");
```

The equivalent example with Lingui looks like this:

```js title="lingui.config.{js,ts}"
import { defineConfig } from "@lingui/cli";

export default defineConfig({
  sourceLocale: "en",
  locales: ["en", "cs", "fr"],
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}/messages",
      include: ["src"],
    },
  ],
});
```

```js
import { t } from "@lingui/core/macro";

document.getElementById("output").innerHTML = t`Hello world`;
```

:::tip
This example uses a macro for the translation. Macros are a powerful feature of Lingui that allows you to write messages directly in your code. Read more about [Macros](../ref/macro.mdx).
:::

If you prefer to define explicit IDs for your messages, you can follow this approach:

```js
import { t } from "@lingui/core/macro";

document.getElementById("output").innerHTML = t({ id: "msg.greeting", message: `Hello World` });
```

Read more about [Explicit vs Generated Message IDs](../guides/explicit-vs-generated-ids.md).

## Interpolation

Interpolation is a key internationalization (i18n) feature that allows you to insert dynamic values into your translations. Both Lingui and i18next support interpolation.

i18next sample:

```js
import i18next from "i18next";

i18next.t("My name is {name}", { name: "Tom" });
i18next.t("msg.name", { name: "Tom" });
```

Lingui sample:

```js
import { t } from "@lingui/core/macro";

const name = "Tom";

t`My name is ${name}`;
t({ id: "msg.name", message: `My name is ${name}` });
```

## Formatting

Both Lingui and i18next formatting functions are based on the [Intl API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl).

### Numbers

i18next sample:

```js
import i18next from "i18next";

i18next.t("intlNumber", { val: 1000 });
// --> Some 1,000

i18next.t("intlNumber", { val: 1000.1, minimumFractionDigits: 3 });
// --> Some 1,000.100

i18next.t("intlNumber", { val: 1000.1, formatParams: { val: { minimumFractionDigits: 3 } } });
// --> Some 1,000.100

i18next.t("intlNumberWithOptions", { val: 2000 });
// --> Some 2,000.00

i18next.t("intlNumberWithOptions", { val: 2000, minimumFractionDigits: 3 });
// --> Some 2,000.000
```

Lingui sample:

```js
import { i18n } from "@lingui/core";

i18n.activate("en");
i18n.number(12345.678);
// Returns "12,345.678"

i18n.number(12345.678, { style: "currency", currency: "USD" });
// Returns "$12,345.68"

i18n.activate("cs");
i18n.number(12345.678);
// Returns "12 345,678"

i18n.number(12345.678, { style: "currency", currency: "CZK" });
// Returns "12 345,68 Kč"
```

### DateTime

i18next sample:

```js
import i18next from "i18next";

i18next.t("intlDateTime", { val: new Date(Date.UTC(2012, 11, 20, 3, 0, 0)) });
// --> On the 12/20/2012

i18next.t("intlDateTime", {
  val: new Date(Date.UTC(2012, 11, 20, 3, 0, 0)),
  formatParams: {
    val: { weekday: "long", year: "numeric", month: "long", day: "numeric" },
  },
});
// --> On the Thursday, December 20, 2012
```

Lingui sample:

```js
import { i18n } from "@lingui/core";

const d = new Date("2021-07-23T16:23:00");

i18n.activate("en");
i18n.date(d);
// Returns "7/23/2021"

i18n.date(d, { timeStyle: "medium" });
// Returns "4:23:00 PM"

i18n.date(d, { dateStyle: "medium", timeStyle: "medium" });
// Returns "Jul 23, 2021, 4:23:00 PM"
```

## Plurals

Lingui uses the [ICU MessageFormat](../guides/message-format.md) syntax to handle plurals. It provides a simple and translator-friendly approach to plurals localization.

For example:

```js
plural(numBooks, {
  one: "# book",
  other: "# books",
});
```

Under the hood, the [`plural`](../ref/macro.mdx#plural) macro is replaced with a low-level [`i18n._`](../ref/core.md#i18n._) call. In production, the example will look like this:

```js
i18n._({
  id: "d1wX4r",
  // stripped on production
  // message: '{numBooks, plural, one {# book} other {# books}}',
  values: { numBooks },
});
```

When we extract messages from the source code using the [Lingui CLI](../ref/cli.md), we get:

```icu-message-format
{numBooks, plural, one {# book} other {# books}}
```

i18next handles plurals differently. It requires a separate key to be defined for each plural form. This is not translator-friendly, lacks context, and is prone to errors:

```json
{
  "key_one": "item",
  "key_other": "items"
}
```

```js
import i18next from "i18next";

i18next.t("key", { count: 0 }); // -> "items"
i18next.t("key", { count: 1 }); // -> "item"
i18next.t("key", { count: 5 }); // -> "items"
```

## Context

By providing context, you can differentiate translations for the same sentences or provide translators with more details. Both i18next and Lingui have the context feature to differentiate messages.

i18next sample:

```js
import i18next from "i18next";

i18next.t("Right", { context: "direction" });
```

Lingui sample:

```js
import { msg } from "@lingui/core/macro";

msg({
  message: "Right",
  context: "direction",
});
```

:::tip
Lingui automatically provides additional context by including in the `.po` file the locations where each message is used, and `msgctxt` if the context is specified. This is useful for translators to understand the context of the message:

```gettext title="en.po"
#: src/App.js:5
msgctxt "direction"
msgid "Right"
msgstr "Right"
```

i18next can't do this from its plain JSON files.
:::

## React Integration

Both libraries provide React components for handling translations in React applications. Lingui provides a set of [React Macros](../ref/macro.mdx#react-macros) that simplify writing messages directly in your code. i18next provides a `Trans` component to handle translations in JSX.

i18next sample:

```jsx
import { Trans } from "react-i18next";

const HelloWorld = () => {
  return <Trans i18nKey="welcome">Hello World!</Trans>;
};
```

Lingui sample:

```jsx
import { Trans } from "@lingui/react/macro";

const HelloWorld = () => {
  return <Trans>Hello World!</Trans>;
};
```

## Summary

This is a rather brief comparison. Both libraries have quite different concepts, but at the same time the core internationalization approaches are similar and use the same background.

**On top of that, Lingui:**

- Supports rich-text messages.
- Provides macros to simplify writing messages directly in your code.
- Provides a CLI tool for extracting and compiling messages.
- Supports a number of [Catalog Formats](../ref/catalog-formats.md), including [Custom Formatters](../guides/custom-formatter.md).
- Is small, fast and flexible. It also has a small bundle footprint by stripping unused messages and loading only necessary catalogs.
- Works with vanilla JS, React (including RSC), Next.js, Node.js, Vue.js etc.
- Is actively maintained.

**On the other hand, i18next:**

- Uses a key-based approach for translation management.
- Is mature. Based on how long i18next has been open source, there is no real i18n case that cannot be solved with i18next.
- Is extensible, with many plugins and tools developed by other contributors, including extractors, locale identifiers, etc.
- Has a big ecosystem.

In conclusion, Lingui is an excellent option for projects that need modern and efficient translation methods, support for popular frameworks, and effective translation management tools. However, the choice between Lingui and i18next ultimately depends on the specific requirements of your project.
