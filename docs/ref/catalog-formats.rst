***************
Catalog formats
***************

Catalog format (configured by :conf:`format` option) refers to file format of
offline catalog. This format is never used in production, because it's compiled
into JS module. The reason behind this build step is that choice of catalog
format depends on individual internationalization workflow. On the other hand
runtime catalog should be as simple as possible so it parsed quickly without
additional overhead.

PO File (recommended)
=====================

PO files are translation files used by gettext_ internationalization system.
This format is recommended and in LinguiJS v3 it'll be the default catalog format.

The advantages of this format are:

- readable even for large messages
- supports comments for translators
- supports metadata (origin, flags)
- standard format supported by many localization tools

.. code-block:: po

   #: src/App.js:3
   #  Comment for translators
   msgid "messageId"
   msgstr "Translated Message"

   #: src/App.js:3
   #, obsolete
   msgid "obsoleteId"
   msgstr "Obsolete Message"

.. _gettext: https://www.gnu.org/software/gettext/manual/html_node/PO-Files.html

JSON
====

Simple JSON file where each key is message ID and value is translation. The JSON
is flat and there's no reason to use nested keys. The usual motivation behind nested
JSON is to save filespace, but this file format is used offline only.

The drawback of this format is that all metadata about message are lost. That includes
default message, origin of message and any message flags (obsolete, fuzzy, etc).

.. code-block:: json

   {
      "messageId": "translation"
   }

Lingui (raw)
============

This file format simply outputs all internal data in JSON format. It's the original
file format used by LinguiJS library before support for other catalog formats were added.
It might be useful for tools build on top of Lingui CLI which needs to further
process catalog data.

.. code-block:: json

   {
      "messageId": {
         "translation": "Translated message",
         "defaults": "Default message",
         "description": "Comment for translators",
         "origin": [["src/App.js", 3]]
      },
      "obsoleteId": {
         "translation": "Obsolete message",
         "origin": [["src/App.js", 3]],
         "obsolete": true
      }
   }
