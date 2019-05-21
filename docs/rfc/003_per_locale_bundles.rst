************************
003 - Per-locale bundles
************************

Per-locale bundles are another build time optimization to reduce size of
internationalized JavaScript applications.

Consider this example - we have an internationalized app which loads translation from
external file:

.. code-block:: jsx

   // src/Notifications.js
   import * as React from "react"
   import { setupI18n } from "@lingui/core"
   import { I18nProvider } from "@lingui/react"
   import { Trans, Plural, date } from "@lingui/macro"

   const i18n = setupI18n()
   i18n.load("cs", import("./locale/cs/messages.json"))
   i18n.activate("cs")

   const Notifications = ({ now, count }) => (
      <I18nProvider i18n={i18n}>
         <h1><Trans>Notifications</Trans></h1>

         <p><Trans>Today is {date(now)}</Trans></p>

         <p>
            <Plural
               value={count}
               one={<>You have <strong>#</strong> unread notification</>}
               other={<>You have <strong>#</strong> unread notifications</>}
            />
         </p>
      </I18nProvider>
   )

If we generate the production bundle in Engish locale, it will roughly look like this -
:component:`Trans` components are removed and formatting components (:component:`Plural`
and :js:func:`date`) are replaced with runtime versions:

.. code-block:: jsx

   // build/Notifications.en.js
   import * as React from "react"
   import { Plural, date } from "@lingui/react"

   const Notifications = ({ now, count }) => (
      <div>
         <h1>Notifications</h1>

         <p>Today is {date(now)}</p>

         <p>
            <Plural
               value={count}
               one={<>You have <strong>#</strong> unread notification</>}
               other={<>You have <strong>#</strong> unread notifications</>}
            />
         </p>
      </div>
   )

So far the code looks very similar to the original one except the loading of message
catalogs is removed completely.

Let's take a look on other than source locale, for example Czech. The message catalog
might look similar to this:

.. code-block:: po

   msgid "Notifications"
   msgstr "Upozornění"

   msgid "Today is {now, date}"
   msgstr "Dnes je {now, date}"

   msgid ""
   "{count, plural, "
   "one {You have <0>#</0> unread notification} "
   "other {You have <0>#</0> unread notification}}"
   msgstr ""
   "{count, plural, "
   "one {Máte <0>#</0> nepřečtenou zprávu} "
   "few {Máte <0>#</0> nepřečtené zprávy} "
   "other {Máte <0>#</0> nepřečtených zpráv}}"

If we generate the production bundle for Czech locale, it will look roughly like this -
translations are applied at build time. Also, :component:`Plural` has all locale
specific plural rules:

.. code-block:: jsx

   // build/Notifications.cs.js
   import * as React from "react"
   import { Plural, date } from "@lingui/react"

   const Notifications = ({ now, count }) => (
      <div>
         <h1>Upozornění</h1>

         <p>Dnes je {date(now)}</p>

         <p>
            <Plural
               value={count}
               one={<>Máte <strong>#</strong> nepřečtenou zprávu</>}
               few={<>Máte <strong>#</strong> nepřečtené zprávy</>}
               other={<>Máte <strong>#</strong> nepřečtené zprávy</>}
            />
         </p>
      </div>
   )

Per-locale bundles has zero footprint of internatinalization library - the code looks
exactly the same have it would look like when no internationalization was used at all.
The remaining runtime layer are utilities for formatting like plurals, dates and number
formatting. There's also no extra request to fetch locale files and no runtime parsing.

Build time localization
=======================

One important note - it should be easy to switch from build time localization to
runtime localization, e.g. by simply toggling a switch in configuration.

Everything is macro
-------------------

The easiest way to transform code at runtime are babel macros:

.. code-block:: jsx

   // src/Notifications.js
   import * as React from "react"
   import { I18nProvider, Trans } from "@lingui/macro"

   const Example = () => (
      <I18nProvider>
         <h1><Trans>Example</Trans></h1>
      </I18nProvider>
   )

When we use macros everywhere, instead of React components, we can easily generate
per-locale bundle:

.. code-block:: jsx

   // build/Notifications.<locale>.js
   import * as React from "react"

   const Example = () => (
      <div>
         <h1>Example</h1>
      </div>
   )

As well as locale agnostic bundle:

.. code-block:: jsx

   // build/Notifications.js
   import * as React from "react"
   import { I18nProvider, Trans } from "@lingui/react"

   // import path taken from Lingui configuration
   import { i18n } from "./i18n.config"

   const Example = () => (
      <I18nProvider i18n={i18n}>
         <h1><Trans id="Example" /></h1>
      </I18nProvider>
   )

In per-locale bundles, the `i18n.config.js` module will be used only in development.

i18n context
============

``i18n`` object loads message catalogs and maintains the active locale. We can
also use it to translate strings, e.g. for HTML attributes:

.. code-block:: jsx

   // src/Notifications.js
   import * as React from "react"
   import { t } from "@lingui/macro"

   const LinkWithTitle = () => {
      const i18n = useLingui()

      return (
         <a href="" aria-title={i18n._(t`Link to documentation`)}>
            <img />
         </a>
      )
   }

However, this approach would be difficult to transform for per-locale bundles. Again,
we need to use macros everywhere:

 .. code-block:: jsx

   // src/LinkWithTitle.js
   import * as React from "react"
   import { i18n } from "@lingui/macro"

   const LinkWithTitle = () => {
      i18n.useLingui()

      return (
         <a href="" aria-title={i18n.t`Link to documentation`}>
            <img />
         </a>
      )
   }

Locale agnostic bundle would look as usual - loading i18n from context via useLingui hook
and then translating message at runtime:

 .. code-block:: jsx

   // build/LinkWithTitle.js
   import * as React from "react"
   import { useLingui } from "@lingui/react"

   const LinkWithTitle = () => {
      const { i18n } = useLingui()

      return (
         <a href="" aria-title={i18n._("Link to documentation")}>
            <img />
         </a>
      )
   }

In per-locale bundle, however, the i18n calls are removed and translations
are replaced in place:

 .. code-block:: jsx

   // build/LinkWithTitle.<locale>.js
   import * as React from "react"

   const LinkWithTitle = () => {
      return (
         <a href="" aria-title="Link to documentation">
            <img />
         </a>
      )
   }

Disadvantages
=============

The biggest problem of per-locale bundle is that change of locale requires page reload.
Might be annoying, but the right locale can be guessed before the page is rendered. Even
if the locale isn't guessed correctly, changing locale is usually one time action for
visitor.

Advantages
==========

The biggest advantage is the bundle size - it's the minimal possible size of the app, because
it completely removes internationalization layer. Remaining runtime formatting would be
used in monolingual site as well, so there's no overhead.

The performance is also superb - there's no overhead.

Conclusion
==========

Per-locale bundles are the ultimate solution to minimize the size of internationalized
apps. If the API will be designed correctly, it'll allow almost seamless transition from
per-locale bundles to locale agnostic bundles.
