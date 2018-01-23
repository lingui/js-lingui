.. _tutorial-cli:
.. highlight:: shell

*************************
Working with jsLingui CLI
*************************

``@lingui/cli`` provides the ``lingui`` command for extracting, merging and
compiling message catalogs::

   npm install --global @lingui/cli

Add a new locale
================

First, we need to add all the locales we want to translate our application into.
:cli:`add-locale` command creates a new directory in the ``locale`` directory
and also checks if 'locale' exists::

   lingui add-locale en cs

Example output::

   Added locale en.
   Added locale cs.

   (use "lingui extract" to extract messages)

Extracting messages
===================

We're going to use an app we built in a previous tutorial. The :cli:`extract`
command looks for messages in the source files and extracts them::

   lingui extract

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

   (use "lingui add-locale <locale>" to add more locales)
   (use "lingui extract" to update catalogs with new messages)
   (use "lingui compile" to compile catalogs for production)

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

   (use "lingui extract" to update catalogs with new messages)
   (use "lingui compile" to compile catalogs for production)

:cli:`extract` merges all translations with new messages, so you can run
this command any time without worrying about losing any translations.

Preparing catalogs for production
=================================

Once we have all catalogs ready and translated, we can compile the JSON into a
minified JS file with the :cli:`compile` command. This command parses the
messages in MessageFormat and compiles them into simple functions. It also adds
plural rules to a production ready catalog::

   lingui compile

 .. code-block:: shell

   Compiling message catalogs…
   Done!

The ``locale`` dir now contains the source catalogs (``messages.json``) and
the compiled ones (``messages.js``).

Cleaning up obsolete messages
=============================

By default, the :cli:`extract` command merges messages extracted from source
files with the existing message catalogs. This is safe as we won't accidentally lose
translated messages.

However, sooner or later some messages will be removed from the source. We can
use the ``--clean`` option to clean up our message catalogs::

   lingui extract --clean

Validation of message catalogs
==============================

It might be useful to check if all messages were translated (e.g: in a
continous integration runner). The :cli:`compile` command has a ``--strict``
option, which does exactly that.

The example output might look like this::

   lingui compile --strict

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

   lingui compile --strict

.. code-block:: shell

   Compiling message catalogs…
   Done!

If you use natural language for message IDs (that's the default),
set :conf:`sourceLocale`. You shouldn't use this config if you're using custom
IDs (e.g: ``Component.title``).

Further reading
===============

That's it! Checkout `CLI reference <../ref/lingui-cli>`_ documentation for more
info about ``lingui`` commands or `configuration reference <../ref/lingui-conf>`_
for info about configuration parameters.
