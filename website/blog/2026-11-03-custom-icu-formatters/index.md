---
title: "Custom ICU Formatters in Lingui"
authors: [andrii-bodnar]
tags: [features]
---

ICU MessageFormat comes with a fixed set of formatters: `plural`, `select`, `selectordinal`, `number`, `date` and `time`. Anything else had to happen in your code before the value reached the message, which meant the translator had no say in it. Lingui now lets you register your own formatters on the `i18n` instance and use them in messages like the built-in ones.

<!--truncate-->

## Register a formatter

A formatter is a function that takes the argument value and a context with the active locale. Register it with `i18n.setFormatters`, and any message can use it as `{value, name}`:

```ts
import { i18n } from "@lingui/core";

i18n.setFormatters({
  capitalize: (value, { locale }) => {
    const [first = "", ...rest] = String(value ?? "");
    return first.toLocaleUpperCase(locale) + rest.join("");
  },
});
```

The interesting part is who decides to use it. The English source can stay `Your {type} has been removed`, while a German translator writes `{type, capitalize} wurde entfernt` because the noun now starts the sentence. The formatting choice lives in the translation, where it belongs, and other languages are unaffected.

## Pass a parameter

Formatters also accept an optional parameter after a second comma, `{value, name, param}`. Here's a `list` formatter built on `Intl.ListFormat`:

```ts
i18n.setFormatters({
  list: (value, { locale, param }) =>
    new Intl.ListFormat(locale, {
      type: param === "disjunction" || param === "unit" ? param : "conjunction",
    }).format(value as string[]),
});
```

```icu-message-format
Genres: {genres, list}
Genres: {genres, list, disjunction}
```

With `["Rock", "Jazz", "Pop"]` in English, these render "Genres: Rock, Jazz, and Pop" and "Genres: Rock, Jazz, or Pop". In other locales, `Intl.ListFormat` picks the right separators and conjunction for you.

## Good to know

- Formatters can also be passed to `setupI18n({ formatters })`, and `i18n.setFormatter(name, fn)` adds or removes a single one. Changing formatters emits the `change` event, so React and Vue apps update.
- The built-in names are reserved, and registering one of them throws an error.
- If a message uses a formatter that isn't registered, the value is rendered as is, with a warning in development builds.
- Some translation management systems don't recognize custom formatters yet, so their QA checks may flag `{type, capitalize}` as a missing placeholder.

## Try it out

Custom formatters ship in the next Lingui release. The [`i18n.setFormatters` reference](/ref/core#i18n.setformatters) covers the full API and its limitations. Share what you build with it in [GitHub Discussions](https://github.com/lingui/js-lingui/discussions), and if a formatter doesn't behave the way you expect, please [open an issue](https://github.com/lingui/js-lingui/issues).
