****************************************************
Tutorial - Internationalization of React Native apps
****************************************************

In this tutorial, we'll learn how to add internationalization
to an existing application in React Native. The React Native tutorial is largely similar to the one for :ref:`React <react-tutorial-label>`, and we highly recommend you check out that tutorial first because it covers installation, setup and other topics. Here we will cover parts that are relevant for React Native and hopefully answer all questions you may have.

.. note::

  The latest version of ``@lingui/react`` working out-of-the-box for React Native on Android is 2.2. Newer versions depend on the `Intl object <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl>`_ which is not available on the JavaScriptCore that is used on Android by default. See the `JSC build scripts for Android <https://github.com/react-community/jsc-android-buildscripts>`_ for possible solution or use the `Intl polyfill <https://github.com/andyearnshaw/Intl.js/>`_. 

If you're looking for a working solution, check out the `demo on Expo <https://exp.host/@vonovak/js-lingui-demo>`_. The source code is `available here <https://github.com/vonovak/js-lingui-demo>`_.

Let's Start
===========

We're going to translate the following app:

.. code-block:: jsx

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
             : `There're ${messagesCount} messages in your inbox.`}
         </Text>
       </View>

       <Text>{username}.</Text>
     </SafeAreaView>
   );
  };


As you can see, it's a simple mailbox application with only one screen.

Introducing internationalization
================================

Not surprisingly, this part isn't too different from the :ref:`React tutorial <react-tutorial-label>`.

Let's use the :jsxmacro:`Trans` macro first. Don't forget that we need to wrap our root
component with the :component:`I18nProvider` so we can set the active language
and load catalogs:

Let's translate the screen heading:

.. code-block:: jsx

 import { I18nProvider } from '@lingui/react'
 import { Trans } from '@lingui/macro'

 <I18nProvider language="en">
   <YourRootComponent someProp="someValue" />
 </I18nProvider>

 // later on somewhere deep in the React component tree:
 <Text style={styles.heading}><Trans>Message Inbox</Trans></Text>


This was easy. Now, the next step is to translate the ``title`` prop of the
``<Button>`` component. But wait a sec, the button expects to receive a ``string``, so
we cannot use the :jsxmacro:`Trans` macro here! Also notice that the ``Alert.alert``
call requires a string as well.

Luckily, there is a simple solution: the :component:`I18n` is a render prop component
which gives us an ``i18n`` prop that we can use like this: ``i18n._(t`this will be translated`)``
and the result of such a call is a string. Let's see how to do this!

.. hint::

  The ``i18n`` object is covered in greater detail in the :ref:`JavaScript tutorial <js-tutorial-label>`.

Under the hood, :component:`I18nProvider` creates an instance of the ``i18n`` object
automatically and passes it to :component:`Trans` components through React Context.
The :component:`Trans` components then use the instance to get the translations from it.
If we cannot use the :component:`Trans` component, we can use the ``I18n`` render prop
component to get hold of the ``i18n`` object ourselves and get the translations from it.

So, we need to do two things: first, we need to setup the :component:`I18nProvider` and
then we can use the ``I18n`` render prop component, as shown in the following simplified
example:

.. code-block:: jsx

  import { I18nProvider } from '@lingui/react'
  import { t, Trans } from '@lingui/macro'

  <I18nProvider language="en">
    <YourRootComponent someProp="someValue" />
  </I18nProvider>

  const Inbox = (({ markAsRead }) => {
    return (
      <View>
        <View>
          <Text style={styles.heading}>
            <Trans>Message Inbox</Trans>
          </Text>
          <Trans>See all unread messages or</Trans>
          {/* you can also use the withI18n HOC */}
          <I18n>
            {({ i18n }) => (
              <Button onPress={markAsRead} title={i18n._(t`mark messages as read`)} />
            )}
          </I18n>
      </View>
    );
  });

  // later on somewhere deep in the React component tree:
  <Inbox markAsRead={this.showAlert} />

.. note::

   There are several ways to render translations: You may use the the :component:`Trans` component, the ``withI18n`` HOC or the :component:`I18n` component that provides a render prop. The important thing about all of these approaches is that when you change the active language (through the ``language`` prop passed to :component:`I18nProvider`), all the components that show translated text will re-render, making sure the UI shows the correct translations. All of these approaches are equivalent in their result.

Internationalization Outside of React Components
=================================================

Until now, we have covered the :jsxmacro:`Trans` macro and the :component:`I18n` render
prop component. Using them will make sure our components are always in sync with the
currently active language.

However, often you'll need to show localized strings outside of React, for example when
you want to show a toast from some business logic code. In that case you'll also need
access to the ``i18n`` object, but you don't want to pass it around from some component's
props. At this point, we need to turn our attention to the ``@lingui/core`` package,
namely the :js:func:`setupI18n` method which returns an ``i18n`` object.

.. code-block:: jsx

  import { setupI18n } from '@lingui/core';

  // this file is generated by the cli
  import enMessages from './locale/en/messages.js';

  // import this constant as get translations from it outside of React
  export const i18n = setupI18n({
   language: 'en',
   catalogs: {
     en: enMessages,
   },
  });

As explained before, :component:`I18nProvider` creates an instance of the ``i18n`` object
automatically and passes it to :component:`Trans` components through React Context.
Since we created the ``i18n`` instance by ourselves, we need to pass it to the
:component:`I18nProvider` as a prop. This way we tell it not to create a new instance
but use the one we provide, like this:

.. code-block:: jsx

  <I18nProvider i18n={i18n} language="en">
    <YourRootComponent someProp="someValue" />
  </I18nProvider>


Now we're ready to show correctly translated strings anywhere in our app! Just import
the ``i18n`` object into your non-react code and use it, for example like this:
``i18n._(t`this will be translated`)``.

The last remaining piece of the puzzle is changing the active language. The ``i18n``
object exposes two methods for that: ``i18n.load(catalogs)`` and ``i18n.activate(language)``.
Just call the two methods, pass the changed ``i18n`` object and the new active language
to the :component:`I18nProvider` and ``js-lingui`` takes care of the rest. It all becomes
clear when you take a look at the `final code <https://github.com/vonovak/js-lingui-demo/blob/master/App.js>`_.

Rendering of Translations
=========================

As described in the :ref:`reference <rendering-translations>`, by default, translation components render translation as a text without a wrapping tag. In React Native though, all text must be wrapped in the :component:`Text` component. This means we would need to use the :component:`Trans` component like this:

.. code-block:: jsx

  <Text><Trans>Message Inbox</Trans></Text>


You'll surely agree the :component:`Text` component looks a little redundant. That's why the :component:`I18nProvider` component accepts a ``defaultComponent`` prop. Just supply the :component:`Text` component as the ``defaultComponent`` prop and the previous example can be simplified to: 

.. code-block:: jsx

  <Trans>Message Inbox</Trans>

Alternatively, you may override the default locally on the i18n components, using the ``render`` prop. This is also documented in the :ref:`reference <rendering-translations>`.


Nesting Components
==================

It is worth mentioning that the :jsxmacro:`Trans` macro and :component:`Text` component
may be nested, for example to achieve the effect shown in the picture. This is thanks to
how React Native `handles nested text <https://facebook.github.io/react-native/docs/text#nested-text>`_.

.. image:: rn-component-nesting.png

This can be achieved by the following code:

.. code-block:: jsx

  <Trans>
    <Text style={{ fontSize: 20 }}>
      <Text>Concert of </Text>
      <Text style={{ color: 'green' }}>Green Day</Text>
      <Text style={{ fontWeight: 'bold' }}> tonight!</Text>
    </Text>
  </Trans>


The extracted string for translation will look like this:

``"<0><1>Concert of </1><2>Green Day</2><3> tonight!</3></0>"``


The important point here is that the sentence isn't broken into pieces but remains together - that will allow the translator to deliver a quality result.

Further reading
===============

- `@lingui/react reference documentation <../ref/react.html>`_
- `@lingui/cli reference documentation <../ref/cli.html>`_
- `Pluralization Guide <../guides/plurals.html>`_
