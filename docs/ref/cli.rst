.. _ref-cli:

*********************************
API Reference - CLI (@lingui/cli)
*********************************

``@lingui/cli`` manages locales, extracts messages from source files into
message catalogs and compiles message catalogs for production use.


Install
=======

1. Install ``@lingui/cli`` as a development dependency:

   .. code-block:: shell

      npm install --save-dev @lingui/cli @babel/core
      # yarn add --dev @lingui/cli @babel/core

2. Add following scripts to your ``package.json``:

   .. code-block:: json

      {
         "scripts": {
            "extract": "lingui extract",
            "compile": "lingui compile",
         }
      }

Global options
==============

.. lingui-cli-option:: --config <config>

Path to LinguiJS configuration file. If not set, the default file
is loaded as described in :doc:`LinguiJS configuration </ref/conf>` reference.

Commands
========

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

``extract-template``
--------------------

.. lingui-cli:: extract-template [--verbose]

This command extracts messages from source files and creates a ``.pot`` template file.

.. lingui-cli-option:: --verbose

Prints additional information.

``compile``
-----------

.. lingui-cli:: compile [--strict] [--format <format>] [--verbose] [--namespace <namespace>]

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

.. lingui-cli-option:: --namespace

Specify namespace for compiled message catalogs (also see :conf:`compileNamespace` for
global configuration).
