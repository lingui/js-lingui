[![License][Badge-License]][License]
[![Version][Badge-Version]][Package]
[![Downloads][Badge-Downloads]][Package]

# babel-plugin-lingui-extract-messages

> Babel plugin which extracts messages for translation from source files

`babel-plugin-lingui-extract-messages` is part of [js-lingui][jsLingui]. See the [documentation][Documentation] for all information, tutorials and examples.

## Installation

```bash
yarn add --dev babel-plugin-lingui-extract-messages
# npm install --save-dev babel-plugin-lingui-extract-messages
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["lingui-extract-messages"]
}
```

### Via CLI

```bash
babel --plugins lingui-extract-messages script.js
```

### Via Node API

```js
require("babel-core").transform("code", {
  plugins: ["lingui-extract-messages"]
})
```

## License

[MIT][License]

[License]: https://github.com/lingui/js-lingui/blob/master/LICENSE.md
[jsLingui]: https://github.com/lingui/js-lingui
[Documentation]: https://lingui.github.io/js-lingui/
[Package]: https://www.npmjs.com/package/babel-plugin-lingui-extract-messages
[Badge-Downloads]: https://img.shields.io/npm/dw/babel-plugin-lingui-extract-messages.svg
[Badge-Version]: https://img.shields.io/npm/v/babel-plugin-lingui-extract-messages.svg 
[Badge-License]: https://img.shields.io/npm/l/babel-plugin-lingui-extract-messages.svg
