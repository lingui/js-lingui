# babel-preset-lingui-js

> Babel preset for all Lingui plugins used in Javascript apps (for React apps see `babel-preset-lingui-react`).

## Install

```sh
npm install --save-dev babel-preset-lingui-js
# or
yarn add --dev babel-preset-lingui-js
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

```sh
babel script.js --presets lingui-js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  presets: ["lingui-js"]
});
```
