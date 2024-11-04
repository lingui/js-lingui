---
title: Pluralization
description: Learn about pluralization and how to use it in your application with Lingui
---

# Pluralization

Pluralization is essential for effective internationalization, allowing applications to display messages or select options based on the number. In this article, we explore various categories of pluralization, see implementation examples, and learn how to customize your application for different languages.

Lingui uses the [CLDR Plural Rules](https://www.unicode.org/cldr/charts/42/supplemental/language_plural_rules.html) to determine the correct plural form for each language.

In general, there are 6 plural forms (taken from the [CLDR Plurals](https://cldr.unicode.org/index/cldr-spec/plural-rules) page):

- zero
- one (singular)
- two (dual)
- few (paucal)
- many (also used for fractions if they have a separate class)
- other (required — general plural form — also used if the language only has a single form)

:::info
Only the _other_ form is required, because it's the only common plural form used in all languages.

All other plural forms depend on the language. For example, English has only two forms: _one_ and _other_ (1 book vs. 2 books). In Czech, we have four: _one_, _few_, _many_ and _other_ (1 kniha, 2 knihy, 1,5 knihy, 5 knih). Some languages have even more, such as Arabic.
:::

## Using Plural Forms

The good thing is that **as developers, we only need to know the plural forms of the source language**.

When we use English in the source code, we'll only use _one_ and _other_:

```js
plural(numBooks, {
  one: "# book",
  other: "# books",
});
```

When `numBooks == 1`, this will render as _1 book_ and for `numBook == 2` it will be _2 books_. Interestingly, for `numBooks == -1`, it will be _-1 book_. This is because the "one" plural form also applies to -1. It is therefore important to remember that the plural forms (such as "one" or "two") do not represent the numbers themselves, but rather _categories_ of numbers.

Under the hood, the [`plural`](/docs/ref/macro.mdx#plural) macro is replaced with a low-level [`i18n._`](/docs/ref/core.md#i18n._) call. In production, the example will look like this:

```js
i18n._({
  id: "d1wX4r",
  // stripped on production
  // message: '{numBooks, plural, one {# book} other {# books}}',
  values: { numBooks },
});
```

When we extract messages from the source code using the [Lingui CLI](/docs/ref/cli.md), we get:

```icu-message-format
{numBooks, plural, one {# book} other {# books}}
```

This is then translated by our Czech translator as:

```icu-message-format
{numBooks, plural, one {# kniha} few {# knihy} many {# knihy} other {# knih}}
```

:::tip Important
The important thing is that _we don't have to change our code to support languages with different plural rules_.
:::

## Source Code in Language Other than English

As developers, we only need to be aware of the plural forms for the source language. Check the [plural forms](https://www.unicode.org/cldr/charts/42/supplemental/language_plural_rules.html) for your language, and then you can use them accordingly. Here's an example in Czech:

```js
plural(numBooks, {
  one: "# kniha",
  few: "# knihy",
  many: "# knihy",
  other: "# knih",
});
```

This makes Lingui also valuable for monolingual projects, meaning that you can benefit from it even if you don't translate your application. Pluralization, along with number and date formatting, is relevant to all languages.
