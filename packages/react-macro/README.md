[![License][Badge-License]][License]
[![Version][Badge-Version]][Package]
[![Downloads][Badge-Downloads]][Package]

# react-macro

> [Babel Plugin Macros](https://github.com/kentcdodds/babel-plugin-macros) macro which transforms content of components from [lingui-react](https://www.npmjs.com/package/lingui-react) to ICU MessageFormat.

`react-macro` is part of [js-lingui][jsLingui]. See the [documentation][Documentation] for all information, tutorials and examples.

## Installation

```bash
yarn add --dev @lingui/react-macro
# npm install --save-dev @lingui/react-macro
```

## Usage

```js
import { Trans } from '@lingui/react-macro'

<Trans>Test!</Trans>
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
