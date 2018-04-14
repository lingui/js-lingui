[![License][Badge-License]][License]
[![Version][Badge-Version]][Package]
[![Downloads][Badge-Downloads]][Package]

# @lingui/babel-plugin-extract-messages

> Babel plugin which extracts messages for translation from source files

`@lingui/babel-plugin-extract-messages` is part of [js-lingui][jsLingui]. See the [documentation][Documentation] for all information, tutorials and examples.

## Installation

```bash
yarn add --dev @lingui/babel-plugin-extract-messages
# npm install --save-dev @lingui/babel-plugin-extract-messages
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["@lingui/babel-plugin-extract-messages"]
}
```

### Via CLI

```bash
babel --plugins @lingui/babel-plugin-extract-messages script.js
```

### Via Node API

```js
require("@babel/core").transform("code", {
  plugins: ["@lingui/babel-plugin-extract-messages"]
})
```

## License

[MIT][License]

[License]: https://github.com/lingui/js-lingui/blob/master/LICENSE
[jsLingui]: https://github.com/lingui/js-lingui
[Documentation]: https://lingui.github.io/js-lingui/
[Package]: https://www.npmjs.com/package/babel-plugin-lingui-extract-messages
[Badge-Downloads]: https://img.shields.io/npm/dw/babel-plugin-lingui-extract-messages.svg
[Badge-Version]: https://img.shields.io/npm/v/babel-plugin-lingui-extract-messages.svg 
[Badge-License]: https://img.shields.io/npm/l/babel-plugin-lingui-extract-messages.svg
