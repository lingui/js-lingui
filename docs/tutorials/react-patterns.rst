*****************************
Common i18n patterns in React
*****************************

Following page describes the most common i18n patterns in React. It's a follow-up
to `tutorial <react>`_ with practical examples. See the
`API reference <../ref/react>`_ for detailed information about all components.

Macros
======

Using jsx macros is the most straightforward way how to translate your React
components.

:jsxmacro:`Trans` handles translations of messages including variables and other
React components:

.. code-block:: jsx

   import { Trans } from "@lingui/macro"

   <h1><Trans>LinguiJS example</Trans></h1>

   <p><Trans>Hello <a href="/profile">{name}</a>.</Trans></p>

You don't need anything special to use :jsxmacro:`Trans` inside your app (except
of wrapping the root component in :component:`I18nProvider`).

Using ID generated from message
-------------------------------

With :jsxmacro:`Trans`
^^^^^^^^^^^^^^^^^^^^^^

In the examples above, the content of :jsxmacro:`Trans` is transformed into
message in MessageFormat syntax. By default, this message is used as the message ID.
Considering the example above, messages ``LinguiJS example`` and ``Hello <0>{name}</0>.``
are extracted and used as IDs.

With :jsmacro:`t`
^^^^^^^^^^^^^^^^^

In the following example, message ``Image caption`` will be extracted and used as ID.

.. code-block:: jsx

   import { I18n } from "@lingui/react"
   import { t } from "@lingui/macro"

   export default function ImageWithCaption() {
      return (
         <I18n>
            {({ i18n }) => (
               <img src="..." alt={i18n._(t`Image caption`)} />
            )}
         </I18n>
      )
   }

Using custom ID
---------------

With :jsxmacro:`Trans`
^^^^^^^^^^^^^^^^^^^^^^

If you're using custom IDs in your project, add ``id`` prop to i18n components:

.. code-block:: jsx

   import { Trans } from "@lingui/macro"

   <h1><Trans id="msg.header">LinguiJS example</Trans></h1>

   <p><Trans id="msg.hello">Hello <a href="/profile">{name}</a>.</Trans></p>

Messages ``msg.header`` and ``msg.hello`` will be extracted with default values
``LinguiJS example`` and ``Hello <0>{name}</0>.``.

With :jsmacro:`t`
^^^^^^^^^^^^^^^^^

If you're using custom IDs in your project, call :jsmacro:`t` with ID as a first
argument and then use string templates as usual:

.. code-block:: jsx

   import { I18n } from "@lingui/react"
   import { t } from "@lingui/macro"

   export default function ImageWithCaption() {
      return (
         <I18n>
            {({ i18n }) => (
               <img src="..." alt={i18n._(t('msg.caption')`Image caption`)} />
            )}
         </I18n>
      )
   }

Message ``msg.caption`` will be extracted with default value ``Image caption``.

For all other js macros (:jsmacro:`plural`, :jsmacro:`select`, :jsmacro:`selectOrdinal`),
pass ID as the first param (in this case, ``'msg.caption'``):

.. code-block:: jsx

   import { I18n } from "@lingui/react"
   import { plural } from "@lingui/macro"

   export default function ImageWithCaption({ count }) {
      return (
         <I18n>
            {({ i18n }) => (
               <img src="..." alt={i18n._(plural('msg.caption', {
                  value: count,
                  one: "# image caption",
                  other: "# image captions",
               }))} />
            )}
         </I18n>
      )
   }

Element attributes and string-only translations
===============================================

Sometimes you can't use :jsxmacro:`Trans` component, for example when translating element
attributes:

.. code-block:: html

   <img src="..." alt="Image caption" />

In such case you need to use :component:`I18n` render prop component to access ``i18n``
object and :jsmacro:`t` macro to wrap message:

1. Use :js:func:`withI18n` HOC or :component:`I18n` render prop component from ``@lingui/react``, to access
   ``i18n`` object.

2. Call :js:meth:`i18n._`` to translate message wrapped in JS macros. :jsmacro:`t` is
   equivalent for :jsxmacro:`Trans`, :jsmacro:`plural` is equivalent to :component:`Plural`.

.. code-block:: jsx

   // using the withI18n HOC
   import { withI18n } from "@lingui/react"
   import { t } from "@lingui/macro"

   function ImageWithCaption({ i18n }) {
      return <img src="..." alt={i18n._(t`Image caption`)} />
   }

   export default withI18n(ImageWithCaption)

.. code-block:: jsx

   // using the render prop
   import { I18n } from "@lingui/react"
   import { t } from "@lingui/macro"

   export default function ImageWithCaption() {
      return (
         <I18n>
            {({ i18n }) => (
               <img src="..." alt={i18n._(t`Image caption`)} />
            )}
         </I18n>
      )
   }


Translations outside React components
=====================================

Another common pattern is when you need to access translations (``i18n`` object)
outside React components, for example inside ``redux-saga``:

1. Create your own instance of ``i18n`` using :js:func:`setupI18n` form ``@lingui/core``

2. Pass this instance as ``i18n`` prop to :component:`I18nProvider`.

   .. code-block:: jsx

      // App.js
      import { setupI18n } from "@lingui/core"
      import { I18nProvider } from "@lingui/react"

      export const i18n = setupI18n()

      export default function App() {
         return (
            <I18nProvider i18n={i18n}>
               {/* Our app */}
            </I18nProvider>
         )
      }

3. Whenever you are outside React context (i.e. you can't access props), you can use this
   ``i18n`` object.

   .. code-block:: jsx

      import { i18n } from "./App.js"
      import { t } from "@lingui/macro"

      export function alert() {
         // use i18n as if you were inside a React component
         alert(i18n._(t`...`))
      }

Lazy translations
=================

:jsxmacro:`Trans` can also translate messages from variables. We can use :jsmacro:`t`
macro to create a message descriptor and then pass it to :jsxmacro:`Trans` macro as
``id`` prop:

.. code-block:: jsx

   import { t, Trans } from "@lingui/macro"

   const languages = [
      t`English`
      t`Czech`
   ]

   function LanguageSwitcher() {
      return (
         <ul>
            {languages.map(lang => <li><Trans id={lang}/></li>}
         </ul>
      )
   }

This pattern also work with string-only translations. Just pass the message descriptor
to :js:meth:`I18n._` method as usual:

.. code-block:: jsx

   import { t } from "@lingui/macro"

   const languages = [
      t`English`
      t`Czech`
   ]

   const translatedLanguages = languages.map(
      lang => i18n._(lang)
   )
