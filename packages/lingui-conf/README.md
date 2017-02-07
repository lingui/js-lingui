lingui-conf
===========

> Get lingui configuration from package.json

**Internal package: You probably don't need this package. It's used by packages in [`js-lingui`](https://github.com/lingui/js-lingui/)**

Package finds nearest package.json starting from current directory, reads `lingui` configuration, provides defaults for all options and `<rootDir>` with current working directory.

## Usage

```js
const getConfig = require('lingui-conf')

const config = getConfig()
// When package.json is located in '/app/package.json'
// config.rootDir === '/app'
// config.localeDir === '/app/locale'
```

## Options

### `localeDir` [string]

Default: "<rootDir>/locale"

Directory with locales

### `srcPathDirs` [array\<string>]

Default: ["<rootDir>"]

A list of path to directories where application source files are located. Plugins and CLI looks for translations in these directories.

### `srcPathIgnorePatterns` [array\<string>]

Default: ["/node_modules/"]

An array of regexp pattern strings that are matched against all src paths. Plugins and CLI will ignore these paths.
