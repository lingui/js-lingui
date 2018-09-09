[![License][Badge-License]][License]
[![Version][Badge-Version]][Package]
[![Downloads][Badge-Downloads]][Package]

# @lingui/babel-plugin-transform-react

> Babel plugin which transforms content of components from [lingui-react](https://www.npmjs.com/package/lingui-react) to ICU MessageFormat.

`@lingui/babel-plugin-transform-react` is part of [js-lingui][jsLingui]. See the [documentation][Documentation] for all information, tutorials and examples.

## Installation

```sh
npm install --save-dev @lingui/babel-plugin-transform-react
# yarn add --dev @lingui/babel-plugin-transform-react
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["@lingui/babel-plugin-transform-react"]
}
```

### Via CLI

```bash
babel --plugins @lingui/babel-plugin-transform-react script.js
```

### Via Node API

```js
require("@babel/core").transform("code", {
  plugins: ["@lingui/babel-plugin-transform-react"]
})
```

## License

[MIT][License]

[License]: https://github.com/lingui/js-lingui/blob/master/LICENSE
[jsLingui]: https://github.com/lingui/js-lingui
[Documentation]: https://lingui.github.io/js-lingui/
[Package]: https://www.npmjs.com/package/@lingui/babel-plugin-transform-react
[Badge-Downloads]: https://img.shields.io/npm/dw/@lingui/babel-plugin-transform-react.svg
[Badge-Version]: https://img.shields.io/npm/v/@lingui/babel-plugin-transform-react.svg 
[Badge-License]: https://img.shields.io/npm/l/@lingui/babel-plugin-transform-react.svg
