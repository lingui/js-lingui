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

:::info
If you have installed ESLint globally (using the `-g` flag), you must also install `eslint-plugin-lingui` globally.
:::

## Usage

### Flat Config (`eslint.config.js`) {#flat-config}

Version 8 of ESLint introduced a new configuration format called [Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files). Flat config files represent plugins and parsers as JavaScript objects.

#### Recommended Setup

To enable all the recommended rules for the plugin, add the following config:

```js
import pluginLingui from "eslint-plugin-lingui";

export default [
  pluginLingui.configs["flat/recommended"],
  // Any other config...
];
```

#### Custom Setup

Alternatively, you can load the plugin and configure only the rules you want to use:

```js
import pluginLingui from "eslint-plugin-lingui";

export default [
  {
    plugins: {
      lingui: pluginLingui,
    },
    rules: {
      "lingui/t-call-in-function": "error",
    },
  },
  // Any other config...
];
```

### Legacy Config (`.eslintrc`) {#legacy-eslintrc}

The legacy configuration format has been deprecated by ESLint, but it's still supported. If you're using the legacy format, you can use the following configuration.

#### Recommended Setup

To enable all the recommended rules for the plugin, add `plugin:lingui/recommended` to the `extends` section:

```json
{
  "extends": ["plugin:lingui/recommended"]
}
```

#### Custom Setup

Alternatively, add `lingui` to the `plugins` section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["lingui"]
}
```

In the rules section, configure the rules you want to use. For example:

```json
{
  "rules": {
    "lingui/no-unlocalized-strings": 2,
    "lingui/t-call-in-function": 2,
    "lingui/no-single-variables-to-translate": 2,
    "lingui/no-expression-in-message": 2,
    "lingui/no-single-tag-to-translate": 2,
    "lingui/no-trans-inside-trans": 2,
    "lingui/no-unnamed-tag-placeholders": 2
  }
}
```

### Oxlint {#oxlint}

The plugin also works as an [Oxlint JS plugin](https://oxc.rs/docs/guide/usage/linter/js-plugins) without any changes. Add it to `jsPlugins` in your `.oxlintrc.json` and enable the rules you need.

Oxlint doesn't read the plugin's `configs`, so the recommended rules have to be listed explicitly:

```json
{
  "jsPlugins": ["eslint-plugin-lingui"],
  "rules": {
    "lingui/t-call-in-function": "error",
    "lingui/no-single-tag-to-translate": "warn",
    "lingui/no-single-variables-to-translate": "warn",
    "lingui/no-trans-inside-trans": "warn",
    "lingui/no-expression-in-message": "warn"
  }
}
```

Compatibility with Oxlint is verified in CI on every change. The only known limitation is the `useTsTypes` option of the [`no-unlocalized-strings`](https://github.com/lingui/eslint-plugin/blob/main/docs/rules/no-unlocalized-strings.md) rule: it needs type information from `@typescript-eslint/parser`, which Oxlint doesn't provide.

:::tip
See the [official repository](https://github.com/lingui/eslint-plugin) for more information about the rules.
:::
