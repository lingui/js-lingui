********************************
Migration guide from 2.x to 3.x
********************************

Backward incompatible changes
=============================

Minimal required versions are:

- Node.js: 8.x
- React: 16.8
- Babel: 6

@lingui/react
-------------

- ``<I18n>`` render-prop component and ``withI18n`` high-order component were removed in favor of :js:func:`useLingui` hook.

- In :component:`Trans`, ``defaults`` prop was renamed to ``message`` and ``description`` to ``comment``.

- In :component:`Trans`, ``components`` is now an object, not an array. When using the low level API,
  it allows to name the component placeholders:

  .. code-block:: jsx

     <Trans id="Read <a>the docs</a>!" components={{a: <a href="/docs" />}} />

- ``NumberFormat`` and ``DateFormat`` components were removed. Use ``date`` and ``number`` formats
  from ``@lingui/core`` package instead.

Removed :component:`I18nProvider` declarative API
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

LinguiJS started as a React library. After `@lingui/core` package was introduced,
there were two ways how to switch active locales and manage catalogs in React: either
using :component:`I18nProvider` declarative API or using `setupI18n` imperative API.

In the same spirit as ``react-apollo`` and ``react-redux``, the :component:`I18nProvider`
is simplified and accepts ``i18n`` manager, which must be created manually:

.. code-block:: diff

     import { I18nProvider } from '@lingui/react'
   + import { setupI18n } from '@lingui/core'
     import catalogEn from './locale/en/messages.js'

   + const i18n = setupI18n()
   + i18n.load('en', catalogEn)
   + i18n.activate('en')

     function App() {
        return (
   -       <I18nProvider language="en" catalogs={{ en: catalogEn }}>
   +       <I18nProvider i18n={i18n}>
              <App />
           </I18nProvider>
        )
     }

@lingui/core
------------

- ``i18n.t``, ``i18n.plural``, ``i18n.select`` and ``i18n.selectOrdinal`` methods were
  removed in favor of macros.
- ``i18n.use`` was removed. Using two locales at the same time isn't common usecase
  and can be solved in user land.
- Signature of ``i18n._`` method has changed. The third parameter now accepts default
  message in ``message`` prop, instead of ``defaults``:

  .. code-block:: diff

     - i18n._('Welcome / Greetings', { name: 'Joe' }, { defaults: "Hello {name}" })
     + i18n._('Welcome / Greetings', { name: 'Joe' }, { message: "Hello {name}" })

- ``i18n._`` also accepts a message descriptor as a first parameter:

  .. code-block:: diff

     i18n._({
       id: string,
       message?: string,
       comment?: string
     })

`i18n.load` loads a catalog for a single locale
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``i18n`` manager is the single source of truth and there's no need to keep all catalogs
loaded outside this object. To make loading easier, `i18n.load` now accepts catalog
for a single locale. If previous behavior was useful for you (e.g. when loading all
message catalogs in SSR), use `i18n.loadAll` instead.

.. code-block:: diff

     import { setupI18n } from '@lingui/core'
     import catalogEn from './locale/en/messages.js'

     export const i18n = setupI18n()
   - i18n.load({ en: catalogEn })
   + i18n.load('en', catalogEn)

.. note::

   Use `i18n.loadAll` to load all catalogs at once:

   .. code-block:: jsx

      // i18n.js
      import { setupI18n } from '@lingui/core'
      import catalogEn from './locale/en/messages.js'

      export const i18n = setupI18n()
      i18n.loadAll({ en: catalogEn })

@lingui/macro
-------------

- :jsmacro:`plural`, :jsmacro:`select` and :jsmacro:`selectOrdinal` accepts value as a first parameter:

  .. code-block:: diff

     - plural({ value, one: "# book", other: "# books" })
     + plural(value, { one: "# book", other: "# books" })

@lingui/cli
-----------

- command ``lingui init`` was removed

Whitespace and HTML entities
----------------------------

Whitespace handling in plugins had few bugs. By fixing them, there might be few
backward incompatible changes. It's advised to run :cli:`extract` and inspect
changes in catalogs (if any).

1. Don't keep spaces before ``{variables}`` in JSX. This is how React handles whitespaces
   in JSX. Leading whitespace is always removed:

   .. code-block:: jsx

      <Trans>
         &quot;
         {variable}
         &quot;
      </Trans>

      // Becomes: &quot;{variable}&quot;

2. Keep forced newlines. Sometimes it's useful to keep newlines in JSX. If that's your
   case, you need to force it in the same was as spaces are forced before variables
   or elements:

   .. code-block:: jsx

      <Trans>
         1. Item{"\n"}
         2. Item
      </Trans>

      // Becomes: 1. Item\n2. Item

3. Keep HTML entities. HTML entities are replaced with characters in Babel. They are now
   kept in message catalogs and replaced only when rendered:

   .. code-block:: jsx

      <Trans>&quot;Hello&quot;</Trans>

      // Becomes: &quot;Hello&quot;

Plugins/Presets
---------------

Plugins are replaced with macros. Presets are removed completely because they aren't
needed anymore.

1. Uninstall plugins/presets, remove them from Babel config and replace them with
   ``macros``:

   .. code-block:: shell

      npm uninstall @lingui/babel-preset-react
      npm install --dev @lingui/macro babel-plugin-macros

   .. code-block:: diff

      {
         "presets": [
      -      "@lingui/babel-preset-react"
         ],
         "plugins": [
      +      "macros",
         ]
      }

2. Import :jsxmacro:`Trans`, :jsxmacro:`Plural`, :jsxmacro:`Select` and
   :jsxmacro:`SelectOrdinal` from ``@lingui/macro``:

   .. code-block:: diff

      - import { Trans } from "@lingui/react"
      + import { Trans } from "@lingui/macro"

   .. note::

      If you used :component:`Trans` component without children, then keep the import
      from ``@lingui/react``:

      .. code-block:: jsx

         import { Trans } from "@lingui/react"

         const CustomID = () => <Trans id="msg.id" />
         const DynamicID = () => <Trans id={msgId} />

3. :js:meth:`i18n.t`, :js:meth:`i18n.plural`, :js:meth:`i18n.select` and
   :js:meth:`i18n.selectOrdinal` methods are removed and replaced with macros.

   Message descriptor created by macro must be passed to :js:meth:`i18n._` method:

   .. code-block:: diff

        import { setupI18n } from "@lingui/core"
      + import { t } from "@lingui/macro"

        const i18n = setupI18n()

      - i18n.t`Hello World`
      + i18n._(t`Hello World`)



New features
============

`i18n.loadAll`
--------------

`i18n.loadAll` method was formerly named `i18n.load`. It loads all available catalogs
at once. Useful in Node.js environments when we don't need to load catalogs one by one.

.. code-block:: jsx

   import { setupI18n } from "@lingui/core"

   export const i18n = setupI18n()
   i18n.loadAll({
     en: require("./locale/en/messages"),
     cs: require("./locale/cs/messages")
   })

`i18n.willActivate`
-------------------

`willActivate(locale: string)` event is called when locale change is requested using
`i18n.activate`. It may return a promise. In that case, locale is activated after the
promise is resolved.

Here's an example with dynamic import in webpack:

.. code-block:: jsx

   const i18n = setupI18n()
   i18n.willActivate(locale => {
     /* webpackMode: "lazy", webpackChunkName: "i18n-[index]" */
     return import(`@lingui/loader!./locales/${locale}/messages.po`)
   })

`i18n.didActivate`
------------------

`didActivate` is called after the locale is activated.

