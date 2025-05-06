---
title: React Native Internationalization (i18n)
description: Learn how to add internationalization to a React Native application using Lingui
---

# React Native Apps Internationalization

In this tutorial, we'll learn how to add internationalization to an existing application in React Native.

The React Native tutorial is similar to the one for [React](/tutorials/react) and we highly recommend you read that one first because it goes into greater detail on many topics. Here, we will only cover parts that are relevant for React Native.

:::tip Example
If you're looking for a working solution, check out the [React Native example](https://github.com/lingui/js-lingui/tree/main/examples/react-native). This example application shows a complete setup using Lingui and React Native.
:::

This tutorial assumes you use Lingui >= 5.0 and React Native >=0.76 or Expo >=52, with the Hermes JavaScript Engine.

`@lingui/core` depends on several APIs exposed by the [`Intl` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl). Support of the `Intl` object can vary across React Native and OS versions.
If some `Intl` feature is not supported by your runtime, you can [polyfill it](#polyfilling-intl-apis).

## Installing Lingui

1. Follow the [Installation and Setup](/installation?transpiler=babel) page for initial setup (for Babel).
2. Install the [`@lingui/core`](/ref/core) and [`@lingui/react`](/ref/react) packages.
3. Only for React Native >= 0.79.0: modify `resolveRequest` as shown in the example's [`metro.config.js`](https://github.com/lingui/js-lingui/blob/main/examples/react-native/metro.config.js), or set `unstable_enablePackageExports` metro config to `false`.
4. _(optional)_ Install and configure the [`@lingui/metro-transformer`](/ref/metro-transformer) package that enables Metro to compile `.po` files on the fly.

:::caution Warning
With the dependencies installed and set up, before running your app, please clear your Metro bundler cache with `npx expo start -c` or `npx react-native start --reset-cache` (if you do not use Expo).
:::

## Polyfilling Intl APIs

React Native's JS engine may not support all `Intl` features out of the box. As of 08/2024, we need to polyfill [`Intl.Locale`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale) using [`@formatjs/intl-locale`](https://formatjs.io/docs/polyfills/intl-locale/) and [`Intl.PluralRules`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules) using [`@formatjs/intl-pluralrules`](https://formatjs.io/docs/polyfills/intl-pluralrules). Please note that importing the `Intl` polyfills can significantly increase the amount of JS that needs to be `require`d by your app. At the same time, modern i18n libraries rely on its presence.

Follow the polyfill installation instructions before proceeding further. Import polyfills from `/polyfill-force` to avoid [slow initialization time on low-end devices](https://github.com/formatjs/formatjs/issues/4463).

## Example Component

We're going to translate the following contrived example:

```tsx
import React from "react";
import { StyleSheet, Text, View, Alert, SafeAreaView, Button } from "react-native";

export const AppRoot = () => {
  const [messages, setMessages] = useState<string[]>([]);

  const markAllAsRead = () => {
    Alert.alert("", "Do you want to set all your messages as read?", [
      {
        text: "OK",
        onPress: () => {
          setMessages([]);
        },
      },
    ]);
  };

  return (
    <Inbox
      markAsRead={markAllAsRead}
      messages={messages}
      addMessage={() => {
        setMessages((msgs) => msgs.concat([`message # ${msgs.length + 1}`]));
      }}
    />
  );
};

const Inbox = ({ messages, markAsRead }) => {
  const messagesCount = messages.length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container2}>
        <Text style={styles.heading}>Message Inbox</Text>

        <Button onPress={markAsRead} title="Mark all messages as read" />

        <Text>
          {messagesCount === 1
            ? `There's {messagesCount} message in your inbox.`
            : `There are ${messagesCount} messages in your inbox.`}
        </Text>
        {/* additional code for adding messages, etc.*/}
      </View>
    </SafeAreaView>
  );
};
```

As you can see, it's a simple mailbox application with only one screen.

## Internationalization in React (Native)

:::tip TL;DR
There are several ways to render translations: You may use the [`Trans`](/ref/react#trans) component or the [`useLingui`](/ref/react#uselingui) hook together with the [`t`](/ref/macro#t) or [`msg`](/ref/macro#definemessage) macros. When you change the active locale or load new messages, all components that consume the Lingui context provided by [`I18nProvider`](/ref/react#i18nprovider) will re-render, making sure the UI shows the correct translations.
:::

Not surprisingly, this part isn't too different from the [React tutorial](/tutorials/react).

First, we need to wrap our app with [`I18nProvider`](/ref/react#i18nprovider) and then we can use the [`Trans`](/ref/macro#trans) macro to translate the screen heading:

```tsx
import { I18nProvider, TransRenderProps } from "@lingui/react";
import { Trans } from "@lingui/react/macro";
import { i18n } from "@lingui/core";
import { Text } from "react-native";

i18n.loadAndActivate({ locale: "en", messages });

const DefaultComponent = (props: TransRenderProps) => {
  return <Text>{props.children}</Text>;
};

<I18nProvider i18n={i18n} defaultComponent={DefaultComponent}>
 <AppRoot />
</I18nProvider>

// later in the React element tree:
<Text style={styles.heading}><Trans>Message Inbox</Trans></Text>
```

:::tip Hint
We're importing the default `i18n` object from `@lingui/core`. Read more about the `i18n` object in the [reference](/ref/core).
:::

Translating the heading is done. Now, let's translate the `title` prop in the `<Button title="mark messages as read" />` element. In this case, `Button` expects to receive a `string`, so we cannot use the [`Trans`](/ref/macro#trans) macro here!

The solution is to use the `t` macro which we can obtain from the `useLingui` hook. We use it like this to get a translated string:

```tsx
import { useLingui } from '@lingui/react/macro';

const { t } = useLingui();
...
<Button title={t`this will be translated and rerendered with locale changes`}/>
```

Under the hood, [`I18nProvider`](/ref/react#i18nprovider) takes the instance of the `i18n` object and passes it to `Trans` components through React context. `I18nProvider` will update the context value (which then rerenders components that consume the provided context value) when locale or message catalogs are updated.

The `Trans` component uses the `i18n` instance to get the translations from it. If we cannot use `Trans`, we can use the `useLingui` hook to get hold of the `i18n` instance ourselves and get the translations from there.

The interplay of `I18nProvider` and `useLingui` is shown in the following simplified example:

```tsx
import { I18nProvider } from "@lingui/react";
import { Trans, useLingui } from "@lingui/react/macro";
import { i18n } from "@lingui/core";

<I18nProvider i18n={i18n}>
  <AppRoot />
</I18nProvider>;
//...
const Inbox = ({ markAsRead }) => {
  const { t } = useLingui();
  return (
    <View>
      <Text style={styles.heading}>
        <Trans>Message Inbox</Trans>
      </Text>
      <Button onPress={markAsRead} title={t`Mark messages as read`} />
    </View>
  );
};
```

## Internationalization Outside of React

Until now, we have covered the [`Trans`](/ref/react#trans) macro and the [`useLingui`](/ref/react#uselingui) hook. Using them will make sure our components are always in sync with the currently active locale and message catalog.

However, you may want to show localized strings outside of React, for example when you want to show an Alert from some business logic code.

In that case you'll also need access to the `i18n` object, but you don't need to pass it around from some React component.
By default, Lingui uses an `i18n` object instance that you can import as follows:

```ts
import { i18n } from "@lingui/core";
```

This instance is the source of truth for the active locale. For string constants that will be translated at runtime, use the [`msg`](/ref/macro#definemessage) macro as follows:

```ts
const deleteTitle = msg`Are you sure to delete this?`
...
const showDeleteConfirmation = () => {
  Alert.alert(i18n._(deleteTitle))
}
```

## Changing the Active Locale

The last remaining piece of the puzzle is changing the active locale. The `i18n` object exposes [`i18n.loadAndActivate()`](/ref/core#i18n.loadAndActivate) for that. Call the method and the [`I18nProvider`](/ref/react#i18nprovider) will re-render the translations. It all becomes clear when you take a look at the [final code](https://github.com/lingui/js-lingui/tree/main/examples/react-native/src/MainScreen.tsx#L29).

However, we don't recommend that you change the locale like this in mobile apps, as it can cause conflicts in how your app ui is localized. This is further [explained here](https://www.youtube.com/live/uLicTDG5hSs?feature=share&t=9088).

## Choosing the Default Locale

Lingui does not ship with functionality that would allow you to determine the best locale you should activate by default.

Instead, please refer to [Expo localization](https://docs.expo.dev/versions/latest/sdk/localization/#localizationgetlocales) or [react-native-localize](https://github.com/zoontek/react-native-localize#getlocales). Both packages will provide you with information about the locales that the user prefers. Combining that information with the locales that your app supports will give you the locale you should use by default.

## Rendering and Styling of Translations

As described in the [reference](/ref/react#rendering-translations), by default, translation components render translation as text without a wrapping tag. In React Native though, all text must be wrapped in the `Text` component. This means we would need to use the [`Trans`](/ref/macro#trans) component like this:

```tsx
<Text>
  <Trans>Message Inbox</Trans>
</Text>
```

You'll surely agree the `Text` component looks a little redundant. That's why the [`I18nProvider`](/ref/react#i18nprovider) component accepts a `defaultComponent` prop. Just supply the `Text` component as the `defaultComponent` prop and the previous example can be simplified to:

```tsx
<Trans>Message Inbox</Trans>
```

Alternatively, you may override the default locally on the i18n components, using the `render` or `component` props, as documented in the [reference](/ref/react#rendering-translations). Use them to apply styling to the rendered string.

## Nesting Components

The [`Trans`](/ref/macro#trans) macro and `Text` component may be nested, for example to achieve the effect shown in the picture. This is thanks to how React Native [handles nested text](https://facebook.github.io/react-native/docs/text#nested-text).

![image](/img/docs/rn-component-nesting.png)

This can be achieved by the following code:

```tsx
<Trans>
  <Text style={{ fontSize: 20 }}>
    <Text>Concert of </Text>
    <Text style={{ color: "green" }}>Green Day</Text>
    <Text style={{ fontWeight: "bold" }}> tonight!</Text>
  </Text>
</Trans>
```

The extracted string for translation will look like this:

`"<0><1>Concert of </1><2>Green Day</2><3> tonight!</3></0>"`

The important point here is that the sentence isn't broken into pieces but remains together - that will allow the translator to deliver a quality result.

## See Also

- [React i18n Tutorial](/tutorials/react)
- [Message Extraction Guide](/guides/message-extraction)
- [`@lingui/react` Reference](/ref/react)
- [Lingui CLI Reference](/ref/cli)
- [Localizing React Native apps talk from React Native EU 2022](https://www.youtube.com/live/uLicTDG5hSs?feature=share&t=7512)

---

This guide originally authored and contributed in full by [Vojtech Novak](https://twitter.com/vonovak).
