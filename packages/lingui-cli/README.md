# lingui-cli

> lingui command line tools for manipulating message catalogues

## Install

```sh
npm install --save-dev lingui-cli
# or
yarn add --dev lingui-cli
```

## Usage

### `extract`

```sh
lingui extract [path...]
# e.g: lingui extract src/
```

This command extract messages from source and creates message catalog for each language in following steps:

1. Extract messages from all `*.jsx?` files inside `path`
2. Merge them with existing catalogues
3. Write  message catalogues

### `compile`

```sh
lingui compile
```

This command compiles message catalogues in `localeDir` and writes minified Javascript files. Each message is replace with function call, which returns parametrized message.

### `add-locale`

```sh
lingui add-locale [locales...]
# e.g: lingui add-locale en fr es
```

This command creates a new directory for each locale.
