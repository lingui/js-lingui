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
     i18n._('Hello {name}, today is {today, date}', { name, today })

- Messages are validated and type-checked. Generated message is always syntactically
  valid. This is especially important for nested formatters:

  .. code-block:: jsx

     import { t, plural } from `@lingui/macro`

     const name = "Joe"
     const value = 42

     // With macro
     t`Hello ${name}, you have ${plural(value, {
       one: '# unread message',
       other: '# unread messages'
     })}`

     // Without macro
     i18n._(
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
     // i18n._('Hello {name}, today is {today, date}', { name, date } })

     // Lingui configration { messageFormat: 'fluent' }
     // ↓ ↓ ↓ ↓ ↓ ↓
     // i18n._('Hello { $name }, today is { DATETIME($today) }', { name, date } })

  .. warning::

     Fluent_ format isn't supported at the moment, nor the ``messageFormat``
     configuration. Both will be added in the future.

Message definitions
===================

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

   plural(value, {
      one: "# book",
      other: "# books"
   })

   select(value, {
      male: "he",
      female: "she",
      other: "they"
   })

It's possible to arbitrary nest formatters. ``t`` macro isn't required
for nested template literals:

.. code-block:: jsx

   import { t, plural } from '@lingui/macro'

   plural(value, {
      one: `${name} has # book`,
      other: `${name} has # books`
   })

Date and number formatters
--------------------------

Finally, ``date`` and ``number`` macros are also used as a functions.
First argument is value to be formatted, the second is optional format:

.. code-block:: jsx

   import { t, date, number } from `@lingui/macro`

   // default format
   t`Today is ${date(today)}`

   // custom format
   t`Interest rate is ${number(rate, 'percent')}`

Custom ID and comments for translators
--------------------------------------

All macros above can be wrapped inside ``defineMessage`` macro
to provide ``comment`` for translators or to override the message ``id``:

.. code-block:: jsx

   import { defineMessage } from '@lingui/macro'

   // Message is used as an ID
   defineMessage({
      message: "Default message",
      comment: "Comment for translators"
   })

   // Custom ID
   defineMessage({
      id: "msg.id",
      comment: "Comment for translators",
      message: "Default message"
   })

Extracting messages
===================

Messages are extracted from code already transformed by macros. This makes macros
completely optional and extraction will work also with message descriptors created
manually.

Extract script will look for  a ``i18n`` comments, which are automatically added by macros:

.. code-block:: js

   t`Message`

   // ↓ ↓ ↓ ↓ ↓ ↓
   /*i18n*/
   i18n._('Message')

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

   import { defineMessages, t, arg } from `@lingui/macro`

   export default defineMessages({
      yes: "Yes",
      no: "No",
      cancel: "Cancel",
      confirmDelete: t`Do you really want to delete ${arg("filename")}?`
   })

.. _Fluent: https://projectfluent.org/
