---
title: Lingui ESLint Plugin
description: Lingui ESLint Plugin helps you find and prevent common i18n mistakes in your code
---

# ESLint Plugin

Lingui provides an ESLint plugin to help you find common Lingui usage errors in your code.

[![npm-version](https://img.shields.io/npm/v/eslint-plugin-lingui?logo=npm&cacheSeconds=1800)](https://www.npmjs.com/package/eslint-plugin-lingui)
[![npm-downloads](https://img.shields.io/npm/dt/eslint-plugin-lingui?cacheSeconds=500)](https://www.npmjs.com/package/eslint-plugin-lingui)

## Installation

Install [ESLint](http://eslint.org):

```bash npm2yarn
npm install --save-dev eslint
```

Next, install `eslint-plugin-lingui`:

```bash npm2yarn
npm install --save-dev eslint-plugin-lingui
```

If you have installed ESLint globally (using the `-g` flag), you must also install `eslint-plugin-lingui` globally.

## Usage

Add `lingui` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["lingui"]
}
```

In the rules section, configure the rules you want to use:

```json
{
  "rules": {
    "lingui/no-unlocalized-strings": 2,
    "lingui/t-call-in-function": 2,
    "lingui/no-single-variables-to-translate": 2,
    "lingui/no-expression-in-message": 2,
    "lingui/no-single-tag-to-translate": 2,
    "lingui/no-trans-inside-trans": 2
  }
}
```

:::info
See the [official repository](https://github.com/lingui/eslint-plugin) for more information about the rules.
:::

:::caution
The ESLint's [Flat Config](https://eslint.org/blog/2022/08/new-config-system-part-2/) is not yet supported. See [#31](https://github.com/lingui/eslint-plugin/issues/31).
:::
