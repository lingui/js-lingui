[![License][Badge-License]][License]
[![Version][Badge-Version]][Package]
[![Downloads][Badge-Downloads]][Package]

# babel-plugin-lingui-transform-react

> Babel plugin which transforms content of components from [lingui-react](https://www.npmjs.com/package/lingui-react) to ICU MessageFormat.

`babel-plugin-lingui-transform-react` is part of [js-lingui][jsLingui]. See the [documentation][Documentation] for all information, tutorials and examples.

## Installation

```bash
yarn add --dev babel-plugin-lingui-transform-react
# npm install --save-dev babel-plugin-lingui-transform-react
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["lingui-transform-react"]
}
```

### Via CLI

```bash
babel --plugins lingui-transform-react script.js
```

### Via Node API

```js
require("babel-core").transform("code", {
  plugins: ["lingui-transform-react"]
})
```

## License

[MIT][License]

[License]: https://github.com/lingui/js-lingui/blob/master/LICENSE
[jsLingui]: https://github.com/lingui/js-lingui
[Documentation]: https://lingui.github.io/js-lingui/
[Package]: https://www.npmjs.com/package/babel-plugin-lingui-transform-react
[Badge-Downloads]: https://img.shields.io/npm/dw/babel-plugin-lingui-transform-react.svg
[Badge-Version]: https://img.shields.io/npm/v/babel-plugin-lingui-transform-react.svg 
[Badge-License]: https://img.shields.io/npm/l/babel-plugin-lingui-transform-react.svg
