# ESLint Plugin

Lingui provides an ESLint plugin to help you find common Lingui usage errors in your code.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```bash npm2yarn
npm install --save-dev eslint
```

Next, install `eslint-plugin-lingui`:

```bash npm2yarn
npm install --save-dev eslint-plugin-lingui
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-lingui` globally.

## Usage

Add `lingui` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["lingui"]
}
```

:::info
See the [official repository](https://github.com/lingui/eslint-plugin#usage) for more information on the rules.
:::
