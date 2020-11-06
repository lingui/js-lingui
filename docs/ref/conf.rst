********************
Lingui Configuration
********************

Configuration is read from 3 different sources (the first found wins):

- from ``lingui`` section in ``package.json``
- from ``.linguirc``
- from ``lingui.config.js``

Default config:

.. code-block:: json

   {
    "catalogs": [{
      "path": "<rootDir>/locale/{locale}/messages",
      "include": ["<rootDir>"],
      "exclude": ["**/node_modules/**"]
    }],
    "compileNamespace": "cjs",
    "extractBabelOptions": {},
    "fallbackLocales": {},
    "format": "po",
    "locales": [],
    "orderBy": "messageId",
    "pseudoLocale": "",
    "rootDir": ".",
    "runtimeConfigModule": ["@lingui/core", "i18n"],
    "sourceLocale": "",
   }

.. contents::
   :local:
   :depth: 1

.. config:: catalogs

catalogs
--------

Default:

.. code-block:: js

   [{
      path: "<rootDir>/locale/{locale}/messages",
      include: ["<rootDir>"],
      exclude: ["**/node_modules/**"]
   }]

Defines location of message catalogs and what files are included when
:cli:`extract` is scanning for messages.

``path`` shouldn't end with slash and it shouldn't include file extension which
depends on :conf:`format`. ``{locale}`` token is replaced by catalog locale.

Patterns in ``include`` and ``exclude`` are passed to `minimatch <https://github.com/isaacs/minimatch>`_.

``path``, ``include`` and ``exclude`` patterns might include ``<rootDir>`` token, which
is replaced by value of :conf:`rootDir`.

``{name}`` token in ``path`` is replaced with a catalog name. Source path must
include ``{name}`` pattern as well and it works as a ``*`` glob pattern:

.. code-block:: json

   {
      "catalogs": [{
         path: "./components/{name}/locale/{locale}",
         include: ["./components/{name}/"],
      }]
   }

Examples
^^^^^^^^

Let's assume we use ``locales: ["en", "cs"]`` and ``format: "po"`` in all examples.

All catalogs in one directory
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: js

   {
      catalogs: [{
         path: "locales/{locale}",
      }]
   }

.. code-block::

   locales/
   ├── en.po
   └── cs.po

Catalogs in separate directories
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: js

   {
      catalogs: [{
         path: "locales/{locale}/messages",
      }]
   }

.. code-block::

   locales
   ├── en/
   │   └── messages.po
   └── cs/
       └── messages.po

Separate catalogs per component, placed inside component dir
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: js

   {
      catalogs: [{
         path: "components/{name}/locale/{locale}",
         include: "components/{name}/"
      }]
   }

.. code-block::

   components/
   ├── RegistrationForm/
   │   ├── locale/
   │   │  ├── en.po
   │   │  └── cs.po
   │   ├── RegistrationForm.test.js
   │   └── RegistrationForm.js
   └── LoginForm/
       ├── locale/
       │  ├── en.po
       │  └── cs.po
       ├── LoginForm.test.js
       └── LoginForm.js

Separate catalogs per component, placed inside shared directory
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: js

   {
      catalogs: [{
         path: "locale/{locale}/{name}",
         include: "components/{name}/"
      }]
   }

.. code-block::

   .
   ├── locale/
   │   ├── en/
   │   │   ├── RegistrationForm.po
   │   │   └── LoginForm.po
   │   └── cs/
   │       ├── RegistrationForm.po
   │       └── LoginForm.po
   └── components/
       ├── RegistrationForm/
       │   ├── RegistrationForm.test.js
       │   └── RegistrationForm.js
       └── LoginForm/
           ├── LoginForm.test.js
           └── LoginForm.js

.. config:: compileNamespace

compileNamespace
----------------

Default: ``cjs``

Specify namespace for exporting compiled messages. See :cli:`compile` command.

cjs
^^^

Use CommonJS exports:

.. code-block:: js

   /* eslint-disable */module.exports={messages: {"..."}}

es
^^

Use ES6 named export:

.. code-block:: js

   /* eslint-disable */export const messages = {"..."}

(window|global)\.(.*)
^^^^^^^^^^^^^^^^^^^^^

Assign compiled messages to ``window`` or ``global`` object. Specify an identifier after
``window`` or ``global`` to which the catalog is assigned, e.g. ``window.i18n``.

For example, setting :conf:`compileNamespace` to ``window.i18n`` creates file
similar to this:

.. code-block:: js

   /* eslint-disable */window.i18n={messages: {"..."}}

.. config:: extractBabelOptions

extractBabelOptions
-------------------

Default: ``{}``

Specify extra babel options used to parse source files when messages are being
extracted. This is required when project doesn't use standard Babel config
(e.g. Create React App).

.. code-block:: json

   {
     "extractBabelOptions": {
       "plugins": ["@babel/plugin-syntax-dynamic-import"]
     }
   }

.. config:: fallbackLocales

fallbackLocales
--------------

Default: ``{}``

:conf:`fallbackLocales` by default is using `CLDR Parent Locales <https://github.com/unicode-cldr/cldr-core/blob/master/supplemental/parentLocales.json>`_, unless you disable it with a `false`:

.. code-block:: json

   {
     "fallbackLocales": false
   }

:conf:`fallbackLocales` object let's us configure fallback locales to each locale instance.

.. code-block:: json

   {
     "fallbackLocales": {
         "en-US": ["en-GB", "en"],
         "es-MX": "es"
     }
   }

On this example if any translation isn't found on `en-US` then will search on `en-GB`, after that if not found we'll search in `en`

Also, we can configure a default one for everything:

.. code-block:: json

   {
     "fallbackLocales": {
         "en-US": ["en-GB", "en"],
         "es-MX": "es",
         "default": "en"
     }
   }

Translations from :conf:`fallbackLocales` is used when translation for given locale is missing.

If :conf:`fallbackLocales` is `false` default message or message ID is used instead.

.. config:: format

format
------

Default: ``po``

Format of message catalogs. Possible values are:

po
^^

Gettext PO file:

.. code-block:: po

   #, Comment for translators
   #: src/App.js:4, src/Component.js:2
   msgid "MessageID"
   msgstr "Translated Message"

po-gettext
^^^^^^^^^^

Uses PO files but with gettext-style plurals, see :ref:`po-gettext`.

minimal
^^^^^^^

Simple JSON with message ID -> translation mapping. All metadata (default
message, comments for translators, message origin, etc) are stripped:

.. code-block:: json

   {
      "MessageID": "Translated Message"
   }

lingui
^^^^^^

Raw catalog data serialized to JSON:

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

Note that origins may produce a large amount of merge conflicts. Origins can be
disabled by setting ``origins: false`` in :conf:`formatOptions`.

.. config:: formatOptions

formatOptions
-------------

Default: ``{ origins: true }``

Object for configuring message catalog output. See individual formats for options.

.. config:: locales

locales
-------

Default: ``[]``

Locale tags which are used in the project. :cli:`extract` and :cli:`compile`
writes one catalog for each locale. Each locale must be a valid
`BCP-47 code <http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html>`_.

orderBy
-------

Default: ``messageId``

Order of messages in catalog:

messageId
^^^^^^^^^

Sort by the message ID.

origin
^^^^^^^

Sort by message origin (e.g. ``App.js:3``)

pseudoLocale
------------

Default: ``""``

Locale used for pseudolocalization. For example when you set ``pseudoLocale: "en"``
then all messages in ``en`` catalog will be pseudo localized.

rootDir
-------

Default: The root of the directory containing your Lingui config file or the ``package.json``.

The root directory that Lingui CLI should scan when extracting messages from
source files.

Note that using ``<rootDir>`` as a string token in any other path-based config
settings will refer back to this value.

.. config:: runtimeConfigModule

runtimeConfigModule
-------------------

Default: ``["@lingui/core", "i18n"]``

Module path with exported i18n object. The first value in array is module path,
the second is the import identifier. This value is used in macros, which need
to reference the global ``i18n`` object.

You only need to set this alue if you use custom object created using :js:func:`setupI18n`:

.. code-block:: jsx

   // If you import `i18n` object from custom module like this:
   import { i18n } from "./custom-i18n-config"

   // ... then add following line to Lingui configuration:
   // "runtimeConfigModule": ["./custom-i18n-config", "i18n"]

You may use a different named export:

.. code-block:: jsx

   import { myI18n } from "./custom-i18n-config"
   // "runtimeConfigModule": ["./custom-i18n-config", "myI18n"]

.. config:: sourceLocale

sourceLocale
------------

Default: ``''``

Locale of message IDs, which is used in source files.
Catalog for :conf:`sourceLocale` doesn't require translated messages, because message
IDs are used by default. However, it's still possible to override message ID by
providing custom translation.

The difference between :conf:`fallbackLocales` and :conf:`sourceLocale` is that
:conf:`fallbackLocales` is used in translation, while :conf:`sourceLocale` is
used for the message ID.
