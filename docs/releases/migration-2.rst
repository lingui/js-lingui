********************************
Migration guide from 1.x to 2.x
********************************

.. warning:: This document is a draft of next major release.

Backward incompatible changes
=============================

New scope of NPM packages
-------------------------

Packages are now released under ``@lingui`` organization. Package names remains
the same:

.. code-block:: json

   // Before
   lingui-react
   lingui-cli
   babel-preset-lingui-react

   // After
   @lingui/lingui-react
   @lingui/lingui-cli
   @lingui/babel-preset-lingui-react

Default message catalog format
------------------------------

jsLingui used comprehensive ``lingui`` format which contains additional info
like location of message in source and default translation (if any). Since most
3rd party tools work with simple JSON only, the default format will be
``minimal``.

- If you want to **keep** ``lingui`` format, add ``"format": "lingui"`` to your
lingui config in package.json.

- If you want to **migrate** ``lingui`` format to ``minimal``, remove ``format``
from configuration (if any) and run ``lingui extract --convert-from lingui``.

- If you used ``minimal`` format before, simply remove ``"format": "minimal"``
from lingui configuration.

``unpackCatalog`` is deprecated
-------------------------------

``unpackCatalog`` was a useless optimization, which probably saved less bytes
that was a size of ``unpackCatalog`` function. ``lingui compile`` now produce
*unpacked* file, which can be used directly in :component:`I18nProvider`:

.. code-block:: jsx

   import { I18nProvider } from 'lingui-react'
   import catalogEn from './locale/en/messages.js'

   function App() {
      return (
         <I18nProvider language="en" catalogs={{ en: catalogEn }}>
           // ...
         </I18nProvider>
      )
   }

``development`` prop of ``I18nProvider`` is deprecated
------------------------------------------------------

jsLingui doesn't include message parser in production bundle, because messages
are compiled to functions during build. However, in development it's convenient
to see parsed and formatted messages right away without need to run
``lingui extract`` and ``lingui compile`` everytime we add new text to an app.

Message parser is included in development package along with plural rules for
all languages. This package is now included automatically in development build
and the content is scoped under ``if (process.env.NODE_ENV === 'production')``
so it's removed using dead code elimination techniques. To remove it, simply
build your app with ``NODE_ENV=production``. This change is inspired by
`React <https://reactjs.org/blog/2017/12/15/improving-the-repository-infrastructure.html#protecting-against-late-envification>`_.

Default wrapping components removed
-----------------------------------

In React < 16.2, components had to return single children which had to be either
React Element or null. For this reason, :component:`I18nProvider` wrapped
children in ``div`` and :component:`Trans` wrapped translations in ``span``.

React 16.2 allows multiple children and text children, so default wrapping
components are removed.

If you're using React < 16.2 or you want to keep the previous behavior:

1. Set ``defaultRender`` prop of :component:`I18nProvider` to ``span``.
2. Wrap children of :component:`I18nProvider` into ``div`` explicitly.

.. code-block:: jsx

   import * as React from 'react'
   import { I18nProvider } from 'lingui-react'

   function App() {
      return (
         <I18nProvider defaultRender="span">
            <div>
               // original children of I18nProvider
            </div>
         </I18nProvider>
      )
   }

Package ``lingui-formats`` merged to ``lingui-i18n``
----------------------------------------------------

``lingui-formats`` package was used for date/number formatting and was a wrapper
around Intl module. It only exported two functions: ``date`` and ``number``, so
it was merged to ``lingui-i18n``. It's unlikely that you imported from it
directly but if you did, simply import ``date`` and ``number`` functions from
``lingui-i18n``:

.. code-block:: jsx

   // Before
   import { date, number } from 'lingui-formats'

   // After
   import { date, number } from 'lingui-i18n'

Signature of ``i18n._`` changed
-------------------------------

``i18n._`` is low-level API for message translation and formatting.
The function signature has changed from::

i18n._(messageId: string, { values: Object, defaults: string, formats: Object })

to::

i18n._(messageId: string, values: Object, { defaults: string, formats: Object })

This change makes usage easier, because ``values`` are commonly used parameter.

Since this is a low-level API, you probably haven't used it directly and it's
enough to upgrade your lingui babel plugin. Otherwise simple refactoring is required:

.. code-block:: jsx

   // before
   i18n._('Hello {name}', { values: { name: "Fred" } })

   // after
   i18n._('Hello {name}', { name: "Fred" })
