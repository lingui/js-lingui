[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/react

> React bindings for Lingui i18n: I18nProvider, Trans and useLingui, with compile-time macros and React Server Components support

`@lingui/react` is part of [Lingui][documentation]. Lingui is a lightweight, open-source internationalization (i18n) library for JavaScript and TypeScript. It brings compile-time macros and a CLI for message extraction to React, React Native, Vue, SolidJS, Astro, Svelte, and Node.js.

The package has three entry points:

- `@lingui/react` exports `I18nProvider`, the `Trans` component and the `useLingui` hook. The provider puts an `i18n` instance from `@lingui/core` into React context.
- `@lingui/react/macro` exports the `Trans`, `Plural`, `Select` and related macros, which generate the ICU message and its ID from JSX at build time, and a `useLingui` macro whose `t` translates strings outside JSX. Macros need the [Babel][babel-plugin] or [SWC][swc-plugin] plugin.
- `@lingui/react/server` exports `setI18n` for React Server Components, where `Trans` and `useLingui` read that instance instead of context. The same component renders on the server and on the client.

## Installation

```sh
npm install @lingui/core @lingui/react
```

`@lingui/core` provides the `i18n` instance passed to the provider. The [installation guide][installation] covers the macro plugin and the `lingui.config.js` file.

## Usage

```jsx
import { i18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"
import { Trans, useLingui } from "@lingui/react/macro"
import { messages } from "./locales/en/messages"

i18n.load("en", messages)
i18n.activate("en")

function Welcome({ name }) {
  const { t } = useLingui()
  return (
    <>
      <img src="/logo.svg" alt={t`Lingui logo`} />
      <Trans>
        Welcome back, {name}. Read the <a href="/docs">documentation</a>.
      </Trans>
    </>
  )
}

export function App() {
  return (
    <I18nProvider i18n={i18n}>
      <Welcome name="Fred" />
    </I18nProvider>
  )
}
```

The translator receives one message, `Welcome back, {name}. Read the <0>documentation</0>.`, where `<0>` stands for the link. `lingui extract` from [`@lingui/cli`][cli] writes the messages into the catalogs and `lingui compile` produces the `messages` module imported above.

Continue with the [React tutorial][tutorial], the [Next.js App Router tutorial][tutorial-rsc] for Server Components or the [React Native tutorial][tutorial-rn]. See the [React reference][reference] and the [macro reference][macro] for the full API.

## License

This package is licensed under the [MIT][license] license.

[license]: https://github.com/lingui/js-lingui/blob/main/LICENSE
[documentation]: https://lingui.dev
[installation]: https://lingui.dev/installation
[tutorial]: https://lingui.dev/tutorials/react
[tutorial-rsc]: https://lingui.dev/tutorials/react-rsc
[tutorial-rn]: https://lingui.dev/tutorials/react-native
[reference]: https://lingui.dev/ref/react
[macro]: https://lingui.dev/ref/macro#react-macros
[cli]: https://www.npmjs.com/package/@lingui/cli
[babel-plugin]: https://lingui.dev/installation#choosing-a-transpiler
[swc-plugin]: https://lingui.dev/ref/swc-plugin
[package]: https://www.npmjs.com/package/@lingui/react
[badge-downloads]: https://img.shields.io/npm/dw/@lingui/react.svg
[badge-version]: https://img.shields.io/npm/v/@lingui/react.svg
[badge-license]: https://img.shields.io/npm/l/@lingui/react.svg
