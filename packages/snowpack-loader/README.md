[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/snowpack-loader

> Snowpack plugin which compiles on the fly the .po files for auto-refreshing. In summary, `lingui compile` command isn't required when using this plugin

`@lingui/snowpack-loader` is part of [LinguiJS][linguijs]. See the [documentation][documentation] for all information, tutorials and examples.

## Installation

```sh
npm install --save-dev @lingui/snowpack-loader
# yarn add --dev @lingui/snowpack-loader
```

## Usage

### Via `snowpack.config.js` (Recommended)

**snowpack.config.js**

```js
module.exports = {
  plugins: [
    '@lingui/snowpack-loader',
  ],
}
```

## License

[MIT][license]

[license]: https://github.com/lingui/js-lingui/blob/main/LICENSE
[linguijs]: https://github.com/lingui/js-lingui
[documentation]: https://lingui.js.org/
[package]: https://www.npmjs.com/package/@lingui/snowpack-loader
[badge-downloads]: https://img.shields.io/npm/dw/@lingui/snowpack-loader.svg
[badge-version]: https://img.shields.io/npm/v/@lingui/snowpack-loader.svg
[badge-license]: https://img.shields.io/npm/l/@lingui/snowpack-loader.svg
