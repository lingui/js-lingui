# Comparison with i18next

[i18next](https://www.i18next.com/) is an internationalization-framework written in and for JavaScript. i18next and Lingui are two popular internationalization (i18n) libraries used for translating and localizing JS-based applications. Both libraries have their strengths and weaknesses, and which one is best for a particular project depends on the project's specific needs.

## Basic comparison

Here is a basic example of the i18next usage:

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
// ...
document.getElementById("output").innerHTML = i18next.t("key");
```

Since the Lingui v4 release, there is a core function [i18n.t(...)](/docs/ref/core.md#i18n.t) that allows doing pretty much the same thing. The following example shows how this works with Lingui:

```js title="lingui.config.{js,ts}"
/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  sourceLocale: "en",
  locales: ["en", "cs", "fr"],
  catalogs: [
    {
      path: "src/locales/{locale}/messages",
      include: ["src"],
    },
  ],
};
```

```js
import { i18n } from "@lingui/core";

document.getElementById("output").innerHTML = i18n.t({ id: "key", message: "Hello world" });
```

:::note
The `message` property can be specified in the case of [Message Extraction](/docs/guides/message-extraction.md) usage flow. You can use the `i18n.t` function only with the `id`, but in this case you'll have to manage your localization catalogs yourself, without advantages of the [CLI message extraction](/docs/tutorials/cli.md#extracting-messages) feature.
:::

## Interpolation

Interpolation is one of the most used functionalities in I18N. It allows integrating dynamic values into your translations.

i18next sample:

```js
i18next.t("msg.name", { name: "Tom" });
```

Lingui sample:

```js
i18n._({ id: "msg.name", message: "My name is {name}", values: { name: "Tom" } });
```

## Formatting

Both the Lingui and i18next formatting functions are based on the [Intl API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl).

### Numbers

i18next sample:

```js
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

Lingui uses the ICU MessageFormat syntax to handle plurals. It provides a simple and translator-friendly approach to plurals localization.

For example:

```js
plural(numBooks, {
  one: "# book",
  other: "# books",
});
```

Under the hood, plural is replaced with low-level `i18n._`. For production, the above example will become:

```js
i18n._({
  id: "d1wX4r",
  // stripped on production
  // message: '{numBooks, plural, one {# book} other {# books}}',
  values: { numBooks },
});
```

When we extract messages from source code using Lingui CLI, we get:

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
i18next.t("key", { count: 0 }); // -> "items"
i18next.t("key", { count: 1 }); // -> "item"
i18next.t("key", { count: 5 }); // -> "items"
```

## Context

By providing a context you can differ translations. Both i18next and Lingui have the context feature to differentiate messages.

## Summary

This is a rather short comparison. Both libraries have quite different concepts, but at the same time the core internationalization approaches are similar and use the same background.

On top of that, [Lingui](https://github.com/lingui/js-lingui):

- supports rich-text messages
- provides macros to simplify writing messages using MessageFormat syntax
- provides a CLI for extracting and compiling messages
- supports a number of [Catalog formats](/docs/ref/catalog-formats.md), including [Custom Formatters](/docs/guides/custom-formatter.md)
- is very small (**3kb** gzipped), fast, flexible, and stable
- works for vanilla JS, Next.js, Vue.js, Node.js etc.
- is actively maintained.

On the other hand, [i18next](https://www.i18next.com/):

- mature. Based on how long i18next already is available open source, there is no real i18n case that could not be solved with i18next
- extensible
- has a big ecosystem.

Lingui is a great choice for projects that require modern and efficient translation approaches, support for popular frameworks, and tools for managing translations. However, whether Lingui is better than i18next or not depends on the specific needs of the project.

## Discussion

Do you have any comments or questions? Please join the discussion at [GitHub](https://github.com/lingui/js-lingui/discussions) or raise an [issue](https://github.com/lingui/js-lingui/issues/new). All feedback is welcome!
