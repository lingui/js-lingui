[![License][Badge-License]][License]
[![Version][Badge-Version]][Package]
[![Downloads][Badge-Downloads]][Package]

# @lingui/macro

> [Babel Plugin Macros](https://github.com/kentcdodds/babel-plugin-macros) macro which 
transforms tagged template literals to ICU MessageFormat.

`@lingui/macro` is part of [js-lingui][jsLingui]. See the [documentation][Documentation]
for all information, tutorials and examples.

## Installation

```sh
npm install --save-dev @lingui/macro
# yarn add --dev @lingui/macro
```

## Usage

```jsx
import { setupI18n } from '@lingui/core'
import { t } from '@lingui/macro'

const i18n = setupI18n()

const message = i18n(t`Hello, my name is ${name} and today is ${date(now)}`)

// line above is transformed using babel-plugin-macros to this
// const message = i18n._(/*i18n*/{ id: "Hello, my name is {name} and today is {now,date}", values: { name, now }})
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
