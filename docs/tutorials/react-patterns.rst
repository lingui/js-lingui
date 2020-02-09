*****************************
Common i18n patterns in React
*****************************

Following page describes the most common i18n patterns in React. It's a followup
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

You don't need anything special to use :jsxmacro:`Trans` inside out app (except
of wrapping your app in :component:`I18nProvider`).

Using generated message as ID
-----------------------------

In the examples above, the content of :jsxmacro:`Trans` is transformed into
message in MessageFormat syntax. By default, this message is used as a message ID.
In the example above, messages ``LinguiJS example`` and ``Hello <0>{name}</0>.``
are extracted.

Using custom ID
---------------

If you're using custom IDs in your project, add ``id`` prop to i18n components:

.. code-block:: jsx

   import { Trans } from "@lingui/macro"

   <h1><Trans id="msg.header">LinguiJS example</Trans></h1>

   <p><Trans id="msg.hello">Hello <a href="/profile">{name}</a>.</Trans></p>

Messages ``msg.header`` and ``msg.hello`` will be extracted with default values
``LinguiJS example`` and ``Hello <0>{name}</0>.``.

Element attributes and string only translations
===============================================

Sometimes you can't use :jsxmacro:`Trans` component, for example when translating element
attributes:

.. code-block:: html

   <img src="..." alt="Image caption" />

In such case you need to use :component:`I18n` render prop component to access ``i18n``
object and :jsmacro:`t` macro to wrap message:

1. Use render prop component :component:`I18n` from ``@lingui/react``, to access
   ``i18n`` object.

2. Call :js:meth:`i18n._`` to translate message wrapped in JS macros. :jsmacro:`t` is
   equivalent for :jsxmacro:`Trans`, :jsmacro:`plural` is equivalent to :component:`Plural`.

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

Using generated message as ID
-----------------------------

You can either use generated messages as IDs or custom ones. This is the same
as working for i18n components.

In this example:

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

Message ``Image caption`` will be extracted.

Using custom ID
---------------

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

For all other js macros (:jsmacro:`plural`, :jsmacro:`select``, :jsmacro:`selectOrdinal``),
pass ID as object key:

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

Translations outside React components
=====================================

Another common pattern is when you need to access translations (``i18n`` object)
outside React components, for example inside ``redux-saga``. In such case, you need
a bit more setup:

1. Create your own instance of ``i18n`` using :js:func:`setupI18n` form ``@lingui/core``

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
      import { t } from "@lingui/macro"

      export function alert() {
         // use i18n as you were inside React component
         alert(i18n._(t`...`))
      }

Lazy translations
=================

Messages don't have to be declared at the same code location where they're displayed.
Tag a string with the :jsmacro:`t` macro, and you've created a "message descriptor", which
can then be passed around as a variable, and can be displayed as a translated string by
passing its ``id`` attribute to :jsxmacro:`Trans` as its ``id`` prop:

.. code-block:: jsx

   import React from 'react';
   import { t, Trans } from '@lingui/macro';

   // Creates an array of message descriptor objects
   const favoriteColors = [
      t`Red`,
      t`Orange`,
      t`Yellow`,
      t`Green`
   ];

   export default function ColorList() {
      return (
         <ul>
            {favoriteColors.map((color) => (
            <li key={color.id}>
               {/* Passing the message descriptor's `id` as the `id` prop */}
               <Trans id={color.id} />
            </li>
            ))}
         </ul>
      );
   }

Or to render the message descriptor as a string-only translation, just pass it to
the :js:meth:`I18n._` method as usual:

.. code-block:: jsx

   import React from 'react';
   import { I18n } from '@lingui/react';
   import { t } from "@lingui/macro"

   const favoriteColors = [
      t`Red`,
      t`Orange`,
      t`Yellow`,
      t`Green`,
   ]

   export default function ColorMenu() {
      // Using the `<I18n>` component to access the `i18n` object.
      <I18n>
         {({ i18n }) => {
            const options = favoriteColors.map((color) => ({
               value: color.id,

               // Passing the message descriptor directly to i18n._()
               label: i18n._(color),

            }));
            return (
               <select>
                  {options.map(({ label, value }) => (
                     <option key={value} value={value}>
                        {label}
                     </option>
                  ))}
               </select>
            );
         }}
      </I18n>
   }

Passing messages as props
-------------------------

It's often convenient to pass messages around as component props, for example
as a "label" prop on a button. The easiest way to do this is to pass a :jsxmacro:`Trans`
element as the prop:

.. code-block:: jsx

   import React from 'react';
   import { Trans } from "@lingui/macro"

   export default function FancyButton(props) {
      return <button>{props.label}</button>
   }

   export function LoginLogoutButtons(props) {
      return <div>

         {/* Passing `<Trans>` elements as props */}
         <FancyButton label={<Trans>Log in</Trans>} />
         <FancyButton label={<Trans>Log out</Trans>} />

      </div>
   }

If you need the prop to be displayed as a string-only translation, you can pass
a message descriptor (tagged with the :jsmacro:`t` macro), and have the component
render it as a string using lazy translation:

.. code-block:: jsx

   import React from 'react';
   import { t } from "@lingui/macro"
   import { I18n } from "@lingui/react"

   function ImageWithCaption(props) {
      return (
         <I18n>
            {({ i18n }) => <img
               src="..."
               title={i18n._(props.hoverText)}
            />}
         </I18n>
      );
   }

   export function HappySad(props) {
      return (
         <div>

            {/* Passing message descriptors tagged with `t` as props */}
            <ImageWithCaption hoverText={t`I'm so happy!`} />
            <ImageWithCaption hoverText={t`I'm so sad.`} />

         </div>
      );
   }

Picking a message based on a variable
-------------------------------------

Sometimes you need to pick between different messages to display, depending on the value
of a variable. For example, imagine you have a numeric "status" code that comes from an
API, and you need to display a message representing the current status.

A simple way to do this, is to make an object that maps the possible values of "status"
to message descriptors (tagged with the :jsmacro:`t` macro), and render them as needed
with lazy translation:

.. code-block:: jsx

   import { Trans } from "@lingui/macro";

   const STATUS_OPEN = 1,
         STATUS_CLOSED = 2,
         STATUS_CANCELLED = 4,
         STATUS_COMPLETED = 8

   // A mapping object that provides a message descriptor for each expected
   // value of the "status" variable
   const statusMessages = {
      [STATUS_OPEN]: t`Open`,
      [STATUS_CLOSED]: t`Closed`,
      [STATUS_CANCELLED]: t`Cancelled`,
      [STATUS_COMPLETED]: t`Completed`,
   }

   export default function StatusDisplay(props) {
      // Locate the correct message descriptor
      const messageDescriptor = statusMessages[props.statusCode];

      return (
         <div>
            {/* Pass the message descriptor's `id` as the `id` prop */}
            <Trans id={messageDescriptor.id} />
         </div>
      );
   }
