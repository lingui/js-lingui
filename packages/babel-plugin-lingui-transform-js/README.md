[![License][Badge-License]][License]
[![Version][Badge-Version]][Package]
[![Downloads][Badge-Downloads]][Package]

# babel-plugin-lingui-transform-js

> Babel plugin which transforms messages written using `lingui-i18n` functions to static ICU MessageFormat.

`babel-plugin-lingui-transform-js` is part of [js-lingui][jsLingui]. See the [documentation][Documentation] for all information, tutorials and examples.

## Installation

```bash
yarn add --dev babel-plugin-lingui-transform-js
# npm install --save-dev babel-plugin-lingui-transform-js
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["lingui-transform-js"]
}
```

### Via CLI

```sh
babel --plugins lingui-transform-js script.js
```

### Via Node API

```js
require("babel-core").transform("code", {
  plugins: ["lingui-transform-js"]
})
```

## License

[MIT][License]

[License]: https://github.com/lingui/js-lingui/blob/master/LICENSE.md
[jsLingui]: https://github.com/lingui/js-lingui
[Documentation]: https://lingui.gitbooks.io/js/
[Package]: https://www.npmjs.com/package/babel-plugin-lingui-transform-js
[Badge-Downloads]: https://img.shields.io/npm/dw/babel-plugin-lingui-transform-js.svg
[Badge-Version]: https://img.shields.io/npm/v/babel-plugin-lingui-transform-js.svg 
[Badge-License]: https://img.shields.io/npm/l/babel-plugin-lingui-transform-js.svg
