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
lingui add-locale [locales...] [--format <format>]
# e.g: lingui add-locale en fr es
```

This command creates a new directory for each locale in [localeDir][localeDir]

`--format` - Format of message catalogs (see [format][format] option)

### extract

```bash
lingui extract [--clean] [--format <format>] [--verbose]
```

This command extract messages from source files and creates message catalog for each language in following steps:

1. Extract messages from all `*.jsx?` files inside [srcPathDirs][srcPathDirs]
2. Merge them with existing catalogs in [localeDir][localeDir] (if any)
3. Write updated message catalogs to [localeDir][localeDir]

`--clean` - Remove obsolete messages from catalogs. Message becomes obsolete
when it's no longer in source code.
`--format` - Format of message catalogs (see [format][format] option)
`--verbose` - Prints additional information

### compile

```bash
lingui compile [--strict] [--format <format>] [--verbose]
```

This command compiles message catalogs in [localeDir][localeDir] and writes 
minified Javascript files. Each message is replace with function call, 
which returns translated message.

Also language data (plurals) are written to message catalog as well.

`--strict` - Fail when some catalog has missing translations.
`--format` - Format of message catalogs (see [format][format] option)
`--verbose` - Prints additional information

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
    ],
    "format": "lingui"
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

### format [string]

Default: `lingui`

Format of message catalogs. Possible values are:

#### `lingui`

Each message is object in following format. Origin is filename and line number
from where the message was extracted:

```json
{
  "MessageID": {
    "translation": "Translated Message",
    "defaults": "Default string (from source code)",
    "origin": [
      ["path/to/src.js", 42]
    ]
  }
}
```

#### `minimal`

Simple source - translation mapping:

```json
{
   "MessageId": "Translated Message"
}
```

[localeDir]: #localedir-string
[srcPathDirs]: #srcpathdirs-array
[srcPathIgnorePatters]: #srcpathignorepatterns-array
[format]: #format-string
