---
title: Lingui React API
description: Reference for the Lingui React API and components
---

# React API Reference

The Lingui React API, provided by the `@lingui/react` package, integrates Lingui's core JavaScript functionality directly into React, extending React components with the ability to dynamically manage localization.

This API provides React-specific components that automatically update the user interface when the active language or interpolated variables change, simplifying translation management and reactivity in the application.

## Installation

```bash npm2yarn
npm install --save @lingui/react
```

## Rendering of Translations {#rendering-translations}

All i18n components render translations as plain text by default, without a wrapping tag. You can customize this behavior in two ways:

- Globally: Set the `defaultComponent` prop on the [`I18nProvider`](#i18nprovider) component.
- Locally: Use the `render` or `component` props on individual i18n components.

### Global Configuration

You can set a default rendering component using the `defaultComponent` prop in [`I18nProvider`](#i18nprovider). This is especially useful in cases like React Native, where you may want translations to be rendered inside a `<Text>` component by default.

### Local Configuration

You can customize how translations are rendered locally within individual i18n components using the following props:

| Prop name   | Type                                 | Description                                                   |
| ----------- | ------------------------------------ | ------------------------------------------------------------- |
| `className` | string                               | Class name to be added to `<span>` element                    |
| `render`    | Function(props) -> Element \| `null` | Custom render callback to render translation                  |
| `component` | Component \| `null`                  | React component to wrap the translation                       |
| `comment`   | string                               | Comment picked up by extractor to provide translation context |

The `className` prop is applicable only to built-in components when the `render` prop is specified as a string.

When using the `render` callback, it accepts an object of type `TransRenderProps` as an argument:

```ts
type TransRenderProps = {
  id: string;
  translation: React.ReactNode;
  children: React.ReactNode;
  message?: string | null;
};
```

- `id` - The message ID.
- `translation` - The translated message.
- `children` - The same as `translation`, provided for compatibility with components that expect a `children` prop.
- `message` - The compiled message (generally not needed).

If you choose to use the `component` prop, the same object will be passed as a prop to your custom component. This allows you to access the necessary information for rendering translations directly within your component.

#### Important Notes

- You cannot use both `render` and `component` props simultaneously.
- Both `render` and `component` can be set to `null` to override the global `defaultComponent` and render a string without a wrapping component.
- The `component` supports nested elements with the `asChild` pattern.

#### Examples

Using a custom component:

```jsx
import { Text } from "react-native";

<Trans component={Text}>Link to docs</Trans>;
// renders as <Text>Link to docs</Text>
```

Using render prop for custom rendering logic:

```jsx
<Trans render={({ translation }) => <Icon label={translation} />}>Sign in</Trans>
// renders as <Icon label="Sign in" />
```

## Lingui Context

Message catalogs and the active locale are provided through the context in the [`I18nProvider`](#i18nprovider). You can access this context using the [`useLingui`](#uselingui) hook.

The `LinguiContext` object is exported from the `@lingui/react` package. While most users will not need to interact with it directly, it can be useful for advanced scenarios where the default behavior of `I18nProvider` doesn't meet your specific needs.

### `I18nProvider`

The `I18nProvider` provides Lingui context to all components in the subtree. It should be rendered as top-level component of your application.

It ensures that its children are only rendered after a locale has been activated, guaranteeing that any components relying on `i18n` have access to the translations. Additionally, the `I18nProvider` subscribes to change events emitted by the `i18n` object, automatically re-rendering all components that consume the Lingui context whenever messages are updated or a new locale is activated.

| Prop name          | Type                  | Description                                                                    |
| ------------------ | --------------------- | ------------------------------------------------------------------------------ |
| `i18n`             | `I18n`                | The `I18n` object instance (usually the one imported from `@lingui/core`)      |
| `children`         | `React.ReactNode`     | React Children node                                                            |
| `defaultComponent` | `React.ComponentType` | A React component within which translation strings will be rendered (optional) |

The `defaultComponent` serves the same purpose as the `component` prop in other i18n components. For a detailed explanation of how translations are rendered, see the [Rendering of Translations](#rendering-translations) section at the beginning of this document.

#### Examples

```jsx
import React from "react";
import { I18nProvider } from "@lingui/react";
import { i18n } from "@lingui/core";
import { messages as messagesEn } from "./locales/en/messages.js";

i18n.load({
  en: messagesEn,
});
i18n.activate("en");

const DefaultI18n = ({ children }) => <span>{children}</span>;

const App = () => {
  return (
    <I18nProvider i18n={i18n} defaultComponent={DefaultI18n}>
      // rest of the app
    </I18nProvider>
  );
};
```

### `useLingui`

The `useLingui` hook provides access to the Lingui context. It returns an object with the following properties:

| Key                | Type                  | Description                                                             |
| ------------------ | --------------------- | ----------------------------------------------------------------------- |
| `i18n`             | `I18n`                | The `I18n` object instance that you passed to `I18nProvider`            |
| `_`                | `I18n[_]`             | Reference to the [`i18n._`](/ref/core#i18n._) function, explained below |
| `defaultComponent` | `React.ComponentType` | The same `defaultComponent` you passed to `I18nProvider`, if provided   |

Components that use `useLingui` hook will re-render when locale and / or catalogs change. However, the reference to the `i18n` object is stable and doesn't change between re-renders. This can lead to unexpected behavior with memoization (see [memoization pitfall](/tutorials/react-patterns#memoization-pitfall)).

To alleviate the issue, `useLingui` provides the `_` function, which is the same as [`i18n._`](/ref/core#i18n._) but _its reference changes_ with each update of the Lingui context. Thanks to that, you can safely use this `_` function as a hook dependency:

```jsx
import React from "react";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";

const CurrentLocale = () => {
  const { _, i18n } = useLingui();

  return (
    <span>
      {_(msg`Current locale`)}: {i18n.locale}
    </span>
  );
};
```

:::tip
There is a [macro version](/docs/ref/macro.mdx#uselingui) of the `useLingui` hook which supports all features of the [`t` macro](/docs/ref/macro.mdx#t) and uses the runtime `useLingui` hook (from `@lingui/react`) under the hood:

```jsx
import { useLingui } from "@lingui/react/macro";

const CurrentLocale = () => {
  const { t } = useLingui();

  const userName = "Tim";
  return <span>{t`Hello ${userName}`}</span>;
};
```

You also can safely use the returned `t` function in a dependency array of React hooks.
:::

## Components

The `@lingui/react` package provides the `Trans` component for rendering translations in your application. It is a low-level component that allows you to render translations with dynamic values and components.

:::caution
While this component is available, you will likely find [Macros](/docs/ref/macro.mdx) to be more convenient and developer-friendly. Macros simplify the translation process and reduce boilerplate code.
:::

This section serves as a reference for those who prefer to use the components directly.

### `Trans`

| Prop name | Type     | Description                               |
| --------- | -------- | ----------------------------------------- |
| `id`      | `string` | Key, the message ID                       |
| `message` | `string` | Default message                           |
| `values`  | `object` | Variables to interpolate into the message |

The `values` and `components` props allow to pass dynamic values and components used for formatting the translation. In addition, the `comment` prop provides context to translators, helping them to understand the intent behind the message.

:::tip
Import the [`Trans`](/docs/ref/macro.mdx#trans) macro instead if you use macros. It will be transformed into the runtime `Trans` component automatically:

```jsx
import { Trans } from "@lingui/react/macro";
<Trans>Refresh inbox</Trans>;

// ↓ ↓ ↓ ↓ ↓ ↓

import { Trans } from "@lingui/react";
<Trans id="EsCV2T" message="Refresh inbox" />;
```

:::

It's also possible to use the `Trans` component directly without macros. In this case `id` identifies the message to be translated.

#### Examples

```jsx
import React from "react";
import { Trans } from "@lingui/react";

const MyComponent = () => {
  return (
    <div>
      {/* Simple translation without dynamic values */}
      <Trans id="my.message" message="Hello World" />

      {/* Translation with dynamic values */}
      <Trans id="greeting" message="Hello {name}" values={{ name: "Arthur" }} />

      {/* Translation with a comment for translators */}
      <Trans id="hello.world" message="Hello world" comment="A message that greets the user" />

      {/* Translation with a component for formatting */}
      <Trans
        id="link"
        message="Read <link>Description</link> below."
        components={{ link: <a href="/docs">Documentation</a> }}
      />
    </div>
  );
};
```

#### Plurals

If for some reason you cannot use [Macros](/docs/ref/macro.mdx), you can render plurals using the simple `Trans` component by passing the [ICU MessageFormat](/docs/guides/message-format.md) string as the `message` prop:

```jsx
import React from "react";
import { Trans } from "@lingui/react";

const CarCount = ({ cars }) => {
  return (
    <Trans
      id="application.pages.carsList"
      message="{count, plural, =1 {# car} other {# cars}}"
      values={{ count: cars.length }}
    />
  );
};
```
