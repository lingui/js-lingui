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

   import { t } from "@lingui/macro"

   export default function ImageWithCaption() {
      return <img src="..." alt={t`Image caption`} />
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

If you're using custom IDs in your project, call :jsmacro:`t` with a message descriptor
object and pass ID as ``id`` prop:

.. code-block:: jsx

   import { t } from "@lingui/macro"

   export default function ImageWithCaption() {
      return <img src="..." alt={t({id: 'msg.caption', message: `Image caption`})} />
   }

Message ``msg.caption`` will be extracted with default value ``Image caption``.

For all other js macros (:jsmacro:`plural`, :jsmacro:`select`, :jsmacro:`selectOrdinal`),
use them inside :jsmacro:`t` macro to pass ID (in this case, ``'msg.caption'``).

.. code-block:: jsx

   import { t, plural } from "@lingui/macro"

   export default function ImageWithCaption({ count }) {
      return (
         <img src="..." alt={t({id: 'msg.caption', message: plural(count, {
            one: "# image caption",
            other: "# image captions",
         })})} />
      )
   }

Element attributes and string-only translations
===============================================

Sometimes you can't use :jsxmacro:`Trans` component, for example when translating element
attributes:

.. code-block:: html

   <img src="..." alt="Image caption" />

In such case you need to use :jsmacro:`t` macro to wrap message. :jsmacro:`t` is
equivalent for :jsxmacro:`Trans`, :jsmacro:`plural` is equivalent to :jsxmacro:`Plural`.

.. code-block:: jsx

   import { t } from "@lingui/macro"

   export default function ImageWithCaption() {
      return <img src="..." alt={t`Image caption`} />
   }


Translations outside React components
=====================================

Another common pattern is when you need to access translations outside React components,
for example inside ``redux-saga``. You can use :jsmacro:`t` macro outside React context
as usual:

   .. code-block:: jsx

      import { t } from "@lingui/macro"

      export function alert() {
         // use t as if you were inside a React component
         alert(t`...`)
      }

Lazy translations
=================

Messages don't have to be declared at the same code location where they're displayed.
Tag a string with the :jsmacro:`t` macro, and you've created a "message descriptor", which
can then be passed around as a variable, and can be displayed as a translated string by
passing it to :jsxmacro:`Trans` as its ``id`` prop:

.. code-block:: jsx

   import { t, Trans } from "@lingui/macro"

   const favoriteColors = [
      t`Red`,
      t`Orange`,
      t`Yellow`,
      t`Green`,
   ]

   export default function ColorList() {
      return (
         <ul>
            {favoriteColors.map(color => (
               <li><Trans id={color}/></li>
            ))}
         </ul>
      )
   }

Or to render the message descriptor as a string-only translation, just pass it to
the :js:meth:`I18n._` method:

.. code-block:: jsx

   import { i18n } from '@lingui/core'
   import { t } from "@lingui/macro"

   const favoriteColors = [
      t`Red`,
      t`Orange`,
      t`Yellow`,
      t`Green`,
   ]

   export function getTranslatedColorNames() {
      return favoriteColors.map(
         color => i18n._(color)
      )
   }

Passing messages as props
-------------------------

It's often convenient to pass messages around as component props, for example
as a "label" prop on a button. The easiest way to do this is to pass a :jsxmacro:`Trans`
element as the prop:

.. code-block:: jsx

   import { Trans } from "@lingui/macro"

   export default function FancyButton(props) {
      return <button>{props.label}</button>
   }

   export function LoginLogoutButtons(props) {
      return <div>
         <FancyButton label={<Trans>Log in</Trans>} />
         <FancyButton label={<Trans>Log out</Trans>} />
      </div>
   }

If you need the prop to be displayed as a string-only translation, you can pass
a message tagged with the :jsmacro:`t` macro:

.. code-block:: jsx

   import { t } from "@lingui/macro"

   export default function ImageWithCaption(props) {
      return <img src="..." alt={props.caption} />
   }

   export function HappySad(props) {
      return <div>
         <ImageWithCaption caption={t`I'm so happy!`} />
         <ImageWithCaption caption={t`I'm so sad.`} />
      </div>
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

   const statusMessages = {
      [STATUS_OPEN]: t`Open`,
      [STATUS_CLOSED]: t`Closed`,
      [STATUS_CANCELLED]: t`Cancelled`,
      [STATUS_COMPLETED]: t`Completed`,
   }

   export default function StatusDisplay(statusCode) {
      return <div><Trans id={statusMessages[statusCode]} /></div>
   }
