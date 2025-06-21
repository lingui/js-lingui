---
title: Pseudolocalization
description: Learn how to use pseudolocalization to test the internationalization aspects of your application with Lingui
---

# Pseudolocalization

There is built in support for [pseudolocalization](https://en.wikipedia.org/wiki/Pseudolocalization). Pseudolocalization is a method for testing the internationalization aspects of your application by replacing your strings with altered versions and maintaining string readability. It also makes hard coded strings and improperly concatenated strings easy to spot so that they can be properly localized.

> Example: Ţĥĩś ţēxţ ĩś ƥśēũďōĺōćàĺĩźēď

## Configuration

To setup pseudolocalization add [`pseudoLocale`](../ref/conf.md#pseudolocale) to your lingui [`configuration file`](../ref/conf.md):

```json
{
  "lingui": {
    "locale": ["en", "pseudo-LOCALE"],
    "pseudoLocale": "pseudo-LOCALE",
    "fallbackLocales": {
      "pseudo-LOCALE": "en"
    }
  }
}
```

[`pseudoLocale`](../ref/conf.md#pseudolocale) option can be any string that is in `locale`

Examples: `en-PL`, `pseudo-LOCALE`, `pseudolocalization` or `en-UK`

## Create pseudolocalization

[`pseudoLocale`](../ref/conf.md#pseudolocale) string has to be in [`locales`](../ref/conf.md#locales) config as well. Otherwise, no folder and no pseudolocalization is going to be created. After running [`extract`](../ref/cli.md#extract) verify that the folder has been created. The pseudolocalization is automatically created on [`compile`](../ref/cli.md#compile) from messages. In case fallbackLocales has been used, the pseudolocalization is going to be created from translated fallback locale.

## Switch browser into specified pseudoLocale

We can use browsers settings or extensions. Extensions allow to use any locale. Browsers are usually limited into valid language tags (BCP 47). In that case, the locale for pseudolocalization has to be standard locale, which is not used in your application for example `zu_ZA` Zulu - SOUTH AFRICA

Chrome:

- With extension (valid locale) - [Locale Switcher](https://chrome.google.com/webstore/detail/locale-switcher/kngfjpghaokedippaapkfihdlmmlafcc)
- Without extension (valid locale) - [chrome://settings/?search=languages](chrome://settings/?search=languages)

Firefox:

- With extension (any string) - [Quick Accept-Language Switcher](https://addons.mozilla.org/en-GB/firefox/addon/quick-accept-language-switc/?src=search)
- Without extension (valid locale) - [about:preferences#general](about:preferences#general) > _Language_
