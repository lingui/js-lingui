---
title: Pluralization
description: Learn about pluralization and how to use it in your application with Lingui
---

# Pluralization

Plurals are essential when dealing with internationalization. [LinguiJS](https://github.com/lingui/js-lingui) uses [CLDR Plural Rules](https://unicode-org.github.io/cldr-staging/charts/latest/supplemental/language_plural_rules.html).
In general, there are 6 plural forms (taken from [CLDR Plurals](https://cldr.unicode.org/index/cldr-spec/plural-rules) page):

- zero
- one (singular)
- two (dual)
- few (paucal)
- many (also used for fractions if they have a separate class)
- other (required — general plural form — also used if the language
  only has a single form)

Only the last one, _other_, is required because it's the only common plural form used in all languages.

All other plural forms depends on language. For example, English has only two: _one_ and _other_ (1 book vs. 2 books). In Czech, we have four: _one_, _few_, _many_ and _other_ (1 kniha, 2 knihy, 1,5 knihy, 5 knih). Some languages have even more, like Arabic.

## Using plural forms

Good thing is that **as developers, we have to know only plural forms for the source language**.

If we use English in the source code, then we'll use only _one_ and _other_:

```js
plural(numBooks, {
  one: "# book",
  other: "# books",
});
```

When `numBooks == 1`, this will render as _1 book_ and for `numBook == 2` it will be _2 books_.

Interestingly, for `numBooks == -1`, it will be _-1 book_. This is because the "one" plural form also applies to -1. It is therefore important to remember that the plural forms (such as "one" or "two") do not represent the numbers themselves, but rather _categories_ of numbers.
If you want to specify a message for an exact number, use [`exact matches`](/guides/message-format#plurals).

> Funny fact for non-English speakers: In English, 0 uses plural form too, _0 books_.

Under the hood, [`plural`](../ref/macro.mdx#plural) is replaced with low-level [`i18n._`](../ref/core.md#i18n._). For production, the above example will become:

```js
i18n._({
  id: "d1wX4r",
  // stripped on production
  // message: '{numBooks, plural, one {# book} other {# books}}',
  values: { numBooks },
});
```

When we extract messages from source code using the [CLI tool](../ref/cli.md), we get:

```icu-message-format
{numBooks, plural, one {# book} other {# books}}
```

Now, we give it to our Czech translator, and they'll translate it as:

```icu-message-format
{numBooks, plural, one {# kniha} few {# knihy} many {# knihy} other {# knih}}
```

The important thing is that _we don't need to change our code to support languages with different plural rules_. Here's a step-by-step description of the process:

1.  In source code, we have:

    ```js
    plural(numBooks, {
      one: "# book",
      other: "# books",
    });
    ```

2.  Code is compiled to:

    ```js
    i18n._({
      id: "d1wX4r",
      // stripped on production
      // message: '{numBooks, plural, one {# book} other {# books}}',
      values: { numBooks },
    });
    ```

3.  Message `{numBooks, plural, one {# book} other {# books}}` is translated to:

    ```icu-message-format
    {numBooks, plural, one {# kniha} few {# knihy} many {# knihy} other {# knih}}
    ```

4.  Finally, message is formatted using Czech plural rules.

## Source code in language other than English

As mentioned above, as developers, we have to know and use only plural forms for the source language. Go see what [plural forms](http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html) your languages has and then you can use them. Here's the example in Czech:

```js
plural(numBooks, {
  one: "# kniha",
  few: "# knihy",
  many: "# knihy",
  other: "# knih",
});
```

This make [LinguiJS](https://github.com/lingui/js-lingui) useful also for unilingual projects, i.e: if you don't translate your app at all. Plurals, number and date formatting are common in every language.
