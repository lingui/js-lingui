**************
002 - Catalogs
**************

Related issue: `#257 <https://github.com/lingui/js-lingui/issues/257>`_

Message catalogs can quickly grow in size and it's convenient to split them
into several files. Also, not all messages are extracted from source files and it may
be convenient to fetch message descriptors from API (e.g. GraphQL Enum)

.. important::

   This proposal is about splitting **source catalogs**. Compiled
   message catalogs always contain all messages in project for now.


Proposal
========

Deprecate :conf:`localeDir`, :conf:`srcPathDirs` and :conf:`srcPathIgnorePatterns`.
These will be replaced with ``catalogs``, described below.

Deprecate :cli:`add-locale` command and replace it with ``locales`` configuration.

Allow override default :conf:`rootDir`. All relative paths inside ``catalogs``
configuration will be relative to :conf:`rootDir`.

How ``catalogs`` work
---------------------

Instead of single :conf:`localeDir` directory, ``catalogs`` accepts an object with
configuration for each catalog:

.. code-block:: json

   {
      "lingui": {
         "catalogs": {
            "./locale/{locale}/shared": ".",
            "./locale/{locale}/graphql": "run!scripts/fetch_graphql_enums.js",
            "./components/{name}/locale/{locale}": "./components/{name}/",
         }
      }
   }

**Key** is a path to catalog or catalogs. It's either absolute or relative path
to :conf:`rootDir`.

``{locale}`` placeholder is replaced with catalog's locale.

``{name}`` placeholder is replaced with a catalog name. Source path must include ``{name}``
pattern as well and it works as a ``*`` glob pattern:

.. code-block:: json

   {
      "lingui": {
         "catalogs": {
            "./components/{name}/locale/{locale}": "./components/{name}/",
         }
      }
   }

**Value** specify a source from which messages are extracted. It can be also an array
of sources. The most common one is a directory, which is traversed recursively and
messages are collected from source files.

.. code-block:: json

   {
      "lingui": {
         "catalogs": {
            "./locale/{locale}/all": "./src/",
            "./locale/{locale}/shared": [
               "./src/shared/",
               "./vendor/",
            ]
         }
      }
   }

If the path starts with ``!`` then it's excluded:

.. code-block:: json

   {
      "lingui": {
         "catalogs": {
            "./locale/{locale}/messages": [
               ".",
               "!./node_modules/",
            ]
         }
      }
   }

If the path starts with ``run!`` then messages are loaded from executable script.
See *loading messages from* scripts below.

.. important::

   Catalog names are always **without extension** because that depends on serializer,
   e.g. ``json`` and ``po``.


Loading messages from scripts
-----------------------------

Messages can also be loaded dynamically from a script. If the source path starts with
``run!`` (e.g. ``run!scripts/fetch_graphql_enums.js``), the script is executed and
returned messages are added to catalog.

The type of returned messages should be following:

.. code-block:: jsx

   type MessageDescriptor = {
     id: string,
     defaults?: string,
     description?: string
   }

   type Messages = Array<MessageDescriptor> | Promise<Array<MessageDescriptor>>

   type ExtractedDescriptors =
     | {
         name: string,
         messages: Messages
       }
     | Messages

   export default {
     name: "graphql",
     messages: [
       {
         id: "Episode.NEWHOPE",
         defaults: "New Hope"
       },
       {
         id: "Episode.EMPIRE",
         defaults: "Empire Strikes Back"
       },
       {
         id: "Episode.JEDI",
         defaults: "Return of the Jedi"
       }
     ]
   }

If returned value is an object with ``name`` attribute then value of this attribute
is used in ``{name}`` placeholder.

``Messages`` might also be a promise:

.. code-block:: jsx

   export default {
      name: 'graphql',
      messages: fetch_enums('/graphql')
   }

Message files and translation files
-----------------------------------

Until now, babel plugin extracted messages into ``_build`` directory. Files from
this directory were merged into single catalog which was used to create locale files.

``_build`` directory will be removed right after messages are extracted and collected
messages (without translations) will be stored in message file (``POT`` or ``JSON``
extension). This file is language agnostic and contains only message definitions.

In next step, message file is used to create locale specific catalog by merging
translation from previous locale files.

This allows to check if message source have changed, access message definitions
in other tools and optionally, create/edit message files manually (if automatic
extracting isn't possible).

Summary
=======

Default ``catalogs`` settings is:

.. code-block:: json

   {
      "lingui": {
         "catalogs": {
            "<rootDir>/locale/{locale}/messages": [
               "<rootDir>",
               "!<rootDir>/node_modules/",
            ]
         }
      }
   }

Example configurations
----------------------

Separate catalogs per component, placed inside component dir
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

   .
   ├── ComponentA/
   │   ├── locale/
   │   │  ├── en.po
   │   │  └── cs.po
   │   ├── ComponentA.test.js
   │   └── ComponentA.js
   └── ComponentB/
       ├── locale/
       │  ├── en.po
       │  └── cs.po
       ├── ComponentB.test.js
       └── ComponentB.js

.. code-block:: json

   {
      "lingui": {
         "catalogs": {
            "./{name}/locale/{locale}": "./{name}/"
         }
      }
   }

Separate catalogs per component, placed inside shared directory
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

   .
   ├── locale/
   │   ├── en/
   │   │   ├── ComponentA.po
   │   │   └── ComponentB.po
   │   └── cs/
   │       ├── ComponentA.po
   │       └── ComponentB.po
   ├── ComponentA/
   │   ├── ComponentA.test.js
   │   └── ComponentA.js
   └── ComponentB/
       ├── ComponentB.test.js
       └── ComponentB.js

.. code-block:: json

   {
      "lingui": {
         "catalogs": {
            "./locale/{locale}/{name}": "./{name}/"
         }
      }
   }

Loading message descriptors from API (e.g. GraphQL enums)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: none

    .
    └── locale/
       ├── en/
       │   ├── graphql.po  // messages from remote GraphQL server
       │   └── app.po      // messages from local JS files
       └── cs/
           ├── graphql.po
           └── app.po

.. code-block:: json

   {
      "lingui": {
         "catalogs": {
            "./locale/{locale}/graphql": "run!./scripts/fetch_graphql_enums.js",
            "./locale/{locale}/app": [
               ".",
               "!./node_modules/"
            ]
         }
      }
   }

Possible challenges
-------------------

- User should be warned if messages are collected, but there's no corresponding
  ``locale`` directory for them (e.g. the root ``locale`` directory is missing).
- When a new ``locale`` directory is created in subdirectory, all translations
  from parent ``locale`` should be moved here.
- The other way around, when directory is removed, there should be a way how to merge
  tranlations to parent directory.

Other considered options
------------------------

Default - automatic splitting
------------------------------------

Create a ``locale`` directory manually in a directory from which all messages should be
collected::

   .
   ├── locale/
   ├── componentA/
   └── componentB/

``locale`` directory contains messages from ``componentA`` and ``componentB``.

However, it doesn't not contain messages which are collected to ``locale`` directory
in a subdirectory::

   .
   ├── locale/
   ├── componentA/
   ├── componentB/
   └── largeComponentC/
       ├── locale/
       ├── subcomponentA/
       └── subcomponentB/

Here, ``locale`` contains messages from ``componentA`` and ``componentB``, but not
from ``largeComponentC``, because these messages are collected in
``largeComponentC/locale``.

Advantages
----------

It's flexible and doesn't require additional config in ``.linguirc``

Disadvantages
-------------

- Directories must be created manually. In monorepos this might be extra work,
  but for example in Lerna it's just ``lerna exec -- mkdir locales``.
- ``locale`` directory is always placed near the source files. It's not possible to
  move it to different location (other than creating symlinks)
- It's not possible to rename catalogs.
- It's not possible to collect messages from multiple independent sources into single
  locale directory.

Create multiple lingui configs
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Create Lingui config in a directory, which should hold separate ``locale`` directory::

   .
   ├── .linguirc
   ├── locale/
   ├── componentA/
   ├── componentB/
   └── largeComponentC/
       ├── .linguirc
       ├── locale/
       ├── subcomponentA/
       └── subcomponentB/

The ``.linguirc`` is as simple as::

   {
      "localeDir": "./locale"
   }

This seems to be very repetitive. On the other hand it allows overriding Lingui config
per directory.
