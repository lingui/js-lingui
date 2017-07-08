[![License][Badge-License]][License]
[![Version][Badge-Version]][Package]
[![Downloads][Badge-Downloads]][Package]

# babel-preset-lingui-react

> Babel preset for all Lingui plugins required in React apps (for vanilla JS apps see [babel-preset-lingui-js](https://www.npmjs.com/package/babel-preset-lingui-react)).

`babel-preset-lingui-react` is part of [js-lingui][jsLingui]. See the [documentation][Documentation] for all information, tutorials and examples.

## Installation

```bash
yarn add --dev babel-preset-lingui-react
# npm install --save-dev babel-preset-lingui-react
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "presets": ["lingui-react"]
}
```

### Via CLI

```bash
babel script.js --presets lingui-react
```

### Via Node API

```js
require("babel-core").transform("code", {
  presets: ["lingui-react"]
});
```

## License

[MIT][License]

[License]: https://github.com/lingui/js-lingui/blob/master/LICENSE.md
[jsLingui]: https://github.com/lingui/js-lingui
[Documentation]: https://lingui.gitbooks.io/js/
[Package]: https://www.npmjs.com/package/babel-preset-lingui-react
[Badge-Downloads]: https://img.shields.io/npm/dw/babel-preset-lingui-react.svg
[Badge-Version]: https://img.shields.io/npm/v/babel-preset-lingui-react.svg 
[Badge-License]: https://img.shields.io/npm/l/babel-preset-lingui-react.svg
