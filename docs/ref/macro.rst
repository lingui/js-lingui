*************************
@lingui/macro - Reference
*************************

``@lingui/macro`` package provides `babel macros <babel-plugin-macros>`_ which
transforms JavaScript objects into messages in ICU MessageFormat.

Overview
========

All JSX macros are transformed to :component:`Trans` component from
:doc:`@lingui/react <react>`. Other macros are transformed into message descriptors.

The advantages of using macros vs. low level API are:

   - generated message format is guaranteed to be syntactically valid
   - components and functions are type checked
   - additional validation of plural rules is performed during transformation
   - output of macros depends on target environemnt. Non essentials data are removed
     in production build.

+-------------------------------------------------------------+--------------------------------------------------------------------+
| JS Macro                                                    | Result                                                             |
+=============================================================+====================================================================+
| .. code-block:: js                                          | .. code-block:: js                                                 |
|                                                             |                                                                    |
|    t`Refresh inbox`                                         |    /*i18n*/{                                                       |
|                                                             |      id: "Refresh inbox"                                           |
|                                                             |    }                                                               |
|                                                             |                                                                    |
+-------------------------------------------------------------+--------------------------------------------------------------------+
| .. code-block:: js                                          | .. code-block:: js                                                 |
|                                                             |                                                                    |
|    t`Attachment ${name} saved`                              |    /*i18n*/{                                                       |
|                                                             |      id: "Attachment {name} saved",                                |
|                                                             |      values: { name }                                              |
|                                                             |    }                                                               |
|                                                             |                                                                    |
+-------------------------------------------------------------+--------------------------------------------------------------------+
| .. code-block:: js                                          | .. code-block:: js                                                 |
|                                                             |                                                                    |
|    plural({                                                 |    /*i18n*/{                                                       |
|      value: count,                                          |      id: "{count, plural, one {Message} other {Messages}}",        |
|      one: "Message",                                        |      values: { count }                                             |
|      other: "Messages"                                      |    }                                                               |
|    })                                                       |                                                                    |
|                                                             |                                                                    |
+-------------------------------------------------------------+--------------------------------------------------------------------+
| .. code-block:: js                                          | .. code-block:: js                                                 |
|                                                             |                                                                    |
|    t`Today is ${date(today)}`                               |    /*i18n*/{                                                       |
|                                                             |      id: "Today is {today, date}",                                 |
|                                                             |      values: { today }                                             |
|                                                             |    }                                                               |
|                                                             |                                                                    |
+-------------------------------------------------------------+--------------------------------------------------------------------+
| .. code-block:: js                                          | .. code-block:: js                                                 |
|                                                             |                                                                    |
|    describeMessage({                                        |    /*i18n*/{                                                       |
|       id: "msg.refresh",                                    |      id: "msg.refresh",                                            |
|       message: "Refresh inbox"                              |      message: "Refresh inbox"                                     |
|    })                                                       |    }                                                               |
|                                                             |                                                                    |
+-------------------------------------------------------------+--------------------------------------------------------------------+

Following examples are the same messages above but written using JSX macros. As above,
macros create a message in `MessageFormat syntax <message-format>`_, but this time
the result in :component:`Trans` component:

+-------------------------------------------------------------+--------------------------------------------------------------------+
| JSX Macro                                                   | Result                                                             |
+=============================================================+====================================================================+
| ``<Trans>Refresh inbox</Trans>``                            | ``<Trans id="Refresh inbox" />``                                   |
+-------------------------------------------------------------+--------------------------------------------------------------------+
| ``<Trans>Attachment {name} saved</Trans>``                  | ``<Trans id="Attachment {name} saved" />``                         |
+-------------------------------------------------------------+--------------------------------------------------------------------+
| ``<Plural value={count} one="Message" other="Messages" />`` | ``<Trans id="{count, plural, one {Message} other {Messages}}" />`` |
+-------------------------------------------------------------+--------------------------------------------------------------------+
| ``<Trans>Today is <DateFormat value={today} /></Trans>``    | ``<Trans id="Today is {today, date}" />``                          |
+-------------------------------------------------------------+--------------------------------------------------------------------+
| ``<Trans id="msg.refresh">Refresh inbox</Trans>``           | ``<Trans id="msg.refresh" message="Refresh inbox" />``            |
+-------------------------------------------------------------+--------------------------------------------------------------------+

Generated message is used as a message ID in catalog, but can be overriden by custom ID.

Installation
============

Babel macros require babel-plugin-macros_ to work. If you use a framework
(for example GatsbyJS, Create React App >2.0) you might already have macros enabled.
Otherwise install it as any other Babel plugin:

1. Install ``babel-plugin-macros`` and ``@lingui/macro`` as a development dependency::

      npm install --save-dev babel-plugin-macros @lingui/macro
      # yarn add --dev babel-plugin-macros @lingui/macro

2. Add ``macros`` to the top of plugins section in your Babel config.

   .. code-block:: json

      {
         "plugins": [
            "macros"
         ]
      }

Usage
=====

JS macros
---------

These macros can be used in any context (e.g. outside JSX) and are intended to work
in combination with `i18n._` method. All JS macros are transformed into a *Message Descriptor*
which is an object with message ID, default message and other parameters. `i18n._`
accepts message descriptors and performs translation and formatting:

.. code-block:: jsx

   type MessageDescriptor = {
      id: String,
      message?: String,
      values?: Object,
      formats?: Object,
      comment?: string
   }

``id`` is message ID and the only required parameter. ``id`` and ``message``
are extracted to message catalog. Only ``id``, ``values``, and ``formats``
are used at runtime, all other attributes are removed from production code
for size optimization.

.. note:: i18n comment

   In the examples below you might notice ``/*i18n*/`` comment in
   macro output. This comment tells the extract plugin that following
   object or string should be collected to message catalog.

t
^

.. jsmacro:: t

The most common macro for messages. It transforms tagged template literal into message
in ICU MessageFormat. It's allowed to use other i18n macros as variables.

.. code-block:: jsx

   import { setupI18n } from "@lingui/core"
   import { t } from "@lingui/macro"

   const i18n = setupI18n()

   // Static Message
   const static = i18n._(t`Static Message`)
   // ↓ ↓ ↓ ↓ ↓ ↓
   // const static = i18n._(/*i18n*/{
   //   id: 'Static',
   // })

   // My name is {name}
   const vars = i18n._(t`My name is ${name}`)

   // Macros can be nested, date is macro for date formatting
   const date = i18n._(t`Today is ${date(name)}`)

plural
^^^^^^

.. jsmacro:: plural

.. code-block:: jsx

   function plural(value: string | number, options: Object)

``plural`` macro is used for pluralization, e.g: messages which has different form
based on counter. It accepts an object with required key ``value`` which determines
the plural form. The only required plural form is a catch-all ``other``. Other forms
depends on source language you're using (e.g: English has ``one`` and ``other`` plural
forms).

.. code-block:: jsx

   import { setupI18n } from "@lingui/core"
   import { plural } from "@lingui/macro"

   const i18n = setupI18n()

   const msg = i18n._(plural(count, {
      one: "# Book",
      other: "# Books"
   }))

   // t macro isn't required for nested messages,
   // template strings are transformed automatically.
   const vars = i18n._(plural(count, {
      one: `${name} has # friend`,
      other: `${name} has # friends`
   }))

   // Example of pluralization using two counters
   const double = i18n._(plural(numBooks, {
      one: plural({
         value: numArticles,
         one: `1 book and 1 article`,
         other: `1 book and ${numArticles} articles`,
      }),
      other: plural(numArticles, {
         one: `${numBooks} books and 1 article`,
         other: `${numBooks} books and ${numArticles} articles`,
      }),
   }))

date
^^^^

.. jsmacro:: date

This macro marks variable as a date which is formatted using `Intl.DateTimeFormat`_.

First parameter is a value to be formatted.

Second argument (optional) specifies date format.

.. code-block:: jsx

   import { setupI18n } from "@lingui/core"
   import { t, date } from "@lingui/macro"

   const i18n = setupI18n()

   const today = new Date()
   const msg = i18n._(t`Today is ${date(today)}.`)

number
^^^^^^

.. jsmacro:: number

This macro marks variable as a number which is formatted using `Intl.NumberFormat`_.

First parameter is a value to be formatted.

Second argument (optional) specifies number format.

.. code-block:: jsx

   import { setupI18n } from "@lingui/core"
   import { t, number } from "@lingui/macro"

   const i18n = setupI18n()

   const msg = i18n._(t`There were ${number(10000)} people.`)
   const percent = i18n._(t`Interest rate is ${number(0.05, "percent")}.`)

defineMessage
^^^^^^^^^^^^^

.. jsmacro:: defineMessage

``defineMessage`` macro is a wrapper around macros above which allows you
to add comments for translators or override the message ID.

```js
type MessageDescriptor = {
  id?: string,
  message?: string,
  comment?: string
}

function defineMessage(message: MessageDescriptor)
```

Either ``id`` or ``message`` property is required.

``id`` is a message id. If it isn't set, the ``message`` is used instead.

``message`` is the default message. Any macro can be used here.

``comment`` is a comment for translators. It's extracted o message catalog and it gives
extra context for translators.

Examples:

``defineMessage`` macro is mostly used to add ``comment`` for translators or to override
the default message ID:

.. code-block:: jsx

   import { defineMessage } from "@lingui/macro"

   // add comment and override id
   const message = defineMessage({
      id: "Navigation / About",
      comment: "Link in navigation pointing to About page",
      message: "About us"
   })

   // ↓ ↓ ↓ ↓ ↓ ↓

   const message = /*i18n*/{
     id: 'Navigation / About',
     comment: "Link in navigation pointing to About page",
     message: "About us"
   }

.. code-block:: jsx

   import { defineMessage } from "@lingui/macro"

   // just add comment
   const message = defineMessage({
      comment: "Link in navigation pointing to About page",
      message: "About us"
   })

   // ↓ ↓ ↓ ↓ ↓ ↓

   const message = /*i18n*/{
     comment: "Link in navigation pointing to About page",
     id: "About us"
   }

Any macros used in ``message`` are expanded as if the macro
were used outside ``defineMessage``:

.. code-block:: jsx

   import { defineMessage, t } from "@lingui/macro"

   const name = "Joe"

   const message = defineMessage({
      comment: "Greetings on the welcome page",
      message: t`Welcome, ${name}!`
   })

   // ↓ ↓ ↓ ↓ ↓ ↓

   const message = /*i18n*/{
      comment: "Greetings on the welcome page",
      message: "Welcome, {name}",
      values: {
        name
      }
   }

.. note::

   In production build, the macro is replaced with an ``id`` string:

   .. code-block:: jsx

      import { defineMessage } from "@lingui/macro"

      const message = defineMessage({
         id: "Navigation / About",
         comment: "Link in navigation pointing to About page",
         message: "About us"
      })

      // process.env.NODE_ENV === "production"
      // ↓ ↓ ↓ ↓ ↓ ↓

      const message = "Navigation / About"

   ``message`` and ``comment`` are used only in message catalogs.

defineMessages
^^^^^^^^^^^^^^

.. jsmacro:: defineMessages

defineMessages macro is a helper function to define several messages at once.

.. code-block:: jsx

   function defineMessages(messages: {
      [key: string]: string | MessageDescriptor
   })

Object values passed to ``defineMessages`` can be either strings, for simple messages,
or message descriptors. In such case they're transformed in the same way as in
``defineMessage`` macro:

.. code-block:: jsx

   import { defineMessages } from "@lingui/macro"

   const messages = defineMessages({
      ok: "OK",
      about: {
         id: "Navigation / About",
         comment: "Link in navigation pointing to About page",
         message: "About us"
      }
   })

   // ↓ ↓ ↓ ↓ ↓ ↓
   const messages = {
      ok: /*i18n*/"OK",
      about: /*i18n*/{
         id: "Navigation / About",
         comment: "Link in navigation pointing to About page",
         message: "About us"
      }
   }

.. note::

   In production build, the all message descriptors are replaced with
   message id:

   .. code-block:: jsx

      import { defineMessages } from "@lingui/macro"

      const messages = defineMessages({
         ok: "OK",
         about: {
            id: "Navigation / About",
            comment: "Link in navigation pointing to About page",
            message: "About us"
         }
      })

      // process.env.NODE_ENV === "production"
      // ↓ ↓ ↓ ↓ ↓ ↓

      const messages = {
         ok: "OK",
         about: "Navigation / About",
      }

JSX Macros
----------

Common props
^^^^^^^^^^^^

All macros share following props:

id
~~

Each message in catalog is identified by **message ID**.

While all macros use generated message as the ID, it's possible to override it.
In such case, generated message is used as a default translation.

.. code-block:: jsx

   import { Trans } from "@lingui/macro"

   <Trans id="message.attachment_saved">Attachment {name} saved.</Trans>

   // ↓ ↓ ↓ ↓ ↓ ↓
   // <Trans id="message.attachment_saved" message="Attachment {name} saved." />

comment
~~~~~~~~~~~

Comment for translators to give them additional context about the message.
It's removed from production code.

render
~~~~~~

Custom component to render translation into. This prop is directly passed to
:component:`Trans` component from :doc:`@lingui/react <react>`. See
`rendering of translations <rendering-translations>`_ for more info.

Trans
^^^^^

.. jsxmacro:: Trans

   :prop string id: Custom message ID

:jsxmacro:`Trans` is the basic macro for static messages, messages with variables,
but also for messages with inline markup.

.. code-block:: jsx

   import { Trans } from "@lingui/macro"

   <Trans>Refresh inbox</Trans>;
   // ↓ ↓ ↓ ↓ ↓ ↓
   // <Trans id="Refresh inbox" />

   <Trans id="message.attachment_saved">Attachment {name} saved.</Trans>
   // ↓ ↓ ↓ ↓ ↓ ↓
   // <Trans id="message.attachment_saved" message="Attachment {name} saved." />

This macro is especially useful when message contains inline markup.

.. code-block:: jsx

   import { Trans } from "@lingui/macro"

   <Trans>Read the <a href="/docs">docs</a>.</Trans>;
   // ↓ ↓ ↓ ↓ ↓ ↓
   // <Trans id="Read the <0>docs</0>." components={{0: <a href="/docs" />}} />

Components and HTML tags are replaced with dummy indexed tags (``<0></0>``) which
has several advatanges:

- both custom React components and built-in HTML tags are supported
- change of component props doesn't break the translation
- the message is extracted as a whole sentence (this seems to be obvious, but most
  i18n libs simply split message into pieces by tags and translate them separately)

Plural
^^^^^^

.. jsxmacro:: Plural

   :prop number value: (required) Value is mapped to plural form below
   :prop string|Object format:  Number format passed as options to `Intl.NumberFormat`_
   :prop number offset: Offset of value when calculating plural forms
   :prop string zero: Form for empty ``value``
   :prop string one: *Singular* form
   :prop string two: *Dual* form
   :prop string few: *Paucal* form
   :prop string many: *Plural* form
   :prop string other: (required) general *plural* form
   :prop string _<number>: Exact match form, corresponds to ``=N`` rule

   MessageFormat: ``{arg, plural, ...forms}``

Props of :jsxmacro:`Plural` macro are transformed into :icu:`plural` format.

.. code-block:: jsx

   import { Plural } from "@lingui/macro"

   <Plural value={numBooks} one="Book" other="Books" />
   // ↓ ↓ ↓ ↓ ↓ ↓
   // <Trans id="{numBooks, plural, one {Book} other {Books}}" values={{ numBooks }} />

``#`` are formatted using :icu:`number` format. ``format`` prop is passed to this
formatter.

Exact matches in MessageFormat syntax are expressed as ``=int`` (e.g. ``=0``),
but in React this isn't a valid prop name. Therefore, exact matches are expressed as
``_int`` prop (e.g. ``_0``). This is commonly used in combination with
``offset`` prop. ``offset`` affects only plural forms, not exact matches.

.. code-block:: jsx

   import { Plural } from "@lingui/macro"

   const count = 42

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
   />

   // This is transformed to Trans component with ID:
   // {count, plural, _0    {Nobody arrived}
   //                 _1    {Only you arrived}
   //                 one   {You and # other guest arrived}
   //                 other {You and # other guests arrived}}

Select
^^^^^^

.. jsxmacro:: Select

   :prop number value: (required) Value determines which form is outputted
   :prop number other: (required) Default, catch-all form

   MessageFormat: ``{arg, select, ...forms}``

Props of :jsxmacro:`Select` macro are transformed into :icu:`select` format:

.. code-block:: jsx

   import { Select } from "@lingui/macro"

   // gender == "female"      -> Her book
   // gender == "male"        -> His book
   // gender == "unspecified" -> Their book
   <Select
       value={gender}
       male="His book"
       female="Her book"
       other="Their book"
   />

SelectOrdinal
^^^^^^^^^^^^^

.. jsxmacro:: SelectOrdinal

   :prop number value: (required) Value is mapped to plural form below
   :prop number offset: Offset of value for plural forms
   :prop string zero: Form for empty ``value``
   :prop string one: *Singular* form
   :prop string two: *Dual* form
   :prop string few: *Paucal* form
   :prop string many: *Plural* form
   :prop string other: (required) general *plural* form
   :prop string _<number>: Exact match form, correspond to ``=N`` rule. (e.g: ``_0``, ``_1``)
   :prop string|Object format:  Number format passed as options to `Intl.NumberFormat`_

   MessageFormat: ``{arg, selectordinal, ...forms}``

Props of :jsxmacro:`SelectOrdinal` macro are transformed into :icu:`selectOrdinal`
format:

.. code-block:: jsx

   import { SelectOrdinal } from "@lingui/macro"

   // count == 1 -> 1st
   // count == 2 -> 2nd
   // count == 3 -> 3rd
   // count == 4 -> 4th
   <SelectOrdinal
       value={count}
       one="1st"
       two="2nd"
       few="3rd"
       other="#th"
   />

DateFormat
^^^^^^^^^^

.. jsxmacro:: DateFormat

   :prop string|Date value: (required) date to be formatted
   :prop string|Object format: date format passed as options to `Intl.DateTimeFormat`_

:jsxmacro:`DateFormat` macro is transformed into :icu:`date` format.

.. code-block:: jsx

   // date as a string
   <DateFormat value="2018-07-23" />;

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

.. note::

   Standalone :jsxmacro:`DateFormat` is transformed to :component:`DateFormat`
   which is evaluated directly. It's never transformed to ``{value, date}`` message,
   because such message can't be translated.

NumberFormat
^^^^^^^^^^^^

.. jsxmacro:: NumberFormat

   :prop number value: (required) Number to be formatted
   :prop string|Object format: Number format passed as options to `Intl.NumberFormat`_

:jsxmacro:`NumberFormat` macro is transformed into :icu:`number` format.

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

.. _babel-plugin-macros: https://github.com/kentcdodds/babel-plugin-macros
.. _Intl.DateTimeFormat: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
.. _Intl.NumberFormat: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
