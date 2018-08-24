************************
RFC - Message Definition
************************

Proposal for a new ``@lingui/core`` message API using Babel macros released in 3.0.

Background
==========

`jsLingui`_ aims to support these two common use cases:

1. messages which are also used as an ID
2. messages with custom IDs

In both cases we should be able to define lazy translations, which aren't evaluated
immediately.

New feature - Metadata
----------------------

Each message might contain additional medatata::

   type Metadata = string | Object

If ``Metadata`` is a string, it's a bascially message description. These two examples
are equivalent::

   t("help for translators")`Default message`

   t({ description: "help for translators" })`Default message`

Passing an object as ``Metadata`` allows developer to annotate message with additional
data::

   t({
      description: "help for translators",
      style: "informal"
   })`Default message`

Problem 1 - distinguish metadata and id
---------------------------------------

Until now, the first argument of `i18n.t` was a message ID::

   i18n.t("id")`Default message`

After adding an optional metadata, this use case would clash with metadata passed as
string::

   i18n.t("id or help text")`Default message`

Problem 2 - workflow with custom IDs
------------------------------------

In projects using custom message IDs, we define default message and help text just once
and then use an ID everywhere else::

   // Define
   i18n.t("message.id")`Default message with ${param}`

   // Use
   i18n._("message.id", { param })

Common workflow is define all messages in one place either globally or locally on the
top of the file and then use identifiers instead of strings::

   // Define
   const message = i18Mark("Default message with {param}")
   //                       ^- not possible to use macros here

   // Use
   i18n._(message, { param })

Solution
========

Messages used as IDs
--------------------

This use case is trivial as all we need to do is wrap a message in ``t`` template
tag::

   // Macro
   t`Default message`

   // Becomes
   i18n._("Defaut message")

With variables::

   // Macro
   t`Default message with ${param}`

   // Becomes
   i18n._("Defaut message with {param}", { param })

First (and only) argument passed to ``t`` macro will become message metadata::

   // Macro
   t("help text")`Default message`

   // In production, it becomes
   i18n._("Defaut message")

   // In development, it becomes
   i18n._("Defaut message", {}, { description: "help text" })

plurals and other formatters
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

If ``plural``, ``select`` or ``selectOrdinal`` formats are called with two arguments,
the first one is considered message metadata::

   // Macro
   plural("help text", { value, one: "# book", other: "# books" })

   // In production, it becomes
   i18n._("{value, plural, one {# book} other {# books}}")

   // In development, it becomes
   i18n._(
      "{value, plural, one {# book} other {# books}}", {}, { description: "help text" })

Lazy translations
~~~~~~~~~~~~~~~~~

Lazy translations are useful when we need to define a message, but translate it later.
This was previously achieved using ``i18Mark``, now it's be replaced with ``t.lazy``
macro::

   const msg = t.lazy`Default message`

   // It becomes
   const msg = () => i18n._("Default message")

   // The translation is returned by simply calling the message:
   const translation = msg()

   // It's possible to get the ID of message
   const id = msg.id

It also works for other formats: ``plural.lazy``, ``select.lazy`` and ``selectOrdinal.lazy``.

Multiple lazy translations can be defined using ``defineMessages``::

   const languages = defineMessages({
      en: `English`,
      cs: `Czech`,
      fr: `French`,
   }

Lazy translations are usually defined in different scope than evaluated. Parameters
are therefore unknown, but we still need to know the name of parameters, so we can
include it in ICU MessageSyntax. We can use ``arg`` macro for that::

   // Macro
   const books = plural.lazy({
      value: arg('count'),
      one: '# book',
      other: '# books'
   })

   const translation = books({ count: 42 })

The advantage is that function books is type-checked. Missing or extra parameters
are catched by type system.

This is very similar to ``define`` for projects using custom IDs described below.
The only difference is that ``t.lazy`` doesn't accept message ID as a first argument
and should be used only in projects using messages as IDs.

Messages with custom IDs
------------------------

In projects using custom IDs we use ``t.id`` macro::

   // macro
   t.id("id", "help text")`default message`

   // In production, it becomes
   i18n._("id")

   // In development, it becomes
   i18n._("id", {}, { defaults: "default message", description: "help text" })

Plurals and other formatters have ``.id`` variations as well::

   // Macro
   plural.id("id", "help text", { value, one: "# book", other: "# books" })

   // In production, it becomes
   i18n._("id", { value })

   // In development, it becomes
   i18n._(
      "id",
      { value },
      {
         defaults: "{value, plural, one {# book} other {# books}}",
         description: "help text"
      }
   )

Lazy translations
~~~~~~~~~~~~~~~~~

More interesting are lazy translations.

Definition
~~~~~~~~~~

Single messages is defined using macro ``define``::

   const msg = t.id.lazy("id")`Default message`

Group of messages is defined using macro ``defineMessages``::

   // Object key becomes message ID
   // Macro
   const messages = defineMessages({
      id: t("help text")`Default message`
   }

   // In production, it becomes
   const messages = {
      id: () => i18n._("id")
   }

   // In development, it becomes
   const messages = {
      id: () => i18n._("id", {}, { description: "help text", defaults: "Default message"})
   }

Using variables is similar as in previous section::

   const msg = t.id.lazy("id")`Message with ${arg('variable')}`

   const translation = msg({ variable: 42 })

   const plural = plural.id.lazy("id", {
      value: arg("variable"),
      one: "# book",
      other: "# books",
   }))

   const pluralTranslation = plural({ variable: 42 })


Usage
~~~~~

Defined messages are functions which takes variables used in message (if any)::

   const msg = t.id.lazy("id", "help text")`Default message`
   const translation = msg()

   const messages = defineMessages({
      id: t("help text")`Default message`
   }
   messages.id()

Summary
=======

The API solves following issues:

- `#197 <https://github.com/lingui/js-lingui/issues/197>`_ - Add metadata to messages
- `#258 <https://github.com/lingui/js-lingui/issues/197>`_ - i18Mark should accept default value

+-----------------------------+-------------------------+------------------------------+
| Macro ``t``                 | Translation             | Lazy Translation             |
+=============================+=========================+==============================+
| Message as ID               | t`Message`              | t.lazy`Message`              |
+-----------------------------+-------------------------+------------------------------+
| Message as ID with metadata | t(meta)`Message`        | t.lazy(meta)`Message`        |
+-----------------------------+-------------------------+------------------------------+
| Custom ID                   | t.id(id)`Message`       | t.id.lazy(id)`Message`       |
+-----------------------------+-------------------------+------------------------------+
| Custom ID with metadata     | t.id(id, meta)`Message` | t.id.lazy(id, meta)`Message` |
+-----------------------------+-------------------------+------------------------------+

Argument of ``plural`` are omitted. Macro ``select``, ``selectOrdinal`` are similar:

+-----------------------------+------------------------------+-----------------------------------+
| Macro ``plural``            | Translation                  | Lazy Translation                  |
+=============================+==============================+===================================+
| Message as ID               | plural({ ... })              | plural.lazy({ ... })              |
+-----------------------------+------------------------------+-----------------------------------+
| Message as ID with metadata | plural(meta, { ... })        | plural.lazy(meta, { ... })        |
+-----------------------------+------------------------------+-----------------------------------+
| Custom ID                   | plural.id(id, { ... })       | plural.id.lazy(id, { ... })       |
+-----------------------------+------------------------------+-----------------------------------+
| Custom ID with metadata     | plural.id(id, meta, { ... }) | plural.id.lazy(id, meta, { ... }) |
+-----------------------------+------------------------------+-----------------------------------+

``i18Mark`` will become obsolete in favor of ``.lazy`` macros.

Common catalogs
---------------

Feature request from #258, implemented using ``defineMessages``:

.. code-block:: jsx

   import { defineMessages } from `@lingui/js.macro`

   export default defineMessages({
      yes: "Yes",
      no: "No",
      cancel: "Cancel",
      confirmDelete: `Do you really want to delete ${arg("filename")}?`
   })

Catalogs are type-checked by default:

.. code-block:: jsx

   import common from './common'

   console.log(common.confirmDelete({ filename: "common.js" }))

   // These examples would throw type error:
   // common.confrmDelete()  // unknown attribute `confrmDelete` (typo)
   // common.confirmDelete()  // missing first argument
   // common.confirmDelete({ flname: "common.js" })  // invalid object type (typo)
