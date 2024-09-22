---
title: Lingui CLI
description: Learn how to set up and use Lingui CLI to extract, merge and compile message catalogs
---

# Lingui CLI

The `@lingui/cli` tool provides the `lingui` command, which allows the extraction of messages from source files into message catalogs and the compilation of message catalogs for production use.

## Install

1. Install `@lingui/cli` as a development dependency:

   ```bash npm2yarn
   npm install --save-dev @lingui/cli
   ```

2. Add the following scripts to your `package.json`:

   ```json title="package.json"
   {
     "scripts": {
       "extract": "lingui extract",
       "compile": "lingui compile"
     }
   }
   ```

:::tip
If you use TypeScript, you can add the `--typescript` flag to the `compile` script to produce compiled message catalogs with TypeScript types:

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

Path to the configuration file. If not set, the default file is loaded as described in the [Lingui configuration](/docs/ref/conf.md) reference.

## Commands

### `extract`

```shell
lingui extract [files...]
        [--clean]
        [--overwrite]
        [--format <format>]
        [--locale <locale, [...]>]
        [--convert-from <format>]
        [--verbose]
        [--watch]
        [--debounce <delay>]
```

The `extract` command looks for messages in the source files and extracts them

This command scans the source files, identifies messages, and creates a separate message catalog for each language. The process includes the following steps:

1. Extract messages from files based on the `include` and `exclude` options in the [`catalogs`](/docs/ref/conf.md#catalogs) section of the configuration file.
2. Merge them with existing message catalogs (if any)
3. Write updated message catalogs.
4. Print statistics about the extracted messages for each language, showing the total number of messages and the number of missing translations.

:::tip
Visit the [Message Extraction](/docs/guides/message-extraction.md) guide to learn more about how it works.
:::

#### `files` {#extract-files}

Filters source paths to only extract messages from passed files. For ex:

```shell
lingui extract src/components
```

Will only extract messages from `src/components/**/*` files, you can pass multiple paths.

It's useful if you want to run the extract command on files that are staged, for example using `husky`, before committing will extract messages from staged files:

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

By default, the `extract` command merges messages extracted from source files with the existing message catalogs. This is safe as we won't accidentally lose translated messages.

However, over time, some messages may be removed from the source code. We can use this option to clean up our message catalogs from obsolete messages.

#### `--overwrite` {#extract-overwrite}

Update translations for [`sourceLocale`](/docs/ref/conf.md#sourcelocale) from source.

#### `--format <format>` {#extract-format}

Extract message catalogs to the specified file format (see the [`format`](/docs/ref/conf.md#format) option for more details).

#### `--locale <locale, [...]>` {#extract-locale}

Extract data for the specified locales only.

#### `--convert-from <format>` {#extract-convert-from}

Convert message catalogs from the previous format (see the [`format`](/docs/ref/conf.md#format) option for more details).

#### `--verbose` {#extract-verbose}

Prints additional information.

#### `--watch` {#extract-watch}

Watch mode. Only watches for changes in files in paths defined in the config file or in the command itself. Remember to use this only in development, as this command does not clean up obsolete translations.

#### `--debounce <delay>` {#extract-debounce}

Delays the extraction by `<delay>` milliseconds, bundling multiple file changes together.

### `extract-template`

```shell
lingui extract-template [--verbose]
```

This command extracts messages from source files and creates a `.pot` template file. Any artifacts created by this command may be ignored in version control. If your message catalogs are not synchronized with the source and don't contain some messages, the application will fall back to the template file. This command is useful to run before building the application.

#### `--verbose` {#extract-template-verbose}

Prints additional information.

### `compile`

```shell
lingui compile
    [--strict]
    [--format <format>]
    [--verbose]
    [--typescript]
    [--namespace <namespace>]
    [--watch [--debounce <delay>]]
```

Once we have all the catalogs ready and translated, we can use this command to compile all the catalogs into minified JS/TS files. It compiles message catalogs in the [`path`](/docs/ref/conf.md#catalogs) directory and outputs minified JavaScript files. The resulting file is basically a string that is parsed into a plain JS object using `JSON.parse`.

The output looks like this:

```ts
export const messages = JSON.parse(`{
// object with keys (translation ids) and values (translations)
}`);
```

Messages added to the compiled file are collected in a specific order:

1.  Translated messages from the specified locale.
2.  Translated messages from the fallback locale for the specified locale.
3.  Translated message from default fallback locale.
4.  Message key.

It is also possible to merge the translated catalogs into a single file per locale by specifying `catalogsMergePath` in the configuration. For example, if `catalogsMergePath` is set to `locales/{locale}`, then the catalogs will be compiled into `/locales/cs.js` and `/locales/en.js`.

#### `--overwrite` {#compile-overwrite}

Overwrite source locale translations from source.

#### `--strict` {#compile-strict}

Fail if a catalog has missing translations.

#### `--format <format>` {#compile-format}

Format of message catalogs (see the [`format`](/docs/ref/conf.md#format) option for more details).

#### `--verbose` {#compile-verbose}

Prints additional information.

#### `--namespace` {#compile-namespace}

Specify the namespace for compiled message catalogs (see also [`compileNamespace`](/docs/ref/conf.md#compilenamespace) for global configuration).

#### `--typescript` {#compile-typescript}

Is the same as using [`compileNamespace`](/docs/ref/conf.md#compilenamespace) with the value "ts". Generates a `{compiledFile}.ts` file and the exported object is typed using TS.

#### `--watch` {#compile-watch}

Watch mode. Watches only for changes in locale files in your defined locale catalogs. For example, `locales\en\messages.po`.

#### `--debounce <delay>` {#compile-debounce}

Delays compilation by `<delay>` milliseconds to avoid multiple compilations for subsequent file changes.

## Configuring the source locale

One drawback to checking for missing translations is that the English message catalog doesn't need translations because our source code is in English. This can be addressed by configuring the [`sourceLocale`](/docs/ref/conf.md#sourcelocale) in the configuration file.

## Catalogs in VCS and CI

If you're using CI, it's a good idea to add the `compile` command to your build process. Alternatively, you can also use a [Webpack loader](/docs/ref/loader.md) or [Vite plugin](/docs/ref/vite-plugin.md).

Depending on your localization setup, you might also want to run the `extract` command in CI and upload the extracted messages to a [translation service](/docs/tools/introduction.md).

## Further reading

- [Lingui Configuration](/docs/ref/conf.md)
- [Message Extraction](/docs/guides/message-extraction.md)
- [Catalog Formats](/docs/ref/catalog-formats.md)
- [Custom Extractor](/docs/guides/custom-extractor.md)
- [Excluding build files](/docs/guides/excluding-build-files.md)
