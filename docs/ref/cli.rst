*********************************
API Reference - CLI (@lingui/cli)
*********************************

``@lingui/cli`` manages locales, extracts messages from source files into
message catalogs and compiles message catalogs for production use.


Install
=======

``@lingui/cli`` requires you to install ``babel-core`` depending on Babel version you
use. Both packages can be installed either globally:

.. code-block:: shell

   yarn global add @lingui/cli
   # npm install --global @lingui/cli

   # babel 6.x
   yarn global add babel-core
   # npm install --global babel-core

   # babel 7.x
   yarn global add babel-core@^7.0.0-0 @babel/core
   # npm install --global babel-core@^7.0.0-0 @babel/core

or locally:

.. code-block:: shell

   yarn add --dev @lingui/cli
   # npm install --save-dev @lingui/cli

   # babel 6.x
   yarn add --dev babel-core
   # npm install --save-dev babel-core

   # babel 7.x
   yarn add --dev babel-core@^7.0.0-0 @babel/core
   # npm install --save-dev babel-core@^7.0.0-0 @babel/core

.. note::

   When installed locally, you need to either run it from
   ``node_modules/.bin/lingui`` or using npx_ (``npx lingui``) or add it to your
   ``package.json``:

   .. code-block:: json

      {
        "scripts": {
          "add-locale": "lingui add-locale",
          "extract": "lingui extract",
          "compile": "lingui compile"
        }
      }

   Then you can use:

   .. code-block:: shell

      npm run add-locale -- en cs
      npm run extract
      npm run compile

Commands
========

``init``
--------

.. lingui-cli:: init [--dry-run]

Installs all required packages based on project type. Recognized projects are:

- `Create React App <https://github.com/facebook/create-react-app>`_
- General React app

.. lingui-cli-option:: --dry-run

Output commands which would run, but don't execute them.

``add-locale``
--------------

.. lingui-cli:: add-locale [locales...] [--format <format>]

This command creates a new directory for each locale in :conf:`localeDir`.

.. code-block:: shell

   # Add English, French and Spanish locales
   lingui add-locale en fr es

.. lingui-cli-option:: --format <format>

Format of message catalog (see :conf:`format` option).

``extract``
-----------

.. lingui-cli:: extract [--clean] [--overwrite] [--format <format>] [--convert-from <format>] [--verbose]

This command extracts messages from source files and creates a message catalog for
each language using the following steps:

1. Extract messages from all ``*.jsx?`` files inside :conf:`srcPathDirs`
2. Merge them with existing catalogs in :conf:`localeDir` (if any)
3. Write updated message catalogs to :conf:`localeDir`

.. lingui-cli-option:: --clean

Remove obsolete messages from catalogs. Message becomes obsolete
when it's missing in the source code.

.. lingui-cli-option:: --overwrite

Update translations for :conf:`sourceLocale` from source.

.. lingui-cli-option:: --format <format>

Format of message catalogs (see :conf:`format` option).

.. lingui-cli-option:: --convert-from <format>

Convert message catalogs from previous format (see :conf:`format` option).

.. lingui-cli-option:: --verbose

Prints additional information.

``compile``
-----------

.. lingui-cli:: compile [--strict] [--format <format>] [--verbose]

This command compiles message catalogs in :conf:`localeDir` and outputs
minified Javascript files. Each message is replaced with a function
that returns the translated message when called.

Also, language data (pluralizations) are written to the message catalog as well.

.. lingui-cli-option:: --strict

Fail if a catalog has missing translations.

.. lingui-cli-option:: --format <format>

Format of message catalogs (see :conf:`format` option).

.. lingui-cli-option:: --verbose

Prints additional information.


.. _npx: https://github.com/zkat/npx
