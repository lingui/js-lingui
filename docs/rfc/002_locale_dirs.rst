************************
002 - Locale directories
************************

Message catalogs can quickly grow in size and it's convenient to split them
into several files. This proposal is about splitting source catalogs. Compiled
message catalogs always contain all messages in project for now.

Considered use cases
====================

- Automatic spitting - one locale directory per package in monorepos (Lerna, Yarn workspaces)
- Manually splitting, i.e. define from what source path the messages will be collected
  into what locale directory.

Solution
========

Create a ``locale`` directory manually in a directory from which all messages should be
collected::

   .
   ├── locale/
   ├── componentA/
   └── componentB/

``locale`` dir contains messages from ``componentA`` and ``componentB``.

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

Possible challenges
-------------------

- User should be warned if messages are collected, but there's no corresponding
  ``locale`` directory for them (e.g. the root ``locale`` directory is missing).
- When a new ``locale`` directory is created in subdirectory, all translations
  from parent ``locale`` should be moved here.
- The other way around, when ``locale`` in subdirectory isn't needed anymore, there
  should be a way how to merge tranlation back to parent directory.

Other considered options
========================

Configure splitting in Lingui config
------------------------------------

.. code-block:: json

   {
      "lingui": {
         "localeDirs": {
            "./locale": "./src",
            "./largeComponentC": "./src/largeComponentC",
         }
      }
   }

This is more difficult with monorepos and it's also more verbose. On the other hand,
it's easier to move ``locale`` dirs to arbitrary location (``locale`` directory doesn't
have to be placed in the same directory as source files).

Create multiple lingui configs
------------------------------

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
