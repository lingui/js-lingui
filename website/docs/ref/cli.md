---
title: Lingui CLI
description: Lingui CLI manages locales, extracts messages from source files into message catalogs, and compiles message catalogs for production use.
keywords: [lingui, cli, extract, compile, i18n, internationalization, l10n, localization, translation]
---

# Lingui CLI

`@lingui/cli` manages locales, extracts messages from source files into message catalogs and compiles message catalogs for production use.

## Install

1.  Install `@lingui/cli` as a development dependency:

    ```bash npm2yarn
    npm install --save-dev @lingui/cli @babel/core
    ```

2.  Add following scripts to your `package.json`:

    ```json title="package.json"
    {
      "scripts": {
        "extract": "lingui extract",
        "compile": "lingui compile"
      }
    }
    ```

:::tip
If you use TypeScript, you can add `--typescript` flag to `compile` script to produce compiled message catalogs with TypeScript types.

```json title="package.json"
{
  "scripts": {
    "compile": "lingui compile --typescript"
  }
}
```

:::

## Global options

### `--config <config>`

Path to LinguiJS configuration file. If not set, the default file is loaded as described in [LinguiJS configuration](/docs/ref/conf.md) reference.

## Commands

## `extract`

```shell
lingui extract [files...]
        [--clean]
        [--overwrite]
        [--format <format>]
        [--locale <locale>]
        [--convert-from <format>]
        [--verbose]
        [--watch [--debounce <delay>]]
```

This command extracts messages from source files and creates a message catalog for each language using the following steps:

1.  Extract messages from all `*.jsx?` files inside `srcPathDirs`
2.  Merge them with existing catalogs in `localeDir` (if any)
3.  Write updated message catalogs to `localeDir`

#### `files` {#extract-files}

Filters source paths to only extract messages from passed files. For ex:

```shell
lingui extract src/components
```

Will extract only messages from `src/components/**/*` files, you can also pass multiple paths.

It's useful if you want to run extract command on files that are staged, using for example `husky`, before committing will extract messages from staged files:

```json title="package.json"
{
  "husky": {
    "hooks": {
      "pre-commit": "lingui extract $(git diff --name-only --staged)"
    }
  }
}
```

#### `--clean` {#extract-clean}

Remove obsolete messages from catalogs. Message becomes obsolete when it's missing in the source code.

#### `--overwrite` {#extract-overwrite}

Update translations for [`sourceLocale`](/docs/ref/conf.md#sourcelocale) from source.

#### `--format <format>` {#extract-format}

Format of message catalogs (see [`format`](/docs/ref/conf.md#format) option).

#### `--locale <locale>` {#extract-locale}

Only extract data for the specified locale.

#### `--convert-from <format>` {#extract-convert-from}

Convert message catalogs from previous format (see [`format`](/docs/ref/conf.md#format) option).

#### `--verbose` {#extract-verbose}

Prints additional information.

#### `--watch` {#extract-watch}

Watch mode.

Watches only for changes in files in paths defined in config file or in the command itself.

Remember to use this only in development as this command do not clean obsolete translations.

#### `--debounce <delay>` {#extract-debounce}

Debounce, when used with `--debounce <delay>`, delays extraction for `<delay>` milliseconds, bundling multiple file changes together.

## `extract-template`

```shell
lingui extract-template [--verbose]
```

This command extracts messages from source files and creates a `.pot` template file.

#### `--verbose` {#extract-template-verbose}

Prints additional information.

## `compile`

```shell
lingui compile
    [--strict]
    [--format <format>]
    [--verbose]
    [--typescript]
    [--namespace <namespace>]
    [--watch [--debounce <delay>]]
```

This command compiles message catalogs in `localeDir` and outputs minified JavaScript files. The produced file is basically a string which is parsed into a plain-JS object using `JSON.parse`.

The produced output has this shape:

```ts
export const messages = JSON.parse(`{
// object with keys (translation ids) and values (translations)
}`);
```

#### `--overwrite` {#compile-overwrite}

Overwrite translations for source locale from source.

#### `--strict` {#compile-strict}

Fail if a catalog has missing translations.

#### `--format <format>` {#compile-format}

Format of message catalogs (see [`format`](/docs/ref/conf.md#format) option).

#### `--verbose` {#compile-verbose}

Prints additional information.

#### `--namespace` {#compile-namespace}

Specify namespace for compiled message catalogs (also see [`compileNamespace`](/docs/ref/conf.md#compilenamespace) for global configuration).

#### `--typescript` {#compile-typescript}

Is the same as using [`compileNamespace`](/docs/ref/conf.md#compilenamespace) with the value "ts". Generates a `{compiledFile}.ts` file and the exported object is typed using TS.

#### `--watch` {#compile-watch}

Watch mode.

Watches only for changes in locale files in your defined locale catalogs. For ex. `locales\en\messages.po`

#### `--debounce <delay>` {#compile-debounce}

Debounce, when used with `--debounce <delay>`, delays compilation for `<delay>` milliseconds, to avoid compiling multiple times for subsequent file changes.

## Further reading

- [Message Extraction](/docs/guides/message-extraction.md)
