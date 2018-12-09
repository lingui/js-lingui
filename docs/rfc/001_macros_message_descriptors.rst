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

     import { t, date } from `@lingui/macro`

     const name = "Joe"
     const today = new Date()

     // With macro
     t`Hello ${name}, today is ${date(today)}`

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

     import { t, plural } from `@lingui/macro`

     const name = "Joe"
     const value = 42

     // With macro
     t`Hello ${name}, you have ${plural({
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

     import { t, date } from `@lingui/macro`

     const name = "Joe"
     const today = new Date()

     t`Hello ${name}, today is ${date(today)}`

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

``t``, ``plural``, ``select`` and ``selectOrdinal`` macros are alternatives
for ``Trans``, ``Plural``, ``Select`` and ``SelectOrdinal`` macros used in JSX.
The former can be used anywhere where string output is required, while
the latter are used in JSX context.

Tagged template literals
------------------------

``t`` macro itself is used as a template literal tag:

.. code-block:: jsx

   import { t } from `@lingui/macro`

   t`Hello ${name}`

Plural, select and selectOrdinal formatters
-------------------------------------------

``plural``, ``select``, ``selectOrdinal`` macros are used as functions.
All of them must be called with an object containing ``value`` key and corresponding
plural forms (``plural``, ``selectOrdinal``) or categories (``select``):

.. code-block:: jsx

   import { plural, select } from '@lingui/macro'

   plural({
      value,
      one: "# book",
      other: "# books"
   })

   select({
      value,
      male: "he",
      female: "she",
      other: "they"
   })

It's possible to arbitrary nest macros. ``t`` macro isn't required
for nested template literals:

.. code-block:: jsx

   import { plural } from '@lingui/macro'

   plural({
      value,
      one: `${name} has # book`,
      other: `${name} has # books`
   })

Date and number formatters
--------------------------

Finally, ``date`` and ``number`` macros are also used as a functions.
First argument is value to be formatted, the second is optional format:

.. code-block:: jsx

   import { date, number } from `@lingui/macro`

   // default format
   t`Today is ${date(today)}`

   // custom format
   t`Interest rate is ${number(rate, 'percent')}`

Custom ID and comments for translators
--------------------------------------

If ``t`` macro is used as a function, then it's called with a message descriptor.
It's possible to override message ID or add comments for translators by adding
``id`` or ``comment`` respectively to this object.

.. code-block:: jsx

   import { t } from '@lingui/macro'

   // Message is used as an ID
   t({
      message: `Default message`,
      comment: "Comment for translators"
   })

   // Custom ID
   t({
      id: "msg.id",
      message: `Default message`,
      comment: "Comment for translators"
   })

   // Custom ID, without default message
   t({
      id: "msg.id",
      comment: "Comment for translators"
   })

``plural`` and other formatters are already called with object as a first parameter.
``id`` and ``comment`` props can be added there:

.. code-block:: jsx

   import { plural } from '@lingui/macro'

   plural({
      id: "msg.plural",
      comment: "Comment for translators",

      value,
      one: "# book",
      other: "# books"
   })

``date`` and ``number`` don't accept ``id`` nor ``comment``.

Transformation
==============

Each macro is transformed into a message descriptor
wrapped into ``i18n._`` function:

.. code-block:: jsx

   import { t } from '@lingui/macro'

   t({
      id: "msg.id",
      message: `Default message`
      comment: "Comment for translators"
   })

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
This was previously achieved using ``i18Mark``. Now we can use `.lazy` variant of macros:

.. code-block:: jsx

   import { t } from `@lingui/macro`

   // define the message
   const msg = t.lazy`Default message`

   // translate it
   const translation = msg()

Lazy translations are usually defined in different scope than evaluated. Parameters
are therefore unknown, but we still need to know their names, so we can create placeholders
in MessageFormat. ``arg`` macro is used exactly for that:

.. code-block:: jsx

   import { plural, arg } from "@lingui/macro"

   const books = plural.lazy({
      value: arg('count'),
      one: '# book',
      other: '# books'
   })

   const translation = books({ count: 42 })

Summary
=======

The API solves following issues:

- `#197 <https://github.com/lingui/js-lingui/issues/197>`_ - Add metadata to messages
- `#258 <https://github.com/lingui/js-lingui/issues/197>`_ - i18Mark should accept default value

Common catalogs
---------------

Feature request from #258:

.. code-block:: jsx

   import { lazy, arg } from `@lingui/macro`

   export default {
      yes: lazy`Yes`,
      no: lazy`No`,
      cancel: lazy`Cancel`,
      confirmDelete: lazy`Do you really want to delete ${arg("filename")}?`
   }

.. _Fluent: https://projectfluent.org/
