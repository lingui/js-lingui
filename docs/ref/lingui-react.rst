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
customized in two different ways: globally: using ``defaultRender`` prop on
:component:`I18nProvider` component; or locally: using ``render`` prop on i18n
components.

Global Configuration
^^^^^^^^^^^^^^^^^^^^

Default rendering component can be set using ``defaultRender`` prop in
:component:`I18nProvider`. The main use case for this is rendering translations
in ``<Text>`` component in React Native.

It's possible to pass in either a string for built-in elements (`span`, `h1`),
React elements or React classes. This prop has the same type as ``render`` prop on
i18n components described below.

Local Configuration
^^^^^^^^^^^^^^^^^^^

============= ==================================== ============================
Prop name     Type                                 Description
============= ==================================== ============================
``className`` string                               Class name to be added to ``<span>`` element
``render``    Element, Component, string, ``null`` Custom wrapper element to render translation
============= ==================================== ============================

``className`` is used only for built-in components (when `render` is string).

When ``render`` is **React.Element** or **string** (built-in tags), it is
cloned with the ``translation`` passed in as its child:

.. code-block:: jsx

   // built-in tags
   <Trans render="h1">Heading</Trans>;
   // renders as <h1>Heading</h1>

   // custom elements
   <Trans render={<Link to="/docs" />}>Link to docs</Trans>;
   // renders as <Link to="/docs">Link to docs</Link>

Using **React.Component** (or stateless component) in ``render`` prop is useful
to get more control over the rendering of translation. Component passed to
``render`` will receive the translation value as a ``translation`` prop:

.. code-block:: jsx

   // custom component
   <Trans render={({ translation }) => <Icon label={translation} />}>
      Sign in
   </Trans>;
   // renders as <Icon label="Sign in" />

``render`` also accepts ``null`` value to render
string without wrapping component. This can be used to override
custom ``defaultRender`` config.

.. code-block:: jsx

   <Trans render={null}>Heading</Trans>;
   // renders as "Heading"

Components
==========

.. component:: Trans

   :prop id string?: Override auto-generated message ID

This is the main and most-used component for translation. It supports
variables and components inside messages. Usage of this component depends on
whether or not you're using jsLingui Babel plugins.

Each message is identified by **message ID**.
``babel-plugin-lingui-transform-react`` automatically generates message ID from
contents of :component:`Trans` component, but it's possible to provide custom
message ID by setting the `id` prop.

.. code-block:: jsx

   <Trans>Hello World</Trans>;

   // custom message ID
   <Trans id="msg.hello">Hello World</Trans>;

   // variable interpolation
   const name = "Fred";
   <Trans>My name is {name}</Trans>;

    // inline components
    <Trans>See the <Link to="/more">description</Link> below.</Trans>;

It's also possible to use :component:`Trans` component without babel plugin. In
fact, it's the only i18n component you'll need if you decide to go without the babel plugin.

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

   <Trans
     id="Today is {today, date, short_date}"
     values={{ today: new Date() }}
     formats={{
       short_date: {
         year: "numeric",
         month: "long",
         day: "numeric"
       }
     }}
   />;

.. component:: Plural

   :prop string id: Override auto-generated message ID
   :prop number offset: Offset of value for plural forms
   :prop string zero: Form for empty ``value``
   :prop string one: *Singular* form
   :prop string two: *Dual* form
   :prop string few: *Paucal* form
   :prop string many: *Plural* form
   :prop string other: (required) general *plural* form
   :prop string _<number>: Exact match form, correspond to ``=N`` rule

:component:`Plural` component handles pluralization of words or phrases.
Selected plural form depends on active language and ``value`` props.

This component represents ``plural`` formatter in Message Format:

.. code-block:: default

   {count, plural, one {# book} other {# books}}

Plural forms for all languages can be found at `CLDR Plural Rules`_
page.

.. warning::

   Not all languages use ``zero`` plural form! English, for example, uses
   ``other`` form when ``value == 0`` (e.g: 1 book, but 0 books).

As a developer, you only need to know plural rules for the language
used in source code. For example for English it's only ``one`` and ``other``:

.. code-block:: jsx

   const count = 42;
   // renders as '42 books'
   <Plural
       value={count}
       one="# book"
       other="# books"
   />;

``#`` character inside message is used as a placeholder for ``value``.

``other`` plural form is used when a specific plural form isn't defined.

It's also possible to use exact matches. This is commonly used in combination with
``offset`` prop. ``offset`` doesn't affect exact matches, only plural forms:

.. code-block:: jsx

   const count = 42;
   <Plural
       value={count}
       offset={1}
       // when value == 0
       _0="Nobody arrived"

       // when value == 1
       _1="Only you arrived"

       // when value == 2
       // value - offset = 1 -> `one` plural form
       one="You and # other guest arrived"

       // when value >= 3
       other="You and # other guests arrived"
   />;

.. component:: Select

   :prop number value: Override auto-generated message ID
   :prop number other: (required) Default, catch-all form

This component selects the form based on content of ``value`` prop. It
works like a ``switch`` statement. ``other`` prop is used when no prop
matches ``value``:

.. code-block:: jsx

   // gender == "female"      -> Her book
   // gender == "male"        -> His book
   // gender == "unspecified" -> Their book
   <Select
       value={gender}
       male="His book"
       female="Her book"
       other="Their book"
   />;

.. component:: SelectOrdinal

   :prop number value: Override auto-generated message ID
   :prop number offset: Offset of value for plural forms
   :prop string zero: Form for empty `value`
   :prop string one: *Singular* form
   :prop string two: *Dual* form
   :prop string few: *Paucal* form
   :prop string many: *Plural* form
   :prop string other: (required) general *plural* form
   :prop string _<number>: Exact match form, correspond to ``=N`` rule. (e.g: ``_0``, ``_1``)

   MessageFormat: ``{arg, selectordinal, ...forms}``

This component is equivalent to :component:`Plural`. The only difference is that
it uses **ordinal** plural forms, instead of **cardinal** ones.

.. code-block:: jsx

   // count == 1 -> 1st
   // count == 2 -> 2nd
   // count == 3 -> 3rd
   // count == 4 -> 4th
   <SelectOrdinal
       value={count}
       one="#st"
       two="#nd"
       few="#rd"
       other="#th"
   />;

.. component:: DateFormat

   :prop number value: Date to be formatted
   :prop string|Object format: Date format passed as options to `Intl.DateTimeFormat`_.

:component:`DateFormat` component is a wrapper around `Intl.DateTimeFormat`_.
It takes a date as a ``value`` prop and formats it
using ``format`` options. ``format`` prop supports the same options as
`Intl.DateTimeFormat`_:

.. code-block:: jsx

   const now = new Date();
   // default language format
   <DateFormat value={now} />;

   const now = new Date();
   // custom format
   <DateFormat value={now} format={{
       year: "numeric",
       month: "long",
       day: "numeric"
   }} />;

.. component:: NumberFormat

   :prop number value: Date to be formatted
   :prop string|Object format: Date format passed as options to `Intl.NumberFormat`_

:component:`NumberFormat` component is a wrapper around
`Intl.NumberFormat_. It takes a number as a ``value`` prop
and formats it using ``format`` options. ``format`` prop supports the same
options as `Intl.NumberFormat`_:

.. code-block:: jsx

   const num = 0.42;
   // default language format
   <NumberFormat value={num} />;

   const amount = 3.14;
   // custom format
   <NumberFormat value={amount} format={{
       style: 'currency',
       currency: 'EUR',
       minimumFractionDigits: 2
   }} />;

Providers
=========

Message catalogs and the active language are passed to the context in
:component:`I18nProvider`. However, context should never be accessed
directly. The :js:func:`withI18n` high-order component passes ``i18n`` prop
down to wrapped component and shadows all implementation details.

.. component:: I18nProvider

   :prop string language: Active language
   :prop object catalogs: Message catalogs
   :prop React.Element|React.Class|string defaultRender: Default element to render translation

``defaultRender`` has the same meaning as ``render`` in other i18n
components. :ref:`Rendering of translations <rendering-translations>` is explained
at the beginning of this document.

``catalogs`` is a type of ``Catalogs``:

.. code-block:: jsx

   // One catalog per language
   type Catalogs = {
     [language: string]: Catalog
   }

   // Catalog contains messages and language data (i.e: plurals)
   type Catalog = {
     messages: Messages,
     languageData?: {
       plurals: Function
     }
   }

   // Message is either function (compiled message) or string
   type Messages = {
     [messageId: string]: string | Function
   }

This component should live above all i18n components. A good place is as a
top-level application component. However, if the ``language`` is stored in a
``redux`` store, this component should be inserted below ``react-redux/Provider``:

.. code-block:: jsx

   import React from 'react';
   import { I18nProvider } from '@lingui/react';

   const App = ({ language} ) => {
        const catalog = require(`locales/${language}.js`);

        return (
            <I18nProvider language={language} catalogs={{ [language]: catalog }}>
               // rest of the app
            </I18nProvider>
        );
   }

.. js:function:: withI18n(options?)

   :param Object options: Configuration for high-order component
   :param bool update: Subscribe to catalog and activate language updates
   :param bool withHash: Pass unique ``i18nHash`` prop to force underlying PureComponent re-render on catalog and active language update
   :param bool withRef: Returns reference to wrapped instance in ``getWrappedInstance``

:js:func:`withI18n` is a higher-order component which injects ``i18n`` object to
wrapped component. ``i18n`` object is needed when you have to access plain JS
API for translation of JSX props:

.. code-block:: jsx

   import React from 'react';
   import { Trans, withI18n } from '@lingui/react';

   const LogoutIcon = withI18n()(
       ({ i18n }) => <Icon name="turn-off" aria-label={i18n.t`Log out`}/>
   );

.. js:function:: i18nMark(msgId: string)

Mark string as translated text, but don't translate it immediatelly.
This string is extracted to message catalog and can be used in
:component:`Trans` component:

.. code-block:: jsx

   const message = i18nMark('Source text');
   <Trans id={message} />;

   // This is the same as:
   <Trans id="Source text" />;

:js:func:`i18nMark` is useful for definition of translations outside
components:

.. code-block:: jsx

   const languages = {
     en: i18nMark('English'),
     fr: i18nMark('French')
   };

   Object.keys(languages).map(language =>
     <Trans key={language} id={languages[language]} />
   );

.. note::

   In development, :js:func:`i18nMark` is an identity function, returning ``msgId``.

   In production, :js:func:`i18nMark` call is replaced with ``msgId`` string.

.. _Intl.DateTimeFormat: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
.. _Intl.NumberFormat: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
