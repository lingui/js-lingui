[![License][Badge-License]][License]
[![Version][Badge-Version]][Package]
[![Downloads][Badge-Downloads]][Package]

# @lingui/babel-preset-js

> Babel preset for all Lingui plugins required in vanilla JS apps (for React apps see [@lingui/babel-preset-react](https://www.npmjs.com/package/@lingui/babel-preset-react)).

`@lingui/babel-preset-js` is part of [js-lingui][jsLingui]. See the [documentation][Documentation] for all information, tutorials and examples.

## Installation

```sh
npm install --save-dev @lingui/babel-preset-js
# yarn add --dev @lingui/babel-preset-js
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "presets": ["@lingui/babel-preset-js"]
}
```

### Via CLI

```bash
babel script.js --presets @lingui/babel-preset-js
```

### Via Node API

```js
require("@babel/core").transform("code", {
  presets: ["@lingui/babel-preset-js"]
});
```

## License

[MIT][License]

[License]: https://github.com/lingui/js-lingui/blob/master/LICENSE
[jsLingui]: https://github.com/lingui/js-lingui
[Documentation]: https://lingui.github.io/js-lingui/
[Package]: https://www.npmjs.com/package/@lingui/babel-preset-js
[Badge-Downloads]: https://img.shields.io/npm/dw/@lingui/babel-preset-js.svg
[Badge-Version]: https://img.shields.io/npm/v/@lingui/babel-preset-js.svg 
[Badge-License]: https://img.shields.io/npm/l/@lingui/babel-preset-js.svg
