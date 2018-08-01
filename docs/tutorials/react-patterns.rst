*****************************
Common i18n patterns in React
*****************************

Following page describes the most common i18n patterns in React. It's a followup
to `tutorial <react>`_ with practical examples. See the
`API reference <../ref/react>`_ for detailed information about all components.

Components
==========

Using i18n components is the most straightforward way how to translate your React
components.

:component:`Trans` handles translations of messages including variables and other
React components:

.. code-block:: jsx

   <h1><Trans>jsLingui example</Trans></h1>

   <p><Trans>Hello <a href="/profile">{name}</a>.</Trans></p>

You don't need anything special to use :component:`Trans` inside out app (except
of wrapping your app in :component:`I18nProvider`).

Using generated message as ID
-----------------------------

In the examples above, the content of :component:`Trans` is transformed into
message in MessageFormat syntax. By default, this message is used as a message ID.
In the example above, messages ``jsLingui example`` and ``Hello <0>{name}</0>.``
are extracted.

Using custom ID
---------------

If you're using custom IDs in your project, add ``id`` prop to i18n components:

.. code-block:: jsx

   <h1><Trans id="msg.header">jsLingui example</Trans></h1>

   <p><Trans id="msg.hello">Hello <a href="/profile">{name}</a>.</Trans></p>

Messages ``msg.header`` and ``msg.hello`` will be extracted with default values
``jsLingui example`` and ``Hello <0>{name}</0>.``.

Element attributes and string only translations
===============================================

Sometimes you can't use :component:`Trans` component, for example when translating element
attributes:

.. code-block:: html

   <img src="..." alt="Image caption" />

In such case you need to inject ``i18n`` props into your component and use core API.

1. Use :js:meth:`withI18n` HOC from ``@lingui/react``, to inject ``i18n`` object into
   props.

2. Call core methods: ``i18n.t`` is equivalent for :component:`Trans`, ``i18n.plural``
   is equivalent for :component:`Plural`

.. code-block:: jsx

   import { withI18n } from "@lingui/react"

   function ImageWithCaption({ i18n }) {
      return <img src="..." alt={i18n.t`Image caption`} />
   }

   export default withI18n()(ImageCaption)

.. note::

   Mind the extra parenthesis after :js:meth:`withI18n`! HOC optionally takes
   parameters, so this example is wrong:

   .. code-block:: jsx

      export default withI18n(ImageCaption)

   This is correct:

   .. code-block:: jsx

      export default withI18n()(ImageCaption)
      //                     ^^ extra parenthesis here

   See the reference documentation for :js:meth:`withI18n` for possible options.

.. warning::

   Always use ``i18n`` instead of ``this.props.i18n`` when using Babel plugins
   for transforming i18n components and methods. ``this.props.i18n`` isn't recognized
   in transform plugin:

   .. code-block:: jsx

      class LinkWithTitle extends React.Component {
         render () {
            // get i18n object explicitely
            const { i18n } = this.props

            return <a href="..." title={i18n.t`Link title`} />
         }
      }

   This will become much easier when babel macros are introduced in jsLingui 3.0.


Using generated message as ID
-----------------------------

You can either use generated messages as IDs or custom ones. This is the same
as working for i18n components.

In this example:

.. code-block:: jsx

   import { withI18n } from "@lingui/react"

   function ImageWithCaption({ i18n }) {
      return <img src="..." alt={i18n.t`Image caption`} />
   }

   export default withI18n()(ImageCaption)

Message ``Image caption`` will be extracted.

Using custom ID
---------------

If you're using custom IDs in your project, call ``i18n.t`` with ID as a first
argument and then use string templates as usual:

.. code-block:: jsx

   import { withI18n } from "@lingui/react"

   function ImageWithCaption({ i18n }) {
      return <img src="..." alt={i18n.t('msg.caption')`Image caption`} />
   }

   export default withI18n()(ImageCaption)

Message ``msg.caption`` will be extracted with default value ``Image caption``.

For all other i18n methods (``plural``, ``select``, ``selectOrdinal``), pass ID
as object key:

.. code-block:: jsx

   import { withI18n } from "@lingui/react"

   function ImageWithCaption({ i18n }) {
      return <img src="..." alt={i18n.plural({
         id: 'msg.caption',
         /* the rest of plural props */
      })} />
   }

   export default withI18n()(ImageCaption)

Translations outside React components
=====================================

Another common pattern is when you need to access translations (``i18n`` object)
outside React components, for example inside ``redux-saga``. In such case, you need
a bit more setup:

1. Create your own instance of ``i18n`` using ``setupI18n`` form ``@lingui/core``

2. Pass this instance as ``i18n`` prop to :component:`I18nProvider`. This will replace
   default ``i18n`` object initialized inside :component:`I18nProvider`.

   .. code-block:: jsx

      // App.js
      import { setupI18n } from "@lingui/core"
      import { I18nProvider } from "@lingui/react"

      export const i18n = setupI18n()

      export default function App() {
         return (
            <I18nProvider i18n={i18n}>
               {/* Out app */}
            </I18nProvider>
         )
      }

3. Whenever you are outside React context (i.e. you can't access props), you can use this
   ``i18n`` object.

   .. code-block:: jsx

      import { i18n } from "./App.js"

      export function alert() {
         // use i18n as you were inside React component
         alert(i18n.t`...`)
      }
