---
title: Lingui vs i18next
description: How Lingui compares with i18next and react-i18next. Message syntax, plurals, extraction tooling, catalog formats, bundle size and React Server Components
---

# Lingui vs i18next

[i18next](https://www.i18next.com/) is one of the most widely used internationalization frameworks for JavaScript, with bindings for React, Vue, Angular, Svelte and many other frameworks and platforms. Both libraries solve the same problem, but they start from different ideas. With i18next you invent a key for each string, put the text in a JSON file and look the key up at runtime. With Lingui you write the text where it is displayed, the IDs are generated from it and the catalogs are compiled at build time.

That difference runs through everything else on this page: how messages are written, what translators receive and what ships to the browser.

## At a Glance

|                    | Lingui                                                                                                                         | i18next                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| Writing messages   | The text stays in the code: `` t`Hello ${name}` ``. The catalog is generated from it                                           | You choose a key, add the text to a JSON file and reference the key: `t("greeting", { name })`                                         |
| Message IDs        | Generated from the source text, so there is nothing to name and duplicates merge on their own. Explicit IDs when you want them | Keys you define and keep unique yourself. Natural-language keys are possible with `keySeparator: false`                                |
| Message syntax     | ICU MessageFormat. Placeholders, plurals and selects stay inside one message                                                   | Own `{{name}}` syntax. Each plural form is a separate key (`key_one`, `key_other`). ICU needs the `i18next-icu` plugin                 |
| Extraction         | Built in. `lingui extract` finds every message, merges it into all catalogs and marks removed ones obsolete                    | Separate tools: `i18next-cli` (the successor of `i18next-parser`) or `i18next-scanner`                                                 |
| Translator context | Source locations, comments and context travel with each message in the PO file                                                 | JSON has no comments. Key locations need a custom `i18next-cli` metadata plugin                                                        |
| Catalog format     | PO by default, which every translation tool opens. JSON, CSV and custom formatters available                                   | JSON, bundled inline or loaded through backend plugins. YAML and JSON5 via `i18next-cli`                                               |
| Runtime            | Catalogs are compiled at build time and no message parser ships. Core about 2 kB gzipped                                       | Messages interpolated at runtime. Core about 14 kB gzipped                                                                             |
| React              | `@lingui/react` with macros. React Server Components through `@lingui/react/server`                                            | `react-i18next`. For React Server Components, `next-i18next` v16 adds `getT` and `useT`, or you create an i18next instance per request |
| Other frameworks   | React Native, Vue, SolidJS, Astro, Svelte, Node.js                                                                             | Vue, Angular, Svelte, SolidJS, Astro, Remix, Node.js and more                                                                          |
| TypeScript         | Written in TypeScript. Opt-in typed message IDs via module augmentation                                                        | Ships type definitions. Typed keys and interpolation values via `CustomTypeOptions`                                                    |

Bundle sizes were measured with [bundlejs](https://bundlejs.com/) in September 2026 for `@lingui/core` 6.6 and `i18next` 26.4.

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

To know what this line renders, you open the JSON file and look up `key`. The equivalent example with Lingui keeps the text in the code, and the CLI generates the catalog from it:

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
This example uses a macro for the translation. Macros are a powerful feature of Lingui that allows you to write messages directly in your code. Read more about [Macros](/ref/macro).
:::

If you prefer to define explicit IDs for your messages, you can follow this approach:

```js
import { t } from "@lingui/core/macro";

document.getElementById("output").innerHTML = t({ id: "msg.greeting", message: `Hello World` });
```

Read more about [Explicit vs Generated Message IDs](/guides/explicit-vs-generated-ids).

## Interpolation

Interpolation is a key internationalization (i18n) feature that allows you to insert dynamic values into your translations. Both Lingui and i18next support interpolation.

i18next sample:

```js
import i18next from "i18next";

i18next.t("My name is {{name}}", { name: "Tom" });
i18next.t("msg.name", { name: "Tom" });
```

Lingui sample:

```js
import { t } from "@lingui/core/macro";

const name = "Tom";

t`My name is ${name}`;
t({ id: "msg.name", message: `My name is ${name}` });
```

Lingui names the placeholder after the variable, so the message and the code cannot drift apart. With i18next, the `{{name}}` in the JSON file and the `{ name }` in the call are matched by hand.

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
new Intl.NumberFormat(i18n.locale).format(12345.678);
// Returns "12,345.678"

new Intl.NumberFormat(i18n.locale, { style: "currency", currency: "USD" }).format(12345.678);
// Returns "$12,345.68"

i18n.activate("cs");
new Intl.NumberFormat(i18n.locale).format(12345.678);
// Returns "12 345,678"

new Intl.NumberFormat(i18n.locale, { style: "currency", currency: "CZK" }).format(12345.678);
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
new Intl.DateTimeFormat(i18n.locale).format(d);
// Returns "7/23/2021"

new Intl.DateTimeFormat(i18n.locale, { timeStyle: "medium" }).format(d);
// Returns "4:23:00 PM"

new Intl.DateTimeFormat(i18n.locale, { dateStyle: "medium", timeStyle: "medium" }).format(d);
// Returns "Jul 23, 2021, 4:23:00 PM"
```

## Plurals

Lingui uses the [ICU MessageFormat](/guides/message-format) syntax to handle plurals. All forms of a message stay together in one string that the translator sees as a whole.

For example:

```js
plural(numBooks, {
  one: "# book",
  other: "# books",
});
```

Under the hood, the [`plural`](/ref/macro#plural) macro is replaced with a low-level [`i18n._`](/ref/core#i18n._) call. In production, the example will look like this:

```js
i18n._({
  id: "d1wX4r",
  // stripped on production
  // message: '{numBooks, plural, one {# book} other {# books}}',
  values: { numBooks },
});
```

When we extract messages from the source code using the [Lingui CLI](/ref/cli), we get:

```icu-message-format
{numBooks, plural, one {# book} other {# books}}
```

i18next stores each plural form under its own key. The suffixes follow the CLDR plural categories returned by `Intl.PluralRules`, so English uses `_one` and `_other`, while Arabic adds `_zero`, `_two`, `_few` and `_many`:

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

In the catalog, `item` and `items` are two separate entries. Nothing ties them together or shows the translator the sentence they appear in. If you prefer ICU plurals with i18next, the [`i18next-icu`](https://github.com/i18next/i18next-icu) plugin switches the message syntax to ICU MessageFormat, at which point i18next's own interpolation and plural keys no longer apply.

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
Lingui also writes the source locations of each message into the `.po` file, together with `msgctxt` when a context is given, so translators can see where a message is used:

```gettext title="en.po"
#: src/App.js:5
msgctxt "direction"
msgid "Right"
msgstr "Right"
```

JSON has no comment syntax, so this information is not part of i18next catalogs by default. `i18next-cli` can record key locations through a custom metadata plugin.
:::

## React Integration

Both libraries provide React components for handling translations in React applications. Lingui provides a set of [React Macros](/ref/macro#react-macros) that simplify writing messages directly in your code. i18next provides a `Trans` component to handle translations in JSX.

i18next sample:

```jsx
import { Trans } from "react-i18next";

const HelloWorld = () => {
  return <Trans i18nKey="welcome">Hello World!</Trans>;
};
```

The translation lives under `welcome` in the JSON file. The children are the fallback when the key is missing.

Lingui sample:

```jsx
import { Trans } from "@lingui/react/macro";

const HelloWorld = () => {
  return <Trans>Hello World!</Trans>;
};
```

Here the children are the message. The ID is derived from them, and `lingui extract` writes the entry to the catalog.

## Summary

Both libraries build on the same foundations: the `Intl` API for formatting, CLDR plural rules and one catalog per locale. They differ in how much of the bookkeeping is yours.

**Lingui:**

- Messages are written in the source with macros. There are no keys to invent and no JSON file to keep in sync, because `lingui extract` generates the catalog from the code.
- Plurals, selects and rich text stay inside one message, and React elements inside a message stay in one translatable string.
- Catalogs are PO files by default, which every translation tool opens and which carry source locations and comments for translators. JSON, CSV and [custom formatters](/guides/custom-formatter) are available. See [Catalog Formats](/ref/catalog-formats).
- Catalogs are compiled ahead of time, so the runtime ships without a message parser and stays around 2 kB gzipped.
- Works with vanilla JS, React (including React Server Components), React Native, Next.js, Vue, SolidJS, Astro, Svelte and Node.js.

**i18next:**

- Messages are looked up by key. Resources are plain JSON and can be loaded from the filesystem, over HTTP or from a translation platform through backend plugins.
- Has been around for more than a decade and covers nearly every i18n scenario, with an official CLI for extraction, type generation and linting.
- Has a large plugin ecosystem: language detectors, backends, post processors and alternative message formats such as ICU and Fluent.
- Has bindings or ports for many frameworks and platforms, including Vue, Angular, Svelte, .NET, Go, iOS and Android.

i18next's breadth is real, and if your organization already runs it across several stacks, that continuity counts. For a JavaScript or TypeScript codebase, Lingui covers the same ground with less to maintain by hand: no keys to name, no JSON to keep in sync, and catalogs that open in any translation tool.
