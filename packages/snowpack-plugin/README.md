[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/snowpack-plugin

> Snowpack plugin which compiles on the fly the .po files for auto-refreshing. In summary, `lingui compile` command isn't required when using this plugin

`@lingui/snowpack-plugin` is part of [LinguiJS][linguijs]. See the [documentation][documentation] for all information, tutorials and examples.

## Installation

```sh
npm install --save-dev @lingui/snowpack-plugin
# yarn add --dev @lingui/snowpack-plugin
```

## Usage

### Via `snowpack.config.js` (Recommended)

**snowpack.config.js**

```js
module.exports = {
  plugins: [
    '@lingui/snowpack-plugin',
  ],
}
```

## License

[MIT][license]

[license]: https://github.com/lingui/js-lingui/blob/main/LICENSE
[linguijs]: https://github.com/lingui/js-lingui
[documentation]: https://lingui.dev
[package]: https://www.npmjs.com/package/@lingui/snowpack-plugin
[badge-downloads]: https://img.shields.io/npm/dw/@lingui/snowpack-plugin.svg
[badge-version]: https://img.shields.io/npm/v/@lingui/snowpack-plugin.svg
[badge-license]: https://img.shields.io/npm/l/@lingui/snowpack-plugin.svg
