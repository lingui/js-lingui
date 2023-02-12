# Lingui CLI

`@lingui/cli` manages locales, extracts messages from source files into message catalogs and compiles message catalogs for production use.

## Install

1.  Install `@lingui/cli` as a development dependency:

    ```bash npm2yarn
    npm install --save-dev @lingui/cli @babel/core
    ```

2.  Add following scripts to your `package.json`:

    ``` json title="package.json"
    {
       "scripts": {
          "extract": "lingui extract",
          "compile": "lingui compile",
       }
    }
    ```

## Global options

### `--config <config>`

Path to LinguiJS configuration file. If not set, the default file is loaded as described in [LinguiJS configuration](/docs/ref/conf.md) reference.

## Commands

## `extract`

``` shell
lingui extract [files...]
        [--clean]
        [--overwrite]
        [--format <format>]
        [--locale <locale>]
        [--convert-from <format>]
        [--verbose]
        [--watch [--debounce <delay>]]
        [--flatten]
```

This command extracts messages from source files and creates a message catalog for each language using the following steps:

1.  Extract messages from all `*.jsx?` files inside `srcPathDirs`
2.  Merge them with existing catalogs in `localeDir` (if any)
3.  Write updated message catalogs to `localeDir`

#### `files` {#extract-files}

Filters source paths to only extract messages from passed files. For ex:

``` shell
lingui extract src/components
```

Will extract only messages from `src/components/**/*` files, you can also pass multiple paths.

It's useful if you want to run extract command on files that are staged, using for example `husky`, before commiting will extract messages from staged files:

``` json title="package.json"
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

#### `--flatten` {#extract-flatten}

Flattens the ICU message in the following way:

``` none
I have {value, plural, one {one book} other {# books}}
```

is changed to

``` none
{value, plural, one {I have one book} other {I have # books}}
```

This provides translators with full sentences for all cases.

## `extract-template`

``` shell
lingui extract-template [--verbose]
        [--flatten]
```

This command extracts messages from source files and creates a `.pot` template file.

#### `--verbose` {#extract-template-verbose}

Prints additional information.

#### `--flatten` {#extract-template-flatten}

Flattens the ICU message in the following way:

``` none
I have {value, plural, one {one book} other {# books}}
```

is changed to

``` none
{value, plural, one {I have one book} other {I have # books}}
```

This provides translators with full sentences for all cases.

## `compile`

``` shell
lingui compile
    [--strict]
    [--format <format>]
    [--verbose]
    [--namespace <namespace>]
    [--watch [--debounce <delay>]]
```

#### `--overwrite` {#compile-overwrite}

This command compiles message catalogs in `localeDir` and outputs minified Javascript files. Each message is replaced with a function that returns the translated message when called.

Also, language data (pluralizations) are written to the message catalog as well.

#### `--strict` {#compile-strict}

Fail if a catalog has missing translations.

#### `--format <format>` {#compile-format}

Format of message catalogs (see [`format`](/docs/ref/conf.md#format) option).

#### `--verbose` {#compile-verbose}

Prints additional information.

#### `--namespace` {#compile-namespace}

Specify namespace for compiled message catalogs (also see [`compileNamespace`](/docs/ref/conf.md#compilenamespace) for global configuration).

#### `--typescript` {#compile-typescript}

Is the same as using [`compileNamespace`](/docs/ref/conf.md#compilenamespace) with the value "ts". Generates a `{compiledFile}.d.ts` and the compiled file is generated using the extension .ts

#### `--watch` {#compile-watch}

Watch mode.

Watches only for changes in locale files in your defined locale catalogs. For ex. `locales\en\messages.po`

#### `--debounce <delay>` {#compile-debounce}

Debounce, when used with `--debounce <delay>`, delays compilation for `<delay>` milliseconds, to avoid compiling multiple times for subsequent file changes.
