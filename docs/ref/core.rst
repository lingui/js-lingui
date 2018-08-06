******************************************
@lingui/core - The core i18n functionality
******************************************

The main responsibilities of this package are:

- load message catalogs into application
- switch active language
- translate a message - this task has two steps: 1) loading a translation from a message
  catalog and 2) formatting it with runtime variables
- in development it also parses messages on-the-fly

Installation
============

.. note::
   If you're using :doc:`@lingui/react <react>`, you don't need to install
   this package explicitly. Install :doc:`@lingui/react <react>` instead.

.. code-block:: sh

   yarn add @lingui/core
   # npm install --save @lingui/core

Reference
=========

.. js:data:: Catalogs

   Type of ``catalogs`` parameters in :js:func:`setupI18n <options.catalogs>`
   constructor and :js:meth:`I18n.load` method:

   .. code-block:: js

      type Catalogs = {[language: string]: Messages}

      // Example:
      const catalogs: Catalogs =  {
         en: {
            "Hello": "Hello",
            "Good bye": "Good bye"
         },
         cs: {
            "Hello": "Ahoj",
            "Good bye": "Nashledanou"
         }
      }

.. js:data:: Messages

   Type of messages in :js:data:`Catalogs`. It's a mapping of a **messageId** to a
   translation in given language. This may be a function if messages are compiled.

   .. code-block:: js

      type Messages = {[messageId: string]: string | Function}

      // Example
      const messagesEn: Messages =  {
         "Hello": "Hello",
         "Good bye": "Good bye"
      }

.. js:function:: setupI18n([options])

   :returns: instance of I18n

   Initialize and return a new I18n instance. Usually you want to call it just once
   and then use returned ``i18n`` object across whole codebase.

   .. code-block:: js

      import { setupI18n } from "@lingui/core"

      const i18n = setupI18n()

   The factory function accepts one optional parameter, ``options``:

   .. js:attribute:: options.language

      Initial active language.

      .. code-block:: jsx

         import { setupI18n } from "@lingui/core"

         const i18n = setupI18n({ language: "en" })

         // This is a shortcut for:
         // const i18n = setupI18n()
         // i18n.activate("en")

   .. js:attribute:: options.locales

      List of alternative locales (BCP 47 langauge tags) which are used for number and date
      formatting (some countries use more than one number/date format). If not set, active
      language is used instead.

      .. code-block:: jsx

         import { setupI18n } from "@lingui/core"

         const i18n = setupI18n({
            language: "ar",
            locales: ["en-UK", "ar-AS"]
         })

         // This is a shortcut for:
         // const i18n = setupI18n()
         // i18n.activate("en", ["en-UK", "ar-AS"])

   .. js:attribute:: options.catalogs

      Initial :js:data:`Catalogs`.

      .. code-block:: jsx

         import { setupI18n } from "@lingui/core"

         const catalogs =  {
            en: {
               "Hello": "Hello",
               "Good bye": "Good bye"
            },
            cs: {
               "Hello": "Ahoj",
               "Good bye": "Nashledanou"
            }
         }

         const i18n = setupI18n({ catalogs })

         // This is a shortcut for:
         // const i18n = setupI18n()
         // i18n.load(catalogs)

   .. js:attribute:: options.missing

      Custom message to be returned when translation is missing. This is useful for
      debugging:

      .. code-block:: jsx

         import { setupI18n } from "@lingui/core"

         const i18n = setupI18n({ missing: "🚨" })
         i18n._('missing translation') === "🚨"

      This might be also a function which is called with active language and message ID:

      .. code-block:: jsx

         import { setupI18n } from "@lingui/core"

         function missing(language, id) {
            alert(`Translation in ${language} for ${id} is missing!`)
            return id
         }

         const i18n = setupI18n({ missing })
         i18n._('missing translation') // raises alert

.. js:class:: I18n

   Constructor for I18n class isn't exported from the package. Instead, always use
   :js:func:`setupI18n` factory function.

   .. js:method:: load(catalogs: Catalogs)

      Load message catalogs and merge them with already loaded ones.

      .. code-block:: js

         import { setupI18n } from "@lingui/core"

         const messagesEn =  {
            "Hello": "Hello",
            "Good bye": "Good bye",

            // Just an example how catalog looks internally.
            // Formatting of string messages works in development only.
            // See note below.
            "My name is {name}": "My name is {name}"
         }

         const messagesCs = {
            "Hello": "Ahoj",
            "Good bye": "Nashledanou",
            "My name is {name}": "Jmenuji se {name}"
         }

         const i18n = setupI18n()
         i18n.load({
            en: messagesEn,
            cs: messagesCs
         })

         // This is the same as loading message catalogs separately per language:
         // i18n.load({ en: messagesEn })
         // i18n.load({ cs: messagesCs })

      .. important:: Don't write catalogs manually

         Code above contains an example of message catalogs. In real applications,
         messages are loaded from external message catalogs generated by :cli:`compile`
         command.

         Formatting of messages as strings (e.g: ``"My name is {name}"``) works in
         development only, when messages are parsed on the fly. In production, however,
         messages must be compiled using :cli:`compile` command.

         The same example would in real application look like this:

         .. code-block:: js

            import { setupI18n } from "@lingui/core"

            // File generated by `lingui compile`
            import messagesEn from "./locale/en/messages.js"

            const i18n = setupI18n()
            i18n.load({
               en: messagesEn,
            })

   .. js:method:: activate(language [, locales])

      Activate a language and locales. :js:meth:`_` from now on will return messages
      in given language.

      .. code-block:: js

         import { setupI18n } from "@lingui/core"

         const i18n = setupI18n({ language: "en" })
         i18n._("Hello")           // Return "Hello" in English

         i18n.activate("cs")
         i18n._("Hello")           // Return "Hello" in Czech

   .. js:method:: use(language [, locales])

      Activate a language and locales locally. This method returns a new instance of
      :js:class:`I18n` and doesn't affect global language.

      .. code-block:: js

         import { setupI18n } from "@lingui/core"

         const i18n = setupI18n({ language: "en" })

         i18n.use("cs")._("Hello") // Return "Hello" in Czech
         i18n._("Hello")           // Return "Hello" in active language (English)

   .. js:method:: _(messageId [, values [, options]])

      The core method for translating and formatting messages.

      *messageId* is a unique message ID which identifies message in catalog.

      *values* is an object of variables used in translated message.

      *options.defaults* is the default translation (optional). This is mostly used when
      application doesn't use message IDs in natural language (e.g.: ``msg.id`` or
      ``Component.title``).

      .. code-block:: js

         import { setupI18n } from "@lingui/core"

         const i18n = setupI18n()

         // Simple message
         i18n._("Hello")

         // Message with variables
         i18n._("My name is {name}", { name: "Tom" })

         // Message with custom messageId
         i18n._("msg.id", { name: "Tom" }, { defaults: "My name is {name}" })

