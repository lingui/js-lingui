.. _tutorial-cli:
.. highlight:: shell

*************************
Working with LinguiJS CLI
*************************

``@lingui/cli`` provides the ``lingui`` command for extracting, merging and
compiling message catalogs. Follow `setup instructions <../ref/cli>`_ to install required
packages.

.. note::

   This tutorial assumes you use `yarn` to run commands. If you use `npm`,
   type `npm run <command>` instead of `yarn <command>`.

Add a new locale
================

First, we need to add all the locales we want to translate our application into.
:cli:`add-locale` command checks if such locale exists and creates a new directory in
the ``locale`` directory::

   yarn add-locale en cs

Example output::

   Added locale en.
   Added locale cs.

   (use "yarn extract" to extract messages)

Extracting messages
===================

We're going to use an app we built in a `React tutorial <./react>`_. The :cli:`extract`
command looks for messages in the source files and extracts them::

   yarn extract

.. code-block:: shell

   Extracting messages from source files…
   Collecting all messages…
   Writing message catalogs…
   Messages extracted!

   Catalog statistics:
   ┌──────────┬─────────────┬─────────┐
   │ Language │ Total count │ Missing │
   ├──────────┼─────────────┼─────────┤
   │ cs       │     40      │   40    │
   │ en       │     40      │   40    │
   └──────────┴─────────────┴─────────┘

   (use "yarn add-locale <locale>" to add more locales)
   (use "yarn extract" to update catalogs with new messages)
   (use "yarn compile" to compile catalogs for production)

The message catalog will look like this:

.. code-block:: json

   {
     "Message Inbox": "",
     "See all <0>unread messages</0> or <1>mark them</1> as read.": "",
     "{messagesCount, plural, one {There's {messagesCount} message in your inbox.} other {There're {messagesCount} messages in your inbox.}}": "",
     "Last login on {lastLogin,date}.": "",
   }

It's in a JSON dictionary, where 'key' is message ID and value is an object with some
relevant information: translation, defaults and origin for the message.

This catalog is ready for translation. Let's translate it into Czech by filling the
``translation`` fields:

.. code-block:: json

   {
     "Message Inbox": "Přijaté zprávy",
     "See all <0>unread messages</0> or <1>mark them</1> as read.": "Zobrazit všechny <0>nepřečtené zprávy</0> nebo je <1>označit</1> jako přečtené.",
     "{messagesCount, plural, one {There's {messagesCount} message in your inbox.} other {There're {messagesCount} messages in your inbox.}}": "{messagesCount, plural, one {V příchozí poště je {messagesCount} zpráva.} few {V příchozí poště jsou {messagesCount} zprávy. } other {V příchozí poště je {messagesCount} zpráv.}}",
     "Last login on {lastLogin,date}.": "Poslední přihlášení {lastLogin,date}",
   }

If we run the :cli:`extract` command again, we can see in the stats that all
messages are translated::

   Catalog statistics:
   ┌──────────┬─────────────┬─────────┐
   │ Language │ Total count │ Missing │
   ├──────────┼─────────────┼─────────┤
   │ cs       │      4      │    0    │
   │ en       │      4      │    4    │
   └──────────┴─────────────┴─────────┘

   Messages extracted!

   (use "yarn extract" to update catalogs with new messages)
   (use "yarn compile" to compile catalogs for production)

:cli:`extract` merges all translations with new messages, so you can run
this command any time without worrying about losing any translations.

Preparing catalogs for production
=================================

Once we have all catalogs ready and translated, we can compile the JSON into a
minified JS file with the :cli:`compile` command. This command parses the
messages in MessageFormat and compiles them into simple functions. It also adds
plural rules to a production ready catalog::

   yarn compile

 .. code-block:: shell

   Compiling message catalogs…
   Done!

The ``locale`` directory now contains the source catalogs (``messages.json``) and
the compiled ones (``messages.js``).

Cleaning up obsolete messages
=============================

By default, the :cli:`extract` command merges messages extracted from source
files with the existing message catalogs. This is safe as we won't accidentally lose
translated messages.

However, sooner or later some messages will be removed from the source. We can
use the ``--clean`` option to clean up our message catalogs::

   yarn extract --clean

Validation of message catalogs
==============================

It might be useful to check if all messages were translated (e.g: in a
continous integration runner). The :cli:`compile` command has a ``--strict``
option, which does exactly that.

The example output might look like this::

   yarn compile --strict

.. code-block:: shell

   Compiling message catalogs…
   Error: Failed to compile catalog for locale en!
   Missing 42 translation(s)

Configuring source locale
=========================

We see that checking for missing translations has one drawback –
English message catalog doesn't require any translations because we're using
English in our source code!

Let's fix it by setting :conf:`sourceLocale` in ``package.json``::

   {
      "lingui": {
         "sourceLocale": "en"
      }
   }

Running ``lingui extract`` again shows the correct statistics::

   Catalog statistics:
   ┌─────────────┬─────────────┬─────────┐
   │ Language    │ Total count │ Missing │
   ├─────────────┼─────────────┼─────────┤
   │ cs          │      4      │    0    │
   │ en (source) │      4      │    -    │
   └─────────────┴─────────────┴─────────┘

And compilation in strict mode no longer throws an error::

   yarn compile --strict

.. code-block:: shell

   Compiling message catalogs…
   Done!

If you use natural language for message IDs (that's the default),
set :conf:`sourceLocale`. You shouldn't use this config if you're using custom
IDs (e.g: ``Component.title``).

Pseudolocalization
==================

There is built in support for `pseudolocalization <https://en.wikipedia.org/wiki/Pseudolocalization>`. 
Pseudolocalization is a method for testing the internationalization aspects 
of your application by replacing your strings with altered versions 
and maintaining string readability. It also makes hard coded strings 
and improperly concatenated strings easy to spot so that they can be properly localized.

  Example:
  Ţĥĩś ţēxţ ĩś ƥśēũďōĺōćàĺĩźēď

To setup pseudolocalization add :conf:`pseudoLocale` in ``package.json``::

   {
      "lingui": {
         "pseudoLocale": "pseudo-LOCALE"
      }
   }

:conf:`pseudoLocale` option can be any string 
examples: :conf:`en-PL`, :conf:`pseudo-LOCALE`, :conf:`pseudolocalization` or :conf:`en-UK`

PseudoLocale folder is automatically created based on configuration when running 
``yarn extract`` command. Pseudolocalized text is created on  ``yarn compile`` command.
The pseudolocalization is automatically created from default messages. 
It can also be changed by setting translation in :conf:`message.json` into non-pseudolocalized text.

How to switch your browser into specified pseudoLocale
------------------------------------------------------

We can use browsers settings or extensions. Extensions allow to use any locale.
Browsers are usually limited into valid language tags (BCP 47). 
In that case, the locale for pseudolocalization has to be standard locale,
which is not used in your application for example :conf:`zu_ZA` Zulu - SOUTH AFRICA

Chrome:
a) With extension (any string) - https://chrome.google.com/webstore/detail/quick-language-switcher/pmjbhfmaphnpbehdanbjphdcniaelfie
b) Without extension - chrome://settings/?search=languages

Firefox:
a) With extension (any string) - https://addons.mozilla.org/en-GB/firefox/addon/quick-accept-language-switc/?src=search
b) Without extension - about:preferences#general > Language

Catalogs in VCS and CI
======================

The ``locale/_build`` folder and ``locale/*/*.js`` (compiled catalogs) are safe to be ignored by your VCS.
What you do need to keep in VCS are the json files (``locale/*/*.json``) that contain the messages
for translators. The JavaScript functions that return the actual translations when your app runs in
production are created from those json files. See
`Excluding build files <../guides/excluding-build-files>`_ guide for more info.

If you're using a CI, it is a good idea to add the ``yarn extract`` and ``yarn compile``
commands to your build process.

Further reading
===============

That's it! Checkout `CLI reference <../ref/cli>`_ documentation for more
info about ``lingui`` commands or `configuration reference <../ref/conf>`_
for info about configuration parameters.
