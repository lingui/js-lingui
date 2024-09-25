# Migration guide from 2.x to 3.x

:::caution Important
Check out the [@lingui/codemods](https://www.npmjs.com/package/@lingui/codemods) package for semi-automatic migration of your codebase.
:::

## Backward incompatible changes

Minimal required versions are:

- Node.js: 10.x
- React: 16.8
- Babel: 7

### `@lingui/react`

- `<I18n>` render-prop component was removed in favor of [`useLingui`](/docs/ref/react.md#uselingui) hook.
- In [`I18nProvider`](/docs/ref/react.md#i18nprovider), `defaultRender` prop was renamed to `defaultComponent`, and now only accepts Custom Components
- In [`Trans`](/docs/ref/react.md#trans), `defaults` prop was renamed to `message` and `description` to `comment`.
- In [`Trans`](/docs/ref/react.md#trans), `render` prop only accepts render-prop function which is used to render translation.
- In [`Trans`](/docs/ref/react.md#trans), new prop `component` accepts React component which is used to render translation.
- In [`Trans`](/docs/ref/react.md#trans), `components` is now an object, not an array. When using the low level API, it allows to name the component placeholders:

  ```jsx
  <Trans id="Read <a>the docs</a>!" components={{ a: <a href="/docs" /> }} />
  ```

- `NumberFormat` and `DateFormat` components were removed. Import `i18n` from `@lingui/core` package and use [`i18n.date()`](/docs/ref/core.md#i18n.date) and [`i18n.number()`](/docs/ref/core.md#i18n.number) instead.

#### Removed `I18nProvider` declarative API

LinguiJS started as a React library. After `@lingui/core` package was introduced, there were two ways how to switch active locales and manage catalogs in React: either using [`I18nProvider`](/docs/ref/react.md#i18nprovider) declarative API or using `setupI18n` imperative API.

In the same spirit as `@apollo/react` and `react-redux`, the [`I18nProvider`](/docs/ref/react.md#i18nprovider) is simplified and accepts `i18n` manager, which must be created manually:

```diff
  import { I18nProvider } from '@lingui/react'
  import { i18n } from "@lingui/core"
+ import { en } from 'make-plural/plurals'
  import { messages } from './locale/en/messages.js'

+ i18n.loadLocaleData('en', { plurals: en })
+ i18n.load('en', messages)
+ i18n.activate('en')

  function App() {
    return (
-     <I18nProvider locale="en" catalogs={{ en: catalogEn }}>
+     <I18nProvider i18n={i18n}>
         <App />
      </I18nProvider>
    )
  }
```

### `@lingui/core`

- Package now exports default `i18n` instance. It's recommended to use it unless you need customized instance.

  ```diff
  + import { i18n } from "@lingui/core"
  - import { setupI18n } from "@lingui/core"

  - const i18n = setupI18n()
    i18n.activate('en')
  ```

  :::caution Note
  If you decide to use custom `i18n` instance, you also need to set [`runtimeConfigModule`](/docs/ref/conf.md#runtimeconfigmodule). Macros automatically import `i18n` instance and must be aware of correct import path.
  :::

- `i18n.t`, `i18n.plural`, `i18n.select` and `i18n.selectOrdinal` methods were removed in favor of macros.

- `i18n.use` was removed. Using two locales at the same time isn't common use-case and can be solved in user land by having two instances of `i18n` object.

- Signature of [`i18n._`](/docs/ref/core.md#i18n._) method has changed. The third parameter now accepts default message in `message` prop, instead of `defaults`:

  ```diff
  - i18n._('Welcome / Greetings', { name: 'Joe' }, { defaults: "Hello {name}" })
  + i18n._('Welcome / Greetings', { name: 'Joe' }, { message: "Hello {name}" })
  ```

- [`i18n._`](/docs/ref/core.md#i18n._) also accepts a message descriptor as a first parameter:

  ```diff
  i18n._({
    id: string,
    message?: string,
    comment?: string
  })
  ```

#### [`i18n.load`](/docs/ref/core.md#i18n.load) loads a catalog for a single locale

`i18n` manager is the single source of truth and there's no need to keep all catalogs loaded outside this object. To make loading easier, [`i18n.load`](/docs/ref/core.md#i18n.load) now accepts catalog for a single locale or multiple catalogs at once.

```diff
  import { i18n } from "@lingui/core"
  import catalogEn from './locale/en/messages.js'

- i18n.load({ en: catalogEn })
+ i18n.load('en', catalogEn.messages)
```

:::caution Note
You can still use [`i18n.load`](/docs/ref/core.md#i18n.load) to load all catalogs at once:

```jsx
// i18n.js
import { i18n } from "@lingui/core";
import catalogEn from "./locale/en/messages.js";
import catalogFr from "./locale/fr/messages.js";

i18n.load({
  en: catalogEn.messages,
  fr: catalogFr.messages,
});
```

:::

### `@lingui/macro`

- [`plural`](/docs/ref/macro.mdx#plural), [`select`](/docs/ref/macro.mdx#select) and [`selectOrdinal`](/docs/ref/macro.mdx#selectordinal) accepts value as a first parameter:

  ```diff
  - plural({ value, one: "# book", other: "# books" })
  + plural(value, { one: "# book", other: "# books" })
  ```

### `@lingui/cli`

- command `lingui init` was removed
- command `lingui add-locale` was removed

### Whitespace

Whitespace handling in plugins had few bugs. By fixing them, there might be few backward incompatible changes. It's advised to run [`extract`](/docs/ref/cli.md#extract) and inspect changes in catalogs (if any).

1.  Spaces before `{variables}` in JSX aren't preserved. This is how React handles whitespaces in JSX. Leading whitespace is always removed:

    ```jsx
    <Trans>
      &quot;
      {variable}
      &quot;
    </Trans>

    // Becomes: &quot;{variable}&quot;
    ```

2.  Forced newlines are preserved. Sometimes it's useful to keep newlines in JSX. If that's your case, you need to force it in the same was as spaces are forced before variables or elements:

    ```jsx
    <Trans>
      1. Item{"\n"}
      2. Item
    </Trans>

    // Becomes: 1. Item\n2. Item
    ```

### Plugins/Presets

Plugins are replaced with macros. Presets are removed completely because they aren't needed anymore.

1.  Uninstall plugins/presets, remove them from Babel config and replace them with `macros`:

    ```bash npm2yarn
    npm uninstall @lingui/babel-preset-react
    npm install --dev @lingui/macro babel-plugin-macros
    ```

    ```diff
    {
       "presets": [
    -      "@lingui/babel-preset-react"
       ],
       "plugins": [
    +      "macros",
       ]
    }
    ```

2.  Import [`Trans`](/docs/ref/macro.mdx#trans), [`Plural`](/docs/ref/macro.mdx#plural-1), [`Select`](/docs/ref/macro.mdx#select-1) and [`SelectOrdinal`](/docs/ref/macro.mdx#selectordinal-1) from `@lingui/macro`:

    ```diff
    - import { Trans } from "@lingui/react"
    + import { Trans } from "@lingui/macro"
    ```

    :::caution Note
    If you used [`Trans`](/docs/ref/macro.mdx#trans) component without children, then keep the import from `@lingui/react`:

    ```jsx
    import { Trans } from "@lingui/react";

    const CustomID = () => <Trans id="msg.id" />;
    const DynamicID = () => <Trans id={msgId} />;
    ```

    :::

3.  `i18n.t`, `i18n.plural`, `i18n.select` and `i18n.selectOrdinal` methods are removed and replaced with macros.

    These macros automatically binds message to default `i18n` object:

    ```diff
      import { i18n } from "@lingui/core"
    + import { t } from "@lingui/macro"

    - i18n.t`Hello World`
    + t`Hello World`
    ```

## New features

### [`i18n.load`](/docs/ref/core.md#i18n.load)

[`i18n.load`](/docs/ref/core.md#i18n.load) can now accept one catalog for specific locale. Useful for incremental loading of catalogs.

```jsx
import { i18n } from "@lingui/core";

// Lingui v2 and v3
i18n.load({
  en: require("./locale/en/messages"),
  cs: require("./locale/cs/messages"),
});

// Lingui v3 only
i18n.load("en", require("./locale/en/messages"));
i18n.load("cs", require("./locale/cs/messages"));
```

### `i18n.on('change', callback)`

Event [`change`](/docs/ref/core.md#change) is fired anytime new catalogs are loaded or when locale is activated.

### Native TypeScript support

Lingui now supports TypeScript out of the box, don't forget to remove the `@types/lingui` packages from your project.
