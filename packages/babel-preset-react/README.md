[![License][Badge-License]][License]
[![Version][Badge-Version]][Package]
[![Downloads][Badge-Downloads]][Package]

# @lingui/babel-preset-react

> Babel preset for all Lingui plugins required in React apps (for vanilla JS apps see [@lingui/babel-preset-js](https://www.npmjs.com/package/@lingui/babel-preset-js)).

`@lingui/babel-preset-react` is part of [js-lingui][jsLingui]. See the [documentation][Documentation] for all information, tutorials and examples.

## Installation

```sh
npm install --save-dev @lingui/babel-preset-react
# yarn add --dev @lingui/babel-preset-react
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "presets": ["@lingui/babel-preset-react"]
}
```

### Via CLI

```bash
babel script.js --presets @lingui/babel-preset-react
```

### Via Node API

```js
require("@babel/core").transform("code", {
  presets: ["@lingui/babel-preset-react"]
});
```

## License

[MIT][License]

[License]: https://github.com/lingui/js-lingui/blob/master/LICENSE
[jsLingui]: https://github.com/lingui/js-lingui
[Documentation]: https://lingui.github.io/js-lingui/
[Package]: https://www.npmjs.com/package/@lingui/babel-preset-react
[Badge-Downloads]: https://img.shields.io/npm/dw/@lingui/babel-preset-react.svg
[Badge-Version]: https://img.shields.io/npm/v/@lingui/babel-preset-react.svg 
[Badge-License]: https://img.shields.io/npm/l/@lingui/babel-preset-react.svg
