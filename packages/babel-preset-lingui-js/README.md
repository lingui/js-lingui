[![License][Badge-License]][License]
[![Version][Badge-Version]][Package]
[![Downloads][Badge-Downloads]][Package]

# babel-preset-lingui-js

> Babel preset for all Lingui plugins required in vanilla JS apps (for React apps see [babel-preset-lingui-react](https://www.npmjs.com/package/babel-preset-lingui-js)).

`babel-preset-lingui-js` is part of [js-lingui][jsLingui]. See the [documentation][Documentation] for all information, tutorials and examples.

## Installation

```bash
yarn add --dev babel-preset-lingui-js
# npm install --save-dev babel-preset-lingui-js
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "presets": ["lingui-js"]
}
```

### Via CLI

```bash
babel script.js --presets lingui-js
```

### Via Node API

```js
require("babel-core").transform("code", {
  presets: ["lingui-js"]
});
```

## License

[MIT][License]

[License]: https://github.com/lingui/js-lingui/blob/master/LICENSE
[jsLingui]: https://github.com/lingui/js-lingui
[Documentation]: https://lingui.github.io/js-lingui/
[Package]: https://www.npmjs.com/package/babel-preset-lingui-js
[Badge-Downloads]: https://img.shields.io/npm/dw/babel-preset-lingui-js.svg
[Badge-Version]: https://img.shields.io/npm/v/babel-preset-lingui-js.svg 
[Badge-License]: https://img.shields.io/npm/l/babel-preset-lingui-js.svg
