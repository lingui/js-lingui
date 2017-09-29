[![License][Badge-License]][License]
[![Version][Badge-Version]][Package]
[![Downloads][Badge-Downloads]][Package]

lingui-conf
===========

> Get lingui configuration from package.json

**⚠️ Internal package: You probably don't need this.**

`lingui-conf` is part of [js-lingui][jsLingui]. See the [documentation][Documentation] for all information, tutorials and examples.

Package finds nearest package.json starting from current directory, reads `lingui` configuration, provides defaults for all options and `<rootDir>` with current working directory.

## Usage

```js
const getConfig = require('lingui-conf')

const config = getConfig()
// When package.json is located in '/app/package.json'
// config.rootDir === '/app'
// config.localeDir === '/app/locale'
```

See the [reference][Reference] documenation of `lingui-cli` for all options.

## License

[MIT][License]

[License]: https://github.com/lingui/js-lingui/blob/master/LICENSE.md
[jsLingui]: https://github.com/lingui/js-lingui
[Documentation]: https://lingui.github.io/js-lingui/
[Reference]: https://lingui.github.io/js-lingui/ref/cli.html
[Package]: https://www.npmjs.com/package/lingui-conf
[Badge-Downloads]: https://img.shields.io/npm/dw/lingui-conf.svg
[Badge-Version]: https://img.shields.io/npm/v/lingui-conf.svg 
[Badge-License]: https://img.shields.io/npm/l/lingui-conf.svg
