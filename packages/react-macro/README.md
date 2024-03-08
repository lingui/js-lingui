[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]
[![Babel Macro][badge-macro]][linguijs]

# @lingui/macro

> [Babel Macros](https://github.com/kentcdodds/babel-plugin-macros) which
> transforms tagged template literals and JSX components to ICU MessageFormat.

`@lingui/react-macro` is part of [LinguiJS][linguijs]. See the [documentation][documentation]
for all information, tutorials and examples.

## Installation

```sh
npm install @lingui/react-macro
# yarn add @lingui/react-macro
```

## Usage

See the [reference][reference] documentation.

```jsx
import { Trans } from "@lingui/react-macro"

function MyComponent() {
  return <Trans>Hello, my name is ${name}</Trans>
}
```

## License

[MIT][license]

[license]: https://github.com/lingui/js-lingui/blob/main/LICENSE
[linguijs]: https://github.com/lingui/js-lingui
[documentation]: https://lingui.dev
[reference]: https://lingui.dev/ref/macro/
[package]: https://www.npmjs.com/package/@lingui/react-macro
[badge-downloads]: https://img.shields.io/npm/dw/@lingui/react-macro.svg
[badge-version]: https://img.shields.io/npm/v/@lingui/react-macro.svg
[badge-license]: https://img.shields.io/npm/l/@lingui/react-macro.svg
[badge-macro]: https://img.shields.io/badge/babel--macro-%F0%9F%8E%A3-f5da55.svg
