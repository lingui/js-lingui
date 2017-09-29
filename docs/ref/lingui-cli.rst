********************************
API Reference - CLI (lingui-cli)
********************************

``lingui-cli`` manages locales, extracts messages from source files into
message catalogs and compiles message catalogs for production use.


Install
=======

``lingui-cli`` can be installed both globally and locally:

.. code-block:: shell

   yarn global add lingui-cli
   # npm install --global lingui-cli

or locally:

.. code-block:: shell

   yarn add --dev lingui-cli
   # npm install --save-dev lingui-cli

.. note::

   When installed locally, you need either run it from
   ``node_modules/.bin/lingui`` or add it to your ``package.json``:

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

``add-locale``
--------------

.. lingui-cli:: add-locale [locales...] [--format <format>]

This command creates a new directory for each locale in :conf:`localeDir`.

.. code-block:: shell

   # Add English, French and Spanish locale
   lingui add-locale en fr es

.. lingui-cli-option:: --format <format>

Format of message catalog (see :conf:`format` option)

``extract``
-----------

.. lingui-cli:: extract [--clean] [--format <format>] [--verbose]

This command extract messages from source files and creates message catalog for each language in following steps:

1. Extract messages from all ``*.jsx?`` files inside :conf:`srcPathDirs`
2. Merge them with existing catalogs in :conf:`localeDir` (if any)
3. Write updated message catalogs to :conf:`localeDir`

.. lingui-cli-option:: --clean

Remove obsolete messages from catalogs. Message becomes obsolete
when it's no longer in source code.

.. lingui-cli-option:: --format <format>

Format of message catalogs (see :conf:`format` option)

.. lingui-cli-option:: --verbose

Prints additional information.

``compile``
-----------

.. lingui-cli:: compile [--strict] [--format <format>] [--verbose]

This command compiles message catalogs in :conf:`localeDir` and writes
minified Javascript files. Each message is replace with function call,
which returns translated message.

Also language data (plurals) are written to message catalog as well.

.. lingui-cli-option:: --strict

Fail when some catalog has missing translations.

.. lingui-cli-option:: --format <format>

Format of message catalogs (see :conf:`format` option)

.. lingui-cli-option:: --verbose

Prints additional information
