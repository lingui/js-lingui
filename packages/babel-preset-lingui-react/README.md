# babel-preset-lingui-react

> Babel preset for all Lingui plugins used in React apps.

## Install

```sh
npm install --save-dev babel-preset-lingui-react
# or
yarn add --dev babel-preset-lingui-react
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

```sh
babel script.js --presets lingui-react
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  presets: ["lingui-react"]
});
```
