.. _ref-react:

*************************************
API Reference - React (@lingui/react)
*************************************

Components from ``@lingui/react`` wrap the vanilla JS API from ``lingui-i18n``.
React components handle changes of active language or interpolated variables
better than low-level API and also take care of re-rendering when wrapped inside
pure components.

General Concepts
================

.. _rendering-translations:

Rendering of Translations
-------------------------

All i18n components render translation as a text without a wrapping tag. This can be
customized in three different ways:
   - globally: using ``defaultComponent`` prop on :component:`I18nProvider` component;
   - locally: using ``render`` prop or ``component`` on i18 components

Global Configuration
^^^^^^^^^^^^^^^^^^^^

Default rendering component can be set using ``defaultComponent`` prop in
:component:`I18nProvider`. The main use case for this is rendering translations
in ``<Text>`` component in React Native.

.. |ss| raw:: html

    <strike>

.. |se| raw:: html

    </strike>

|ss| It's possible to pass in either a string for built-in elements (`span`, `h1`) |se|,
React elements or React classes. This prop has the same type as ``render`` and ``component`` prop on
i18n components described below.

Local Configuration
^^^^^^^^^^^^^^^^^^^

============= ========================================  ============================
Prop name     Type                                         Description
============= ========================================  ============================
``className`` string                                       Class name to be added to ``<span>`` element
``render``    `Function(props) -> Element | Component`     Custom wrapper rendered as function
``component``  Component, ``null``                         Custom wrapper element to render translation
============= ========================================  ============================

``className`` is used only for built-in components (when `render` is string).

``Function(props)`` props returns the translation, an id, and a message.

When ``component`` is **React.Element** |ss| or **string** (built-in tags) |se|, it is
rendered with the ``translation`` passed in as its child:

.. code-block:: jsx

   import { Text } from "react-native";

   <Trans component={Text}>Link to docs</Trans>;
   // renders as <Text>Link to docs</Text>

To get more control over the rendering of translation, use instead the ``render`` method with 
**React.Component** (or stateless component). Component passed to
``render`` will receive the translation value as a ``translation`` prop:

.. code-block:: jsx

   // custom component
   <Trans render={({ translation }) => <Icon label={translation} />}>
      Sign in
   </Trans>;
   // renders as <Icon label="Sign in" />

``render`` or ``component`` also accepts ``null`` value to render
string without wrapping component. This can be used to override
custom ``defaultComponent`` config.

.. code-block:: jsx

   <Trans render={null}>Heading</Trans>;
   // renders as "Heading"

   <Trans component={null}>Heading</Trans>;
   // renders as "Heading"

Components
==========

Trans
-----

.. component:: Trans

   :prop id string: Message ID

.. important::

   Import :jsxmacro:`Trans` macro instead of :component:`Trans` if you use macros:

   .. code-block:: jsx

      import { Trans } from "@lingui/macro"

      // Trans from @lingui/react won't work in this case
      // import { Trans } from "@lingui/react"

      <Trans>Hello, my name is {name}</Trans>

It's also possible to use :component:`Trans` component directly without macros.
In that case, ``id`` is the message being translated. ``values`` and ``components``
are arguments and components used for formatting translation:

.. code-block:: jsx

   <Trans id="Hello World" />;

   <Trans
     id="Hello {name}"
     values={{ name: 'Arthur' }}
   />;

   // number of tag corresponds to index in `components` prop
   <Trans
     id="Read <0>Description</0> below."
     components={[<Link to="/docs" />]}
   />;

Providers
=========

Message catalogs and the active locale are passed to the context in
:component:`I18nProvider`. Use `:js:func:`useLingui` hook or :js:func:`withI18n`
high-order component to access Lingui context.

I18nProvider
------------

.. component:: I18nProvider

   :prop I18n i18n: The i18n instance (usually the one imported from ``@lingui/core``)
   :prop React.ReactNode children: React Children node
   :prop React.ComponentType defaultComponent: A React component for rendering <Trans> within this component (Not required)
   :prop boolean forceRenderOnLocaleChange: Force re-render when locale changes (default: true)


``defaultComponent`` has the same meaning as ``component`` in other i18n
components. :ref:`Rendering of translations <rendering-translations>` is explained
at the beginning of this document.

``forceRenderOnLocaleChange`` is true by default and it ensures that:

  - Children of ``I18nProvider`` aren't rendered before locales are loaded.
  - When locale changes, the whole element tree below ``I18nProvider`` is
    re-rendered.

Disable ``forceRenderOnLocaleChange`` when you have specific needs to handle
initial state before locales are loaded and when locale changes.

This component should live above all i18n components. A good place is as a
top-level application component. However, if the ``locale`` is stored in a
``redux`` store, this component should be inserted below ``react-redux/Provider``:

.. code-block:: jsx

   import React from 'react';
   import { I18nProvider } from '@lingui/react';
   import { i18n } from '@lingui/core';
   import { messages as MessagesEn } from './locales/en/messages.js';

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

useLingui
---------

.. js:function:: useLingui()

.. code-block:: jsx

   import React from "react"
   import { useLingui } from "@lingui/react"

   const CurrentLocale = () => {
      const { i18n } = useLingui()

      return <span>Current locale: {i18n.locale}
   }

withI18n
--------

.. js:function:: withI18n()

:js:func:`withI18n` is a higher-order component which injects ``i18n`` object to
wrapped component. ``i18n`` object is needed when you have to access the i18n data:

.. code-block:: jsx

   import React from "react"
   import { withI18n } from "@lingui/react"

   const CurrentLocale = withI18n()(({ i18n }) => (
      <span>Current locale: {i18n.locale}
   ))

.. _Intl.DateTimeFormat: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
.. _Intl.NumberFormat: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
