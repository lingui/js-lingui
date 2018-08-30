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

Without options:

```json
{
  "plugins": ["@lingui/babel-plugin-transform-react"]
}
```

With options:

```json
{
  "plugins": [
    ["@lingui/babel-plugin-transform-react", {
      "importedNames": []
    }]
  ]
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

## Options

### `importedNames`

`array`, defaults to `[]`

This option transforms components without explicit imports. For example following options:

```json
{
  "plugins": [
    ["@lingui/babel-plugin-transform-react", {
      "importedNames": ["Trans"]
    }]
  ]
}
```

Transforms all `Trans` components without explicit import, which means this file:

```js
<Trans>Hello World</Trans>;
<Select value="this node is ignored" onChange={() => {}} />;
```

Will be transformed into:

```js
<Trans id="Hello World" />;
<Select value="this node is ignored" onChange={() => {}} />;
```

`Select` is left intact even though it's `@lingui/react` component, because it's
not included in `importedNames`.

Aliases are supported as well:

```json
{
  "plugins": [
    ["@lingui/babel-plugin-transform-react", {
      "importedNames": [
        ["Trans", "T"]
      ]
    }]
  ]
}
```

Again, `T` component in following file will be tranformed:

```js
<T>Hello World</T>;
<Select value="this node is ignored" onChange={() => {}} />;
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
