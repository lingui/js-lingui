********************
Lingui Configuration
********************

Configuration is read from ``lingui`` section in ``package.json``.

``<rootDir>`` is replaced with base directory of ``package.json``.

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
       "format": "lingui"
     }
   }

.. config:: fallbackLocale

fallbackLocale
--------------

Default: ``''``

Translation from :conf:`fallbackLocale` is used when translation for given locale is missing.

If :conf:`fallbackLocale` isn't defined or translation in :conf:`fallbackLocale` is
missing too, either message defaults or message ID is used instead.

.. config:: format

format
------

Default: ``lingui``

Format of message catalogs. Possible values are:

lingui
^^^^^^

Each message is object in following format:

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

Simple source-translation mapping:

.. code-block:: json

   {
      "MessageID": "Translated Message"
   }

.. config:: sourceLocale

sourceLocale
------------

Default: ``''``

Locale of message IDs, which is used in source files.
Catalog for :conf:`sourceLocale` doesn't require translated messages, because message
IDs are used by default. However, it's still possible to override message ID by
providing custom translation.

The difference between :conf:`fallbackLocale` and :conf:`sourceLocale` is, that
for :conf:`fallbackLocale` is used translation, while for :conf:`sourceLocale` is
used message ID.

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

Ignored paths when looking for source files to extract messages.

.. config:: localeDir

localeDir
---------

Default: ``<rootDir>/locale``

Directory to save message catalogs.
