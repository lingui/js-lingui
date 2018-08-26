********************
Lingui Configuration
********************

Configuration is read from 3 different sources (the first found wins):

- from ``lingui`` section in ``package.json``
- from ``.linguirc``
- from ``lingui.config.js``

``<rootDir>`` is replaced with base directory of the configuration file.

Default config:

.. code-block:: json

   {
     "lingui": {
       "fallbackLocale": "",
       "sourceLocale": "",
       "localeDir": "<rootDir>/locale",
       "srcPathDirs": [
           "<rootDir>"
       ],
       "srcPathIgnorePatterns": [
           "/node_modules/"
       ],
       "format": "lingui",
       "extractBabelOptions": {}
     }
   }

.. config:: fallbackLocale

fallbackLocale
--------------

Default: ``''``

Translation from :conf:`fallbackLocale` is used when translation for given locale is missing.

If :conf:`fallbackLocale` isn't defined or translation in :conf:`fallbackLocale` is
missing too, either message default or message ID is used instead.

.. config:: format

format
------

Default: ``lingui``

Format of message catalogs. Possible values are:

lingui
^^^^^^

Each message is an object composed in the following format:

.. code-block:: json

   {
     "MessageID": {
       "translation": "Translated Message",
       "defaults": "Default string (from source code)",
       "origin": [
         ["path/to/src.js", 42]
       ]
     }
   }

Origin is filename and line number from where the message was extracted.

minimal
^^^^^^^

Simple JSON with message ID -> translation mapping:

.. code-block:: json

   {
      "MessageID": "Translated Message"
   }

po
^^

Gettext PO file:

.. code-block:: po

   #: src/App.js:4, src/Component.js:2
   msgid "MessageID"
   msgstr "Translated Message"

.. config:: sourceLocale

sourceLocale
------------

Default: ``''``

Locale of message IDs, which is used in source files.
Catalog for :conf:`sourceLocale` doesn't require translated messages, because message
IDs are used by default. However, it's still possible to override message ID by
providing custom translation.

The difference between :conf:`fallbackLocale` and :conf:`sourceLocale` is that
:conf:`fallbackLocale` is used in translation, while :conf:`sourceLocale` is
used for the message ID.

.. config:: srcPathDirs

srcPathDirs
-----------

Default: ``[<rootDir>]``

List of directories with source files from which messages are extracted. Ignored
directories are defined in :conf:`srcPathIgnorePatterns`.

.. config:: srcPathIgnorePatterns

srcPathIgnorePatterns
---------------------

Default: ``["/node_modules/"]``

Ignored paths when looking for source files to extract messages from.

.. config:: localeDir

localeDir
---------

Default: ``<rootDir>/locale``

Directory where message catalogs should be saved.

.. config:: extractBabelOptions

extractBabelOptions
-------------------

Default: ``{}``

Specify extra babel options used to parse source files when messages are being extracted. Not required in most cases.

.. code-block:: json

   {
     "extractBabelOptions": {
       "plugins": ["@babel/plugin-syntax-dynamic-import"]
     }
   }
