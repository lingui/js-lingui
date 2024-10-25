---
title: Lingui CLI
description: Learn how to set up and use Lingui CLI to extract, merge and compile message catalogs
---

# Lingui CLI

The `@lingui/cli` tool provides the `lingui` command which allows you to extract messages from source files into message catalogs and compile these catalogs for production use.

## Installation

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

## Global Options

### `--config <config>`

Path to the configuration file. If not set, the default file is loaded as described in the [Configuration](/docs/ref/conf.md) reference.

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
        [--watch [--debounce <delay>]]
```

The `extract` command scans source files to locate and extract messages, generating separate message catalogs for each language.

This process involves:

1. Extracting messages from files based on the `include` and `exclude` settings in the [`catalogs`](/docs/ref/conf.md#catalogs) section of the configuration file.
2. Merging the newly extracted messages with any existing message catalogs.
3. Updating and saving the message catalogs.
4. Printing extraction statistics for each language, including the total number of messages and any missing translations.

:::tip
Refer to the [Message Extraction](/docs/guides/message-extraction.md) guide to learn more about this process and the options available.
:::

#### `files` {#extract-files}

Filter source paths to extract messages only from specific files. For example:

```shell
lingui extract src/components
```

This command extracts messages from files within the `src/components/**/*` path. You can also pass multiple paths for extraction.

This feature is useful when you want to extract messages from files that are staged for commit. For example, you can use husky to automatically extract messages from staged files before committing:

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

By default, the extract command merges messages extracted from source files with existing message catalogs, ensuring that translated messages are preserved and not accidentally lost.

However, over time, some messages may be removed from the source code. You can use the following option to clean up your message catalogs and remove obsolete messages.

#### `--overwrite` {#extract-overwrite}

Update translations for [`sourceLocale`](/docs/ref/conf.md#sourcelocale) from source.

#### `--format <format>` {#extract-format}

Extract message catalogs to the specified file format (see the [`format`](/docs/ref/conf.md#format) option for more details).

#### `--locale <locale, [...]>` {#extract-locale}

Extract data for the specified locales only.

#### `--convert-from <format>` {#extract-convert-from}

Convert message catalogs from the previous format (see the [`format`](/docs/ref/conf.md#format) option for more details).

#### `--verbose` {#extract-verbose}

Print additional information.

#### `--watch` {#extract-watch}

Enable watch mode to monitor changes in files located in the paths specified in the configuration file or in the command itself. Note that this feature is intended for development use only, as it does not remove obsolete translations.

#### `--debounce <delay>` {#extract-debounce}

Delay the extraction by `<delay>` milliseconds, bundling multiple file changes together.

### `extract-template`

```shell
lingui extract-template [--verbose]
```

This command extracts messages from your source files and generates a `.pot` template file. Any artifacts created by this command can be safely ignored in version control.

If your message catalogs are not synchronized with the source and some messages are missing, the application will fallback to the template file. Running this command before building the application is recommended to ensure all messages are accounted for.

#### `--verbose` {#extract-template-verbose}

Print additional information.

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

Once you have all the catalogs ready and translated, you can use this command to compile all the catalogs into minified JS/TS files. It compiles message catalogs located in the [`path`](/docs/ref/conf.md#catalogs) directory and generates minified JavaScript files. The resulting file is a string that is parsed into a plain JS object using `JSON.parse`.

The output looks like this:

```ts
export const messages = JSON.parse(`{
// object with keys (translation ids) and values (translations)
}`);
```

Messages added to the compiled file are collected in a specific order:

1. Translated messages from the specified locale.
2. Translated messages from the fallback locale for the specified locale.
3. Translated message from default fallback locale.
4. Message key.

It is also possible to merge the translated catalogs into a single file per locale by specifying [`catalogsMergePath`](/docs/ref/conf.md#catalogsmergepath) in the configuration.

:::tip
The compiled files can be safely ignored by your version control system, since these files must be created each time you deploy to production. We recommend you to create the compiled catalogs in CI as part of your deployment process. Always remember to **use compiled catalogs** in deployments.

```ignore title=".gitignore"
your_locale_folder/**/*.js
```

:::

#### `--overwrite` {#compile-overwrite}

Overwrite source locale translations from source.

#### `--strict` {#compile-strict}

Fail if a catalog has missing translations.

#### `--format <format>` {#compile-format}

Format of message catalogs (see the [`format`](/docs/ref/conf.md#format) option for more details).

#### `--verbose` {#compile-verbose}

Print additional information.

#### `--namespace` {#compile-namespace}

Specify the namespace for compiled message catalogs (see also [`compileNamespace`](/docs/ref/conf.md#compilenamespace) for global configuration).

#### `--typescript` {#compile-typescript}

Is the same as using [`compileNamespace`](/docs/ref/conf.md#compilenamespace) with the value "ts". Generates a `{compiledFile}.ts` file and the exported object is typed using TS.

#### `--watch` {#compile-watch}

Watch mode. Watches only for changes in locale files in your defined locale catalogs. For example, `locales\en\messages.po`.

#### `--debounce <delay>` {#compile-debounce}

Delays compilation by `<delay>` milliseconds to avoid multiple compilations for subsequent file changes.

## Configuring the Source Locale

One limitation of checking for missing translations is that the English message catalog typically does not require translations since our source code is in English. This issue can be resolved by configuring the [`sourceLocale`](/docs/ref/conf.md#sourcelocale) in the configuration file.

## Compiling Catalogs in CI {#compiling-catalogs-in-ci}

If you're using CI, it's a good idea to add the `compile` command to your build process. Alternatively, you can also use a [Webpack loader](/docs/ref/loader.md), [Vite plugin](/docs/ref/vite-plugin.md) or [Metro transformer](/docs/ref/metro-transformer.mdx).

Depending on your localization setup, you might also want to run the `extract` command in CI and upload the extracted messages to a [translation service](/docs/tools/introduction.md).

## Further reading

- [Lingui Configuration](/docs/ref/conf.md)
- [Message Extraction](/docs/guides/message-extraction.md)
- [Catalog Formats](/docs/ref/catalog-formats.md)
- [Custom Extractor](/docs/guides/custom-extractor.md)
