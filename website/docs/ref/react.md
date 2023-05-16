# React API Reference

Components from `@lingui/react` wrap the vanilla JS API from `@lingui/core`. React components handle changes of active language or interpolated variables better than low-level API and also take care of re-rendering when locale or messages change.

## Rendering of Translations {#rendering-translations}

All i18n components render translation as text without a wrapping tag. This can be customized in two different ways:

-   globally: using `defaultComponent` prop on [`I18nProvider`](#i18nprovider) component
-   locally: using `render` prop or `component` on i18n components

### Global Configuration

Default rendering component can be set using `defaultComponent` prop in [`I18nProvider`](#i18nprovider). The main use case for this is rendering translations in `<Text>` component in React Native.

### Local Configuration

| Prop name   | Type                                      | Description                                    |
|-------------| ----------------------------------------- |------------------------------------------------|
| `className` | string                                    | Class name to be added to `<span>` element     |
| `render`    | Function(props) -> Element \| `null`   | Custom render callback to render translation        |
| `component` | Component \| `null`                         | Custom component to render translation |

`className` is used only for built-in components (when *render* is string).

When you use the `render` callback, it obtains an object of type `TransRenderProps` as an argument. If you use `component` prop, you will get the same object as props.

`TransRenderProps` contains

- `translation`: the translated message
- `children`: same as `translation` (for compatibility with React components that expect `children` prop)
- `id`: the message id
- `message`: the compiled message; you probably don't need this

```ts
type TransRenderProps = {
  id: string
  translation: React.ReactNode
  children: React.ReactNode
  message?: string | null
}
```

```jsx
import { Text } from "react-native";

<Trans component={Text}>Link to docs</Trans>;
// renders as <Text>Link to docs</Text>

<Trans render={({ translation }) => <Icon label={translation} />}>
   Sign in
</Trans>;
// renders as <Icon label="Sign in" />
```

`render` and `component` also accept `null` value to render string without a wrapping component. This can be used to override custom `defaultComponent` config.

```jsx
<Trans render={null}>Heading</Trans>;
// renders as "Heading"

<Trans component={null}>Heading</Trans>;
// renders as "Heading"
```

## Lingui Context

Message catalogs and the active locale are passed via context in [`I18nProvider`](#i18nprovider). Use the [`useLingui`](#uselingui) hook to access the Lingui context.

Lingui context object is exported from the package (`import { LinguiContext } from '@lingui/react'`). It is not expected that you would need it, but it enables advanced scenarios if the behavior of `I18nProvider` doesn't fit your needs.

### I18nProvider

`I18nProvider` provides Lingui context to all components in the subtree. It should be rendered as top-level component of your application.

`I18nProvider` renders its children only after a locale is activated. This ensures that the components consuming `i18n` have access to the translations.
Additionally, it subscribes to change events emitted by the `i18n` object and re-renders all components consuming the Lingui context when messages are updated or when a new locale is activated.

| Prop name          | Type                  | Description                                                               |
|--------------------|-----------------------|---------------------------------------------------------------------------|
| `i18n`             | `I18n`                | The i18n instance (usually the one imported from `@lingui/core`)          |
| `children`         | `React.ReactNode`     | React Children node                                                       |
| `defaultComponent` | `React.ComponentType` | A React component within which translation strings will be rendered (optional) |

`defaultComponent` has the same meaning as `component` in other i18n components. [`Rendering of translations`](#rendering-translations) is explained at the beginning of this document.

```jsx
import React from 'react';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { messages as messagesEn } from './locales/en/messages.js';

i18n.load({
   en: messagesEn,
});
i18n.activate('en');

const DefaultI18n = ({ isTranslated, children }) => (
   <span style={{ color: isTranslated ? undefined : 'red' }}>
      {children}
   </span>
)

const App = () => {
   return (
      <I18nProvider i18n={i18n} defaultComponent={DefaultI18n}>
         // rest of the app
      </I18nProvider>
   );
}
```

### useLingui

This hook allows access to the Lingui context. It returns an object with the same values that were passed to the `I18nProvider` component.

Components that use `useLingui` hook will re-render when locale and / or catalogs change, ensuring that the translations are always up-to-date.

```jsx
import React from "react"
import { useLingui } from "@lingui/react"

const CurrentLocale = () => {
   const { i18n } = useLingui()

   return <span>Current locale: {i18n.locale}</span>
}
```

## Components

The `@lingui/react` package provides `Trans` component to render translations. However, you're more likely to use [macros](/docs/ref/macro.md) instead because they are more convenient and easier to use.

This section is intended for reference purposes.

### Trans

| Prop name | Type     | Description         |
| --------- | -------- | ------------------- |
| `id`      | `string` | Key, the message ID |

:::important

Import [`Trans`](/docs/ref/macro.md#trans) macro instead of [`Trans`](#trans) component if you use macros:

```jsx
import { Trans } from "@lingui/macro"

// Trans from @lingui/react won't work in this case
// import { Trans } from "@lingui/react"

<Trans>Hello, my name is {name}</Trans>
```
:::

It's also possible to use `Trans` component directly without macros. In that case, `id` identifies the message being translated. `values` and `components` are arguments and components used for formatting translation:

```jsx
<Trans id="my.message" message="Hello World"/>

<Trans
  id="greeting"
  message="Hello {name}"
  values={{ name: 'Arthur' }}
/>

// number of tag corresponds to index in `components` prop
<Trans
  id="link"
  message="Read <link>Description</link> below."
  components={{ link: <a href="/docs" /> }}
/>
```

### Plurals

If you cannot use [@lingui/macro](/docs/ref/macro.md) for some reason, you can render plurals using the plain Trans component like this:

```jsx
import React from 'react';
import { Trans } from '@lingui/react';

<Trans
   id="my.plural.msg"
   message="{count, plural, =1 {car} other {cars}}"
   values={{ count: cars.length }}
/>
```
