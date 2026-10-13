[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/core

> The Lingui i18n runtime: loads compiled message catalogs, tracks the active locale and formats ICU MessageFormat messages

`@lingui/core` is part of [Lingui][documentation]. Lingui is a lightweight, open-source internationalization (i18n) library for JavaScript and TypeScript. It brings compile-time macros and a CLI for message extraction to React, React Native, Vue, SolidJS, Astro, Svelte, and Node.js.

The package is framework-agnostic and behaves the same in the browser, in Node.js and inside any UI framework. `@lingui/core` exports the `i18n` instance, which loads catalogs, activates a locale and translates messages. `@lingui/core/macro` exports the `t`, `plural`, `select` and related macros, which are compiled into ICU messages at build time and need the [Babel][babel-plugin] or [SWC][swc-plugin] plugin.

## Usage

```js
import { i18n } from "@lingui/core"
import { t } from "@lingui/core/macro"
import { messages } from "./locales/cs/messages"

i18n.load("cs", messages)
i18n.activate("cs")

function greeting(name) {
  return t`Hello ${name}`
}

greeting("Fred") // "Ahoj Fred"
```

The `messages` module is produced by `lingui extract` and `lingui compile` from [`@lingui/cli`][cli]. Catalogs are compiled ahead of time, so the runtime ships without a MessageFormat parser.

The [JavaScript tutorial][tutorial] walks through this setup. React projects use [`@lingui/react`][react] on top of this package. See the [core reference][reference] and the [macro reference][macro] for the full API.

## License

This package is licensed under the [MIT][license] license.

[license]: https://github.com/lingui/js-lingui/blob/main/LICENSE
[documentation]: https://lingui.dev
[tutorial]: https://lingui.dev/tutorials/javascript
[reference]: https://lingui.dev/ref/core
[macro]: https://lingui.dev/ref/macro
[cli]: https://www.npmjs.com/package/@lingui/cli
[react]: https://www.npmjs.com/package/@lingui/react
[babel-plugin]: https://lingui.dev/installation#choosing-a-transpiler
[swc-plugin]: https://lingui.dev/ref/swc-plugin
[package]: https://www.npmjs.com/package/@lingui/core
[badge-downloads]: https://img.shields.io/npm/dw/@lingui/core.svg
[badge-version]: https://img.shields.io/npm/v/@lingui/core.svg
[badge-license]: https://img.shields.io/npm/l/@lingui/core.svg
