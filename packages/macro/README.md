[![License][Badge-License]][License]
[![Version][Badge-Version]][Package]
[![Downloads][Badge-Downloads]][Package]
[![Babel Macro][Badge-Macro]][LinguiJS]

# @lingui/macro

> [Babel Macros](https://github.com/kentcdodds/babel-plugin-macros) which 
transforms tagged template literals and JSX components to ICU MessageFormat.

`@lingui/macro` is part of [LinguiJS][LinguiJS]. See the [documentation][Documentation]
for all information, tutorials and examples.

## Installation

```sh
npm install --save-dev @lingui/macro
# yarn add --dev @lingui/macro
```

## Usage

See the [reference][Reference] documentation.

```jsx
import { setupI18n } from '@lingui/core'
import { t } from '@lingui/macro'

const i18n = setupI18n()

const message = i18n._(t`Hello, my name is ${name} and today is ${date(now)}`)

// line above is transformed using babel-plugin-macros to this
// const message = i18n._(/*i18n*/{ id: "Hello, my name is {name} and today is {now,date}", values: { name, now }})
```

## License

[MIT][License]

[License]: https://github.com/lingui/js-lingui/blob/master/LICENSE
[LinguiJS]: https://github.com/lingui/js-lingui
[Documentation]: https://lingui.js.org/
[Reference]: https://lingui.js.org/ref/macro/
[Package]: https://www.npmjs.com/package/@lingui/macro
[Badge-Downloads]: https://img.shields.io/npm/dw/@lingui/macro.svg
[Badge-Version]: https://img.shields.io/npm/v/@lingui/macro.svg 
[Badge-License]: https://img.shields.io/npm/l/@lingui/macro.svg
[Badge-Macro]: https://img.shields.io/badge/babel--macro-%F0%9F%8E%A3-f5da55.svg
