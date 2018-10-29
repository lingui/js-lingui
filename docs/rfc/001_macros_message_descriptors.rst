*******************************
001 - Macros for JavaScript API
*******************************

Proposal for macros transforming template literals and function calls into message format.

Background
==========

Macros are used for generating messages in MessageFormat syntax. The advantages over
writing format by hand are following:

- API of macros is much simpler than API of core i18n method:

  .. code-block:: jsx

     import t from `@lingui/macro`

     const name = "Joe"
     const today = new Date()

     // With macro
     t`Hello ${name}, today is ${t.date(today)}`

     // Without macro
     i18n('Hello {name}, today is {today, date}', { name, date })

     // For the sake of completeness, macro is transformed into this code:
     // i18n({
     //   id: 'Hello {name}, today is {today, date}',
     //   values: { name, date }
     //  })

- Messages are validated and type-checked. Generated message is always syntactically
  valid. This is especially important for nested formatters:

  .. code-block:: jsx

     import t from `@lingui/macro`

     const name = "Joe"
     const value = 42

     // With macro
     t`Hello ${name}, you have ${t.plural({
       value,
       one: '# unread message',
       other: '# unread messages'
     })}`

     // Without macro
     i18n(
       'Hello {name}, you have {value, plural, one {# unread message} other {# unread messages}}',
       { name, date }
     )

- Using abstraction over message syntax allow easy replacement of message syntax.
  For example, without rewriting code it's possible to switch from ICU MessageFormat
  to Fluent_:

  .. code-block:: jsx

     import t from `@lingui/macro`

     const name = "Joe"
     const today = new Date()

     t`Hello ${name}, today is ${t.date(today)}`

     // Lingui configration { messageFormat: 'icu' }
     // ↓ ↓ ↓ ↓ ↓ ↓
     // i18n({
     //   id: 'Hello {name}, today is {today, date}',
     //   values: { name, date }
     //  })

     // Lingui configration { messageFormat: 'fluent' }
     // ↓ ↓ ↓ ↓ ↓ ↓
     // i18n({
     //   id: 'Hello { $name }, today is { DATETIME($today) }',
     //   values: { name, date }
     //  })

  .. warning::

     Fluent_ format isn't supported at the moment, nor the ``messageFormat``
     configuration. Both will be added in the future.

Message definitions
===================

``t`` macro is a single entry point to define all kinds of messages.

Tagged template literals
------------------------

``t`` macro itself is used as a template literal tag:

.. code-block:: jsx

   import t from `@lingui/macro`

   t`Hello ${name}`

Plural, select and selectOrdinal formatters
-------------------------------------------

``t.plural``, ``t.select``, ``t.selectOrdinal`` macros are used as functions.
All of them must be called with an object containing ``value`` key and corresponding
plural forms (``t.plural``, ``t.selectOrdinal``) or categories (``t.select``):

.. code-block:: jsx

   import t from '@lingui/macro'

   t.plural({
      value,
      one: "# book",
      other: "# books"
   })

   t.select({
      value,
      male: "he",
      female: "she",
      other: "they"
   })

It's possible to arbitrary nest formatters. ``t`` macro isn't required
for nested template literals:

.. code-block:: jsx

   import t from '@lingui/macro'

   t.plural({
      value,
      one: `${name} has # book`,
      other: `${name} has # books`
   })

Date and number formatters
--------------------------

Finally, ``t.date`` and ``t.number`` macros are also used as a functions.
First argument is value to be formatted, the second is optional format:

.. code-block:: jsx

   import t from `@lingui/macro`

   // default format
   t`Today is ${t.date(today)}`

   // custom format
   t`Interest rate is ${t.number(rate, 'percent')}`

Custom ID and comments for translators
--------------------------------------

If ``t`` macro is used as a function, then it's called with a message descriptor.
It's possible to override message ID or add comments for translators by adding
``id`` or ``comment`` respectively to this object.

.. code-block:: jsx

   import t from '@lingui/macro'

   // Message is used as an ID
   t({
      comment: "Comment for translators"
   })`Default message`

   // Custom ID
   t({
      id: "msg.id",
      comment: "Comment for translators"
   })`Default message`

``t.plural`` and other formatters are already called with object as a first parameter.
``id`` and ``comment`` props can be added there:

.. code-block:: jsx

   import t from '@lingui/macro'

   t.plural({
      id: "msg.plural",
      comment: "Comment for translators",

      value,
      one: "# book",
      other: "# books"
   })

``t.date`` and ``t.number`` don't accept ``id`` not ``comment``.

Transformation
==============

Each ``t`` macro variant is transformed into a message descriptor
wrapped into ``i18n._`` function:

.. code-block:: jsx

   import t from '@lingui/macro'

   t({
      id: "msg.id",
      comment: "Comment for translators"
   })`Default message`

   // ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓

   import i18n from '@lingui/core'

   i18n._({
      id: "msg.id",
      message: `Default message`,
      comment: "Comment for translators"
   })

Lazy translations
-----------------

Lazy translations are useful when we need to define a message, but translate it later.
This was previously achieved using ``i18Mark``. Now we can use the same macros.
Instead of importing the default import, import ``lazy`` instead:

.. code-block:: jsx

   // The API of `t` and `lazy` are the same.
   import { lazy as t } from `@lingui/macro`

   // define the message
   const msg = t`Default message`

   // translate it
   const msg = i18n._(msg)`

Lazy translations are usually defined in different scope than evaluated. Parameters
are therefore unknown, but we still need to know their names, so we can create placeholders
in MessageFormat. ``t.arg`` macro is used exactly for that:

.. code-block:: jsx

   // Macro
   const books = t.plural({
      value: t.arg('count'),
      one: '# book',
      other: '# books'
   })

Extracting messages
===================

Messages are extracted from code already transformed by macros. This makes macros
completely optional and extraction will work also with message descriptors created
manually.

Extract script will look for  a ``i18nMark`` function calls:

.. code-block:: js

   i18nMark({
     id: 'Message'
   })

An object after such comment is considered as message descriptor and extracted.

Summary
=======

The API solves following issues:

- `#197 <https://github.com/lingui/js-lingui/issues/197>`_ - Add metadata to messages
- `#258 <https://github.com/lingui/js-lingui/issues/197>`_ - i18Mark should accept default value

Common catalogs
---------------

Feature request from #258:

.. code-block:: jsx

   import { lazy as t } from `@lingui/macro`

   export default {
      yes: t`Yes`,
      no: t`No`,
      cancel: t`Cancel`,
      confirmDelete: t`Do you really want to delete ${t.arg("filename")}?`
   }

.. _Fluent: https://projectfluent.org/
