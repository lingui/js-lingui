************************************
API Reference - React (lingui-react)
************************************

General concepts
================

Translation's rendering
-----------------------

All i18n components render translation inside `<span>` tag. This tag can be
customized using in two ways: globally using `defaultRender` prop on [I18nProvider](#i18nprovider)
component or locally using `render` prop on i18n components. Each component
also support `className` as a shortcut for the most basic usecases.

Global configuration
^^^^^^^^^^^^^^^^^^^^

Default rendering component can be set using `defaultRender` prop in [I18nProvider](#i18nprovider)
The main usecase is rendering translations in `Text` component in React Native.

It's possible to pass either string for built-in elements (`span`, `h1`),
React elements or React classes. This props has the type as `render` prop on
i18n components described below.

Local configuration
^^^^^^^^^^^^^^^^^^^

Prop name | Type | Description
--- | --- | --- |
`className` | string | Class name to be added to `<span>` element
`render` | React.Element, React.Class string | Custom wrapper element to render translation

`className` is ignored, when `render` is set.

When `render` is **React.Element** or **string** (built-in tags), it is cloned with `translation` as children:

.. code-block:: js

   // built-in tags
   <Trans render="h1">Heading</Trans>;
   // renders as <h1>Heading</h1>

   // custom elements
   <Trans render={<Link to="/docs" />}>Link to docs</Trans>;
   // renders as <Link to="/docs">Link to docs</Link>

Using React.Component (or stateless component) in `render` prop is useful to get more control over the rendering of translation. Component passed to `render` receive translation/value in `translation` prop.

.. code-block:: js

   // custom component
   <Trans render={
     ({ translation }) => <Icon label={translation} />
   }>
       Sign in
   </Trans>;

   // renders as <Icon label="Sign in" />

Components
==========

.. component:: Trans

   :prop id string?: Message ID (optional)

This is the main and most used component for translation. It supports
variables and components inside messages. Usage of this components depends on
whether you're using jsLingui babel plugins or not.

Each message is identified by **message ID**.
``babel-plugin-lingui-transform-react`` automatically generates message ID from
contents of :component:`Trans` component, but it's possible to provide custom
message ID by setting `id` prop.

.. code-block:: js

   <Trans>Hello World</Trans>;

   // custom message ID
   <Trans id="msg.hello">Hello World</Trans>;

   // variable interpolation
   const name = "Fred";
   <Trans>My name is {name}</Trans>;

    // inline components
    <Trans>See the <Link to="/more">description</Link> below.</Trans>;

It's also possible to use :component:`Trans` component without babel plugin. In
fact, it's the only i18n component you'll need if you decide to go without babel plugin.

.. code-block:: js

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
         year: "numberic",
         month: "long",
         day: "numeric"
       }
     }}
   />;

.. component:: Plural

   :example: {value, plural, one {Book} many {Books}}
   :prop string id: Override auto-generated message ID
   :prop number offset: Offsets plural forms but doesn't affect exact matches
   :prop string zero: Form for empty `value`
   :prop string one: *Singular* form
   :prop string two: *Dual* form
   :prop string few: *Paucal* form
   :prop string many: *Plural* form
   :prop string other: (required) general *plural* form
   :prop string _<number>: Exact match form, correspond to ``=N`` rule

See [Language Plural Rules](http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html) overview.

`value` prop is mapped to specific plural form based on active language.
If such plural form isn't defined, the ``other`` form is used. ``#`` character
inside message is used as a placeholder for ``value``:

.. code-block:: js

   const count = 42;
   // renders as '42 books'
   <Plural
       value={count}
       one="# book"
       other="# books"
   />;

It's also possible to use exact matches. This is common used in combination with `offset` prop. `offset` doesn't affect `value` for exact matches, only plural forms:

.. code-block:: js

   const count = 42;
   <Plural
       value={count}
       offset={1}
       // when value = 0
       _0="Nobody arrived"

       // when value = 1
       _1="Only you arrived"

       // when value = 2
       // value - offset = 1 -> `one` plural form
       one="You and # other guest"

       // when value >= 3
       other="You and # other guests"
   />;

.. component: Select

   :example: {value, select, male {He} female {She} other {They}}
   :prop number value: Override auto-generated message ID
   :prop number other: (required) Default, catch-all form

This component selects appropriate form based on content of `value`. It
behaves like an `switch` statement. `other` prop is used when no prop matches `value`:

.. code-block:: js

   // gender = "female"      -> `Her book`
   // gender = "male"        -> `His book`
   // gender = "unspecified" -> `Their book`
   <Select
       value={gender}
       male="His book"
       female="Her book"
       other="Their books"
   />;


.. component:: SelectOrdinal

   :example: {value, plural, one {Book} many {Books}}

   :prop number value: Override auto-generated message ID
   :prop number offset: Offsets plural forms but doesn't affect exact matches
   :prop string zero: Form for empty `value`
   :prop string one: *Singular* form
   :prop string two: *Dual* form
   :prop string few: *Paucal* form
   :prop string many: *Plural* form
   :prop string other: (required) general *plural* form
   :prop string _<number>: Exact match form, correspond to ``=N`` rule. (e.g: ``_0``, ``_1``)

   MessageFormat: ``{arg, selectordinal, ...forms}``

See [Language Plural Rules](http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html) overview.

This component is equivalent to [Plural](#plural). The only difference is that it uses **ordinal** plural forms, instead of **cardinal** ones.

.. code-block:: js

   <SelectOrdinal
       value={count}
       one="#st"
       two="#nd"
       few="#rd"
       other="#th"
   />;

.. component:: DateFormat

   :props value number: Date to be formatted
   :prop format string|Object: Date format passed as options to [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat)

   MessageFormat: `{arg, date, format}`

This component is a wrapper around [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat).

.. code-block:: js

   const now = new Date();
   // default language format
   <DateFormat value={now} />;

   const now = new Date();
   // custom format
   <DateFormat value={now} format={{
       year: "numberic",
       month: "long",
       day: "numeric"
   }} />;

.. component:: NumberFormat

      :props value number: Date to be formatted
      :prop format string|Object: Date format passed as options to [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat)

   MessageFormat: `{arg, number, format}`

This component is a wrapper around [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat).

.. code-block:: js

   const num = 0.42;
   // default language format
   <NumberFormat value={num} />;

   const amount = 3.14;
   // custom format
   <NumberFormat value={amount} format={{
       style: "currency",
       currency: 'EUR',
       minimumFractionDigits: 2
   }} />;

Providers
=========

Message catalogs and active language are passed to the context in
[I18nProvider](#i18nprovider). However, context should never be accessed
directly. [withI18n](#withi18n) hoc passes i18n prop to wrapped component
and shadows all implementation details:

.. component:: I18nProvider

   :prop language string: Active language
   :prop catalogs object: Message catalogs
   :prop defaultRender React.Element|React.Class|string: Default element to render translation

`defaultRender` has the same meaning as `render` in other i18n props.
[Rendering](#localconfiguration) is explained at the beginning of this document.

`catalogs` is a type of `Catalogs`:

.. code-block:: js

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

This component should live above all i18n components. The good place is top-level application component. However, if the `language` is stored in the `redux` store, this component should be inserted below `react-redux/Provider`.

.. code-block::

   import React from 'react';
   import { I18nProvider } from 'lingui-react';

   const App = ({ language} ) => {
        const catalog = await import(`locales/${language}.js`);

        return (
            <I18nProvider language={language} catalogs={{ [language]: catalog }}>
               // the rest of app
            </I18nProvider>,
        );
    }

.. js:function:: withI18n(options?)

   :param options Object: Configuration for high-order component
   :param withRef bool: Returns reference to wrapped instance in `getWrappedInstance`

:js:func:`withI18n` is high-order component which injects ``i18n`` object to
wrapped component. ``i18n`` object is needed when you have to access plain JS
API for translation of JSX props:

.. code-block:: js

   import React from 'react';
   import { Trans, withI18n } from 'lingui-react';

   const LogoutIcon = withI18n()(
       ({ i18n }) => <Icon name="turn-off" aria-label={i18n.t`Log out`}/>
   );


.. note::

   *Changed in lingui-react@1.1.0:*

   Previous version of this component, named `WithI18n` (upper-cased first letter),
   is deprecated and will be removed in ``lingui-react@2.0``

.. js:function:: i18nMark(msgId: string)

Mark string as translated text, but don't translate it immediatelly.
This string is extracted to message catalog and can be used in
:component:`Trans` component:

.. code-block:: js

   const message = i18nMark('Source text');
   <Trans id={message} />;

   // This is the same as:
   <Trans id="Source text" />;

:js:func:`i18nMark` is useful for definition of translations outside
components:

.. code-block:: js

   const languages = {
     en: i18nMark('English'),
     fr: i18nMark('French')
   };

   Object.keys(languages).map(language =>
     <Trans key={language} id={languages[language]} />
   );

.. note::

   In development, :js:func:`i18nMark` is identity function, returning ``msgId``.

   In production, :js:func:`i18nMark` call is replaced with ``msgId`` string.
