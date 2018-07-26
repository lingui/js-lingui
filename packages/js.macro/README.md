[![License][Badge-License]][License]
[![Version][Badge-Version]][Package]
[![Downloads][Badge-Downloads]][Package]

# js.macro

> [Babel Plugin Macros](https://github.com/kentcdodds/babel-plugin-macros) macro which 
transforms tagged template literals to ICU MessageFormat.

`js.macro` is part of [js-lingui][jsLingui]. See the [documentation][Documentation]
for all information, tutorials and examples.

## Installation

```sh
yarn add --dev @lingui/js.macro
# npm install --save-dev @lingui/js.macro
```

## Usage

```jsx
import { setupI18n } from '@lingui/core'
import { t } from '@lingui/js.macro'

// it's necessary to have `i18n` object in scope
const i18n = setupI18n()

// t is a macro
const message = t`Hello, my name is ${name} and today is ${date(now)}`

// line above is transformed using babel-plugin-macros to this
// const message = i18n._("Hello, my name is {name} and today is {now,date}", { name, now })
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
