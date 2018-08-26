************************
002 - Locale directories
************************

Related issue: `#257 <https://github.com/lingui/js-lingui/issues/257>`_

Message catalogs can quickly grow in size and it's convenient to split them
into several files.

.. important::

   This proposal is about splitting **source catalogs**. Compiled
   message catalogs always contain all messages in project for now.

Considered use cases
====================

- Automatic spitting - one locale directory per package in monorepos (Lerna, Yarn workspaces)
- Manually splitting, i.e. define from what source path the messages will be collected
  into what locale directory.

Solution
========

Passing an object to :conf:`localeDir` option allows more explicit configuration of
locale directories. Consider following file structure::

   .
   ├── locale/
   ├── componentA/
   ├── componentB/
   └── largeComponentC/
       ├── locale/
       ├── subcomponentA/
       └── subcomponentB/

Messages are always collected to the nearest ``locale`` parent dir. This can be achieved
using this config:

.. code-block:: json

   {
      "lingui": {
         "localeDir": {
            "./locale": ".",
            "./largeComponentC/locale": "./largeComponentC",
         }
      }
   }

**Key** of ``localeDir`` object is a path to message catalogs. **Value** is a path to
source files from which messages are collected. It can be a single path or an array
of paths:

.. code-block:: json

   {
      "lingui": {
         "localeDir": {
            "./locale/{package}/{locale}": [
               "src/shared",
               "src/project"
            ],
         }
      }
   }


On top of that, more advanced patterns are supported:

``{locale}`` placeholder is replaced with a current locale. This example would create
``en.json`` inside ``locale`` directory for English locale:

.. code-block:: json

   {
      "lingui": {
         "localeDir": {
            "./locale/{locale}": ".",
         }
      }
   }

``{package}`` placeholder is replaced with a top level directory. This example would
create ``locale/en/componentA.json`` and ``locale/en/componentB.json`` for English
locale and following directory structure:

.. code-block:: json

   {
      "lingui": {
         "localeDir": {
            "./locale/{locale}/{package}": ".",
         }
      }
   }

.. code-block:: none

   .
   ├── componentA/
   └── componentB/

Path to message catalog can be a directory ending with ``/``. ``locale/`` is the same
as ``locale/{locale}/messages``.

If it's a file, then it *must* contain ``{locale}`` placeholder. This example is
**invalid**:

.. code-block:: json

   {
      "lingui": {
         "localeDir": {
            "./locale/messages": ".",
         }
      }
   }

Summary
=======

By default :conf:`localeDir` is ``./locale``.

If :conf:`localeDir`` is a string, only single locale directory is used. It can be
either a directory or a path to message file including ``{locale}`` pattern:

.. code-block:: json

   {
      "lingui": {
         "localeDir": "./locale"
      }
   }

This is the same as:

.. code-block:: json

   {
      "lingui": {
         "localeDir": "./locale/{locale}/messages"
      }
   }

Finally, if :conf:`localeDir`` is an object, then keys are locale directories and
values are path to source directories from which messages are collected.

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
