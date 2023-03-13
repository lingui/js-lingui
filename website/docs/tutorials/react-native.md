# Internationalization of React Native apps

In this tutorial, we'll learn how to add internationalization to an existing application in React Native. Before going further, please follow the [setup guide](tutorials/setup-react.md) for installation and setup instructions.

The React Native tutorial is similar to the one for [React](/docs/tutorials/react.md) but here we will cover parts that are relevant for React Native and hopefully answer all questions you may have.

:::tip Hint
If you're looking for a working solution, check out the [sources available here](https://github.com/vonovak/js-lingui-demo) and the [demo app on Expo](https://exp.host/@vonovak/js-lingui-demo).
:::

:::caution Note
This tutorial assumes you use Lingui >=4.0 and React Native >=0.70 or Expo 47, with the Hermes JavaScript Engine.

`@lingui/core` depends on several apis exposed by the [Intl object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl). Support of the Intl object can vary across React Native and OS versions.
If some Intl feature is not supported by your runtime, you can [polyfill it](https://formatjs.io/docs/polyfills).

See [here](https://github.com/facebook/hermes/issues/23) for details about Intl support in the Hermes engine.
:::

## Polyfilling Intl apis

React Native does not support all Intl features out of the box and we need to polyfill [`Intl.Locale`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale) using [`@formatjs/intl-locale`](https://formatjs.io/docs/polyfills/intl-locale/) and [`Intl.PluralRules`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules) using [`@formatjs/intl-pluralrules`](https://formatjs.io/docs/polyfills/intl-pluralrules).

Follow their installation instuctions and then import the polyfills at the top of your application entry file.


## Example component

We're going to translate the following app:

```jsx
import React from 'react';
import { StyleSheet, Text, View, Alert, SafeAreaView, Button } from 'react-native';

export default class App extends React.Component {
 render() {
   return (
     <Inbox
       username="John"
       markAsRead={this.showAlert}
       messages={[]}
     />
   );
 }

 showAlert = () => {
   Alert.alert('', 'Do you want to set all your messages as read?');
 };
}

const Inbox = ({ messages, markAsRead, username }) => {
 const messagesCount = messages.length;

 return (
   <SafeAreaView style={styles.container}>
     <View style={styles.container2}>
       <Text style={styles.heading}>Message Inbox</Text>

       <Text>
         See all unread messages or
       </Text>
       <Button onPress={markAsRead} title="mark messages as read" />

       <Text>
         {messagesCount === 1
           ? `There's {messagesCount} message in your inbox.`
           : `There are ${messagesCount} messages in your inbox.`}
       </Text>
     </View>

     <Text>{username}.</Text>
   </SafeAreaView>
 );
};
```

As you can see, it's a simple mailbox application with only one screen.

## Internationalization in React

Not surprisingly, this part isn't too different from the [React tutorial](/docs/tutorials/react.md).

First we need to wrap our app with [`I18nProvider`](/docs/ref/react.md#i18nprovider) and then we can use the [`Trans`](/docs/ref/macro.md#trans) macro to translate the screen heading:

```jsx
import { I18nProvider } from '@lingui/react'
import { Trans } from '@lingui/macro'
import { i18n } from "@lingui/core"
import { Text } from "react-native";

i18n.load('en', messages);
i18n.activate('en');

<I18nProvider i18n={i18n} defaultComponent={Text}>
 <YourRootComponent someProp="someValue" />
</I18nProvider>

// later on somewhere in the React element tree:
<Text style={styles.heading}><Trans>Message Inbox</Trans></Text>
```


:::tip Hint
We're importing the default `i18n` object from `@lingui/core`. The `i18n` object is covered in greater detail in the [JavaScript tutorial](/docs/tutorials/javascript.md).
:::

This was easy. Now, let's translate the `title` prop in the `<Button title="mark messages as read" />` element. In this case, `Button` expects to receive a `string`, so we cannot use the [`Trans`](/docs/ref/macro.md#trans) macro here!

The solution is to use the `t` macro together with the `i18n` object which we can obtain from the `useLingui` hook. We use the two like this to get a translated string:

```ts
const { i18n } = useLingui()
...
<Button title={t(i18n)`this will be translated and rerendered with locale updates`}/>
```

Under the hood, [`I18nProvider`](/docs/ref/react.md#i18nprovider) takes an instance of the `i18n` object and passes it to [`Trans`](/docs/ref/react.md#trans) components through React Context. `I18nProvider` will also update the Context value (which rerenders components using the provided Context) when locale or message catalogs are updated.

The [`Trans`](/docs/ref/react.md#trans) components use the `I18n` instance to get the translations from it. If we cannot use the [`Trans`](/docs/ref/react.md#trans) component, we can use the `useLingui` hook to get hold of the `i18n` instance ourselves and get the translations from there.

The interplay of `I18nProvider` and `useLingui` is shown in the following simplified example:

``` jsx
import { I18nProvider } from '@lingui/react'
import { t, Trans } from '@lingui/macro'
import { i18n } from "@lingui/core";

<I18nProvider i18n={i18n}>
  <YourRootComponent someProp="someValue" />
</I18nProvider>

const Inbox = (({ markAsRead }) => {
  const { i18n } = useLingui()
  return (
    <View>
      <View>
        <Text style={styles.heading}>
          <Trans>Message Inbox</Trans>
        </Text>
        <Trans>See all unread messages or</Trans>
        <Button onPress={markAsRead} title={t(i18n)`mark messages as read`}/>
    </View>
  );
});
```

:::caution Note
There are several ways to render translations: You may use the [`Trans`](/docs/ref/react.md#trans) component or the [`useLingui`](/docs/ref/react.md#withi18n) hook together with the `t` macro. When you change the active locale or load new messages, all the components that consume the Context provided by `I18nProvider` will re-render, making sure the UI shows the correct translations.
:::

## Internationalization outside of React

Until now, we have covered the [`Trans`](/docs/ref/react.md#trans) macro and the `useLingui` hook. Using them will make sure our components are always in sync with the currently active locale and message catalog.

However, often you'll need to show localized strings outside of React, for example when you want to show an Alert from some business logic code.

In that case you'll also need access to the `i18n` object, but you don't want to pass it around from some React component.
Lingui uses a default i18n object instance that you can import as follows:

```
import { i18n } from '@lingui/core';
```

This instance is the source of truth for the active locale and the `t` macro implicitly uses this instance, unless you pass custom instance like this `` t(i18n)`some message` ``.

What that means is that in non-react code you can just call `` t`this will be translated` `` which will render the translation for currently active locale.

## Changing the active locale

The last remaining piece of the puzzle is changing the active locale. The `i18n` object exposes two methods for that: [`i18n.load(catalogs)`](/docs/ref/core.md#i18n.load(catalogs)) and [`i18n.activate(locale)`](/docs/ref/core.md#i18n.activate). Call the two methods one after another and the [`I18nProvider`](/docs/ref/react.md#i18nprovider) will pick up the change and re-render the translations. It all becomes clear when you take a look at the [final code](https://github.com/vonovak/js-lingui-demo/blob/master/App.js).

## Rendering of translations

As described in the [reference](/docs/ref/react.md#rendering-translations), by default, translation components render translation as a text without a wrapping tag. In React Native though, all text must be wrapped in the `Text` component. This means we would need to use the [`Trans`](/docs/ref/react.md#trans) component like this:

```jsx
<Text><Trans>Message Inbox</Trans></Text>
```

You'll surely agree the `Text` component looks a little redundant. That's why the [`I18nProvider`](/docs/ref/react.md#i18nprovider) component accepts a `defaultComponent` prop. Just supply the `Text` component as the `defaultComponent` prop and the previous example can be simplified to:

```jsx
<Trans>Message Inbox</Trans>
```

Alternatively, you may override the default locally on the i18n components, using the `render` prop. This is also documented in the [reference](/docs/ref/react.md#rendering-translations).

## Nesting components

It is worth mentioning that the [`Trans`](/docs/ref/react.md#trans) macro and `Text` component may be nested, for example to achieve the effect shown in the picture. This is thanks to how React Native [handles nested text](https://facebook.github.io/react-native/docs/text#nested-text).

![image](/img/docs/rn-component-nesting.png)

This can be achieved by the following code:

```jsx
<Trans>
  <Text style={{ fontSize: 20 }}>
    <Text>Concert of </Text>
    <Text style={{ color: 'green' }}>Green Day</Text>
    <Text style={{ fontWeight: 'bold' }}> tonight!</Text>
  </Text>
</Trans>
```

The extracted string for translation will look like this:

`"<0><1>Concert of </1><2>Green Day</2><3> tonight!</3></0>"`

The important point here is that the sentence isn't broken into pieces but remains together - that will allow the translator to deliver a quality result.

## Styling the translations

There are several ways to style the text rendered with `Trans`:
// TODO
The first is to wrap `Trans` by Text

```tsx
<Text style={{ fontSize: 20 }}>
  <Trans>This is a big font</Trans>
</Text>
```

## Further reading

-   [`@lingui/react` reference documentation](/docs/ref/react.md)
-   [`@lingui/cli` reference documentation](/docs/ref/cli.md)
-   [Pluralization Guide](/docs/guides/plurals.md)
