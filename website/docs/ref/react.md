# React API Reference

Components from `@lingui/react` wrap the vanilla JS API from `lingui-i18n`. React components handle changes of active language or interpolated variables better than low-level API and also take care of re-rendering when wrapped inside pure components.

## General Concepts

### Rendering of Translations {#rendering-translations}

All i18n components render translation as a text without a wrapping tag. This can be customized in three different ways:

-   globally: using `defaultComponent` prop on [`I18nProvider`](#i18nprovider) component;
-   locally: using `render` prop or `component` on i18 components

#### Global Configuration

Default rendering component can be set using `defaultComponent` prop in [`I18nProvider`](#i18nprovider). The main use case for this is rendering translations in `<Text>` component in React Native.

~~It's possible to pass in either a string for built-in elements (`span`, `h1`)~~, React elements or React classes. This prop has the same type as `render` and `component` prop on i18n components described below.

#### Local Configuration

| Prop name   | Type                                      | Description                                  |
|-------------| ----------------------------------------- | -------------------------------------------- |
| `className` | string                                    | Class name to be added to `<span>` element   |
| `render`    | *Function(props) -> Element \| Component* | Custom wrapper rendered as function          |
| `component` | Component, `null`                         | Custom wrapper element to render translation |

`className` is used only for built-in components (when *render* is string).

`Function(props)` props returns the translation, an id, and a message.

When `component` is **React.Element** ~~or **string** (built-in tags)~~, it is rendered with the `translation` passed in as its child:

``` jsx
import { Text } from "react-native";

<Trans component={Text}>Link to docs</Trans>;
// renders as <Text>Link to docs</Text>
```

To get more control over the rendering of translation, use instead the `render` method with **React.Component** (or stateless component). Component passed to `render` will receive the translation value as a `translation` prop:

``` jsx
// custom component
<Trans render={({ translation }) => <Icon label={translation} />}>
   Sign in
</Trans>;
// renders as <Icon label="Sign in" />
```

`render` or `component` also accepts `null` value to render string without wrapping component. This can be used to override custom `defaultComponent` config.

``` jsx
<Trans render={null}>Heading</Trans>;
// renders as "Heading"

<Trans component={null}>Heading</Trans>;
// renders as "Heading"
```

## Components

### Trans

| Prop name | Type     | Description         |
| --------- | -------- | ------------------- |
| `id`      | `string` | Key, the message ID |

:::important

Import [`Trans`](/docs/ref/macro.md#jsxmacro-Trans) macro instead of [`Trans`](#trans) if you use macros:

``` jsx
import { Trans } from "@lingui/macro"

// Trans from @lingui/react won't work in this case
// import { Trans } from "@lingui/react"

<Trans>Hello, my name is {name}</Trans>
```
:::

It's also possible to use `Trans` component directly without macros. In that case, `id` is the message being translated. `values` and `components` are arguments and components used for formatting translation:

``` jsx
<Trans id="Hello World" />;

<Trans
  id="Hello {name}"
  values={{ name: 'Arthur' }}
/>;

// number of tag corresponds to index in `components` prop
<Trans
  id="Read <link>Description</link> below."
  components={{ link: <a href="/docs" /> }}
/>
```

#### Plurals

If you cannot use [@lingui/macro](/docs/ref/macro.md) for some reason(maybe you compile your code using just TS instead of babel), you can render plurals using the plain Trans component like this:

``` jsx
import React from 'react';
import { Trans } from '@lingui/react';

<Trans
   id="{count, plural, =1 {car} other {cars}}"
   values={{ count: cars.length }}
></Trans>
```

## Providers

Message catalogs and the active locale are passed to the context in [`I18nProvider`](#i18nprovider). Use [`useLingui`](#uselingui) hook or [`withI18n`](#withi18n) high-order component to access Lingui context.

### I18nProvider

| Prop name                   | Type                  | Description                                                                   |
| --------------------------- | --------------------- | ----------------------------------------------------------------------------- |
| `I18n`                      | `i18n`                | The i18n instance (usually the one imported from `@lingui/core`)              |
| `children`                  | `React.ReactNode`     | React Children node                                                           |
| `defaultComponent`          | `React.ComponentType` | A React component for rendering <Trans\> within this component (Not required) |
| `forceRenderOnLocaleChange` | `boolean`             | Force re-render when locale changes (default: true)                           |

`defaultComponent` has the same meaning as `component` in other i18n components. [`Rendering of translations`](#rendering-translations) is explained at the beginning of this document.

``` jsx
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

`forceRenderOnLocaleChange` is true by default and it ensures that:

> -   Children of `I18nProvider` aren't rendered before locales are
>     loaded.
> -   When locale changes, the whole element tree below `I18nProvider`
>     is re-rendered.

Disable `forceRenderOnLocaleChange` when you have specific needs to handle initial state before locales are loaded and when locale changes.

This component should live above all i18n components. A good place is as a top-level application component. However, if the `locale` is stored in a `redux` store, this component should be inserted below `react-redux/Provider`:

``` jsx
import React from 'react';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { messages as messagesEn } from './locales/en/messages.js';

i18n.load({
   en: messagesEn,
});
i18n.activate('en');

const App = () => {
   return (
      <I18nProvider i18n={i18n}>
         // rest of the app
      </I18nProvider>
   );
}
```

### useLingui

``` jsx
import React from "react"
import { useLingui } from "@lingui/react"

const CurrentLocale = () => {
   const { i18n } = useLingui()

   return <span>Current locale: {i18n.locale}</span>
}
```

### withI18n

`withI18n` is a higher-order component which injects `i18n` object to wrapped component. `i18n` object is needed when you have to access the i18n data:

``` jsx
import React from "react"
import { withI18n } from "@lingui/react"

const CurrentLocale = withI18n()(({ i18n }) => (
   <span>Current locale: {i18n.locale}</span>
))
```
