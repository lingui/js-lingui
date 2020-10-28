[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/conf

> Get lingui configuration from package.json

**⚠️ Internal package: You probably don't need this.**

`@lingui/conf` is part of [LinguiJS][linguijs]. See the [documentation][documentation] for all information, tutorials and examples.

Package finds nearest package.json starting from current directory, reads `lingui` configuration, provides defaults for all options and `<rootDir>` with current working directory.

## Usage

```js
const getConfig = require("@lingui/conf")

const config = getConfig()
// When package.json is located in '/app/package.json'
// config.rootDir === '/app'
// config.localeDir === '/app/locale'
```

See the [reference][reference] documenation of `lingui-cli` for all options.

## License

This package is licensed under [MIT][license] license.

[license]: https://github.com/lingui/js-lingui/blob/main/LICENSE
[linguijs]: https://github.com/lingui/js-lingui
[documentation]: https://lingui.js.org/
[reference]: https://lingui.js.org/ref/conf.html
[package]: https://www.npmjs.com/package/@lingui/conf
[badge-downloads]: https://img.shields.io/npm/dw/@lingui/conf.svg
[badge-version]: https://img.shields.io/npm/v/@lingui/conf.svg
[badge-license]: https://img.shields.io/npm/l/@lingui/conf.svg
