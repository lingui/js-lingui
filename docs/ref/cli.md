# Reference: CLI

`lingui-cli` provides command line interface for extracting, merging
and compiling message catalogs.

Contents:

- [Install](#install)
- [Commands](#commands)
- [Configuration](#configuration)

## Install

`lingui-cli` can be installed both globally and locally:

```sh
yarn global add lingui-cli
# npm install --global lingui-cli
```

or locally:

```sh
yarn add --dev lingui-cli
# npm install --save-dev lingui-cli
```

**Note:** When installed locally, you need either run it from 
`node_modules/.bin/lingui` or add it to your `package.json`:

```json
{
  "scripts": {
    "add-locale": "lingui add-locale",
    "extract": "lingui extract",
    "compile": "lingui compile"
  }
}
```

Then you can use:

```bash
npm run add-locale -- en cs
npm run extract
npm run compile
```

## Commands

### add-locale

```bash
lingui add-locale [locales...]
# e.g: lingui add-locale en fr es
```

This command creates a new directory for each locale in [localeDir][localeDir]

### extract

```bash
lingui extract
```

This command extract messages from source files and creates message catalog for each language in following steps:

1. Extract messages from all `*.jsx?` files inside [srcPathDirs][srcPathDirs]
2. Merge them with existing catalogs in [localeDir][localeDir] (if any)
3. Write updated message catalogs to [localeDir][localeDir]

### compile

```bash
lingui compile
```

This command compiles message catalogs in [localeDir][localeDir] and writes 
minified Javascript files. Each message is replace with function call, 
which returns translated message.

Also language data (plurals) are written to message catalog as well.

## Configuration

Configuration is read from `lingui` section in `package.json`.

Default config:

```json
{
  "lingui": {
    "fallbackLanguage": "",
    "localeDir": "<rootDir>/locale",
    "srcPathDirs": [
        "<rootDir>"
    ],
    "srcPathIgnorePatterns": [
        "/node_modules/"
    ]
  }
}
```

### fallbackLanguage [string]

`fallbackLangauge` is used when translation for given language is missing.

If `fallbackLanguage` isn't defined or translation in `fallbackLanguage` is 
missing too, message ID is used instead.

### localeDir [string]

Default: `<rootDir>/locale`

Directory where message catalogs are stored.

### srcPathDirs [Array]

Default: `[<rootDir>]`

List of directories with source files from which messages are extracted. Ignored
directories are defined in [srcPathIgnorePatters][srcPathIgnorePatters].

### srcPathIgnorePatterns [Array]

Default: `["/node_modules/"]`

Ignored directories when looking for source files to extract messages.

[localeDir]: #localedir-string
[srcPathDirs]: #srcpathdirs-array
[srcPathIgnorePatters]: #srcpathignorepatterns-array
