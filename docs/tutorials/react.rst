.. _react-tutorial-label:

*********************************************
Tutorial - Internationalization of React apps
*********************************************

Through this tutorial, we'll learn how to add internationalization
to an existing application in React JS.

Let's Start
==============

We're going to translate the following app:

.. code-block:: jsx

   // index.js
   import React from 'react'
   import { render } from 'react-dom'
   import Inbox from './Inbox.js'

   const App = () => <Inbox />

   render(<App />, document.getElementById('app'))

.. code-block:: jsx

   // Inbox.js
   import React from 'react'

   const Inbox = ({ messages, markAsRead, user }) => {
      const messagesCount = messages.length
      const { name, lastLogin } = user

      return (
         <div>
           <h1>Message Inbox</h1>

           <p>
             See all <Link to="/unread">unread messages</Link>{" or "}
             <a onClick={markAsRead}>mark them</a> as read.
           </p>

           <p>
             {
               messagesCount === 1
                 ? `There's ${messagesCount} message in your inbox.`
                 : `There're ${messagesCount} messages in your inbox.`
             }
           </p>

           <footer>
             Last login on {lastLogin}.
           </footer>
         </div>
      )
   }

As you can see, it's a simple mailbox application with only one page.

Installing LinguiJS
===================

Follow setup guide either for projects using :doc:`LinguiJS with Create React App </tutorials/setup-cra>`
or for general :doc:`React projects </tutorials/setup-react>`.

Setup
=====

We will directly start translating the ``Inbox`` component, but we need
to complete one more step to setup our application.

Components needs to be aware of their active language. All LinguiJS_ components
read translations and language settings from the React context. In order to get this
information into the context, we need to wrap our application in
:component:`I18nProvider` component.

Let's add all required imports and wrap our app inside :component:`I18nProvider`:

.. code-block:: jsx

   // index.js
   import React from 'react'
   import { render } from 'react-dom'
   import Inbox from './Inbox.js'

   import { I18nProvider } from '@lingui/react'
   import { setupI18n } from '@lingui/core'

   const i18n = setupI18n()
   i18n.load('en', catalogEn)
   i18n.activate('en')

   const App = () => (
     <I18nProvider i18n={i18n}>
       <Inbox />
     </I18nProvider>
   )

   render(<App />, document.getElementById('app'))

.. hint::

   You might be wondering: how are we going to change the active language?
   That's what the :js:meth:`I18n.load` and :js:meth:`I18n.activate` calls are for! However, we cannot change the language unless we have the translated message catalog. And to get the catalog, we first need to extract all messages from the source code.

   Let's deal with language switching later… but if you're still curious,
   take a look at :ref:`example <dynamic-loading-catalogs>` with Redux and Webpack.

Introducing internationalization
================================

Now we're finally going to *translate* our app. Actually, we aren't going
to *translate* from one language to another right now. Instead, we're going to
*prepare* our app for translation. This process is called
*internationalization* and you should practice saying this word aloud until
you're able to say it three times very quickly.

.. note::

   From now on, *internationalization* will be shortened to a common numeronym *i18n*.

Let's start with the basics - static messages. These messages don't have any variables,
HTML or components inside. Just some text:

.. code-block:: jsx

   <h1>Message Inbox</h1>

All we need to make this heading translatable is wrap it in :jsxmacro:`Trans`
macro:

.. code-block:: jsx

   import { Trans } from '@lingui/macro';
   
   <h1><Trans>Message Inbox</Trans></h1>

Macros vs. Components
---------------------

If you're wondering what Babel macros are and what's the difference between macros and
components, this short paragraph is for you.

In general, macros are executed at compile time and they transform source code in
some way. We use this feature in LinguiJS_ to simplify writing messages.

Under the hood, all JSX macros are transformed into :component:`Trans` component.
Take a look at this short example. This is what we write:

.. code-block:: jsx

   import { Trans } from '@lingui/macro'

   <Trans>Hello {name}</Trans>

And this is how the code is transformed:

.. code-block:: jsx

   import { Trans } from '@lingui/react'

   <Trans id="Hello {name}" values={{ name }} />

See the difference? :component:`Trans` component receives ``id`` prop with a message
in ICU MessageFormat syntax. We could write it manually, but it's just easier
and shorter to write JSX as we're used to and let macros to generate message for
ourselves.

Extracting messages
-------------------

Back to our project. It's nice to use JSX and let macros generate messages under the
hood. Let's check that it actually works correctly.

All messages from the source code must be extracted into external message catalogs.
Message catalogs are interchange files between developers and translators. We're
going to have one file per language. Let's enter command line for a while.

We're going to use `CLI` again. Run :cli:`extract` command to extract messages::

   $ lingui extract

   No locales defined!

   (use "lingui add-locale <language>" to add one)

Oops! Seems we forgot something. First we need to tell the CLI what locales we're
going to use in our app. Let's start with two locales: ``en`` for English and ``cs``
for Czech::

   $ lingui add-locale en cs

   Added locale en.
   Added locale cs.

   (use "lingui extract" to extract messages)

Everything went well and CLI guides us what to do next. Let's run :cli:`extract` command
again::

   $ lingui extract

   Catalog statistics:
   ┌──────────┬─────────────┬─────────┐
   │ Language │ Total count │ Missing │
   ├──────────┼─────────────┼─────────┤
   │ cs       │      1      │    1    │
   │ en       │      1      │    1    │
   └──────────┴─────────────┴─────────┘

   (use "lingui add-locale <language>" to add more locales)
   (use "lingui extract" to update catalogs with new messages)
   (use "lingui compile" to compile catalogs for production)

Nice! It seems it worked, we have two message catalogs (one per each locale) with
1 message each. Let's take a look at file ``locale/cs/messages.json``

.. code-block:: json

   {
      "Message Inbox": ""
   }

That's the message we've wrapped inside :jsxmacro:`Trans` macro!

Let's add a Czech translation:

.. code-block:: json

   {
      "Message Inbox": "Příchozí zprávy"
   }

If we run :cli:`extract` command again, we'll see that all Czech messages are translated::

   $ lingui extract

   Catalog statistics:
   ┌──────────┬─────────────┬─────────┐
   │ Language │ Total count │ Missing │
   ├──────────┼─────────────┼─────────┤
   │ cs       │      1      │    0    │
   │ en       │      1      │    1    │
   └──────────┴─────────────┴─────────┘

   (use "lingui add-locale <language>" to add more locales)
   (use "lingui extract" to update catalogs with new messages)
   (use "lingui compile" to compile catalogs for production)

That's great! So, how we're going to load it into your app? LinguiJS_ introduces
concept of compiled message catalogs. Before we load messages into your app, we need
to compile them. As you see in the help in command output, we use :cli:`compile` for that::

   $ lingui compile

   Compiling message catalogs…
   Done!

What just happened? If you look inside ``locales`` directory, you'll see there's a
new file for each locale: ``messages.js``. This file contains compiled message catalogs
but also any locale specific data like plurals.

Let's load this file into our app and set active language to ``cs``:

.. code-block:: jsx
   :emphasize-lines: 5,10

   // index.js
   import React from 'react'
   import { render } from 'react-dom'
   import Inbox from './Inbox.js'
   import catalogCs from './locales/cs/messages.js'

   import { setupI18n, I18nProvider } from '@lingui/react'

   const i18n = setupI18n()
   i18n.load('cs', catalogCs)
   i18n.activate('cs')

   const catalogs = { cs: catalogCs };
   const App = () => (
     <I18nProvider i18n={i18n}>
       <Inbox />
     </I18nProvider>
   )

   render(<App />, document.getElementById('app'))

When we run the app, we see the inbox header is translated into Czech.

Summary of basic workflow
-------------------------

Let's go through the workflow again:

1. Add an :component:`I18nProvider`, this component provides the active language and catalog(s) to other components
2. Wrap messages in :jsxmacro:`Trans` macro
3. Run :cli:`extract` command to generate message catalogs
4. Translate message catalogs (send them to translators usually)
5. Run :cli:`compile` to create runtime catalogs
6. Load runtime catalog
7. Profit

Steps 1 and 7 needs to be done only once per project and locale. Steps 2 to 5 become
the common workflow for internationalizing the app.

It isn't necessary to extract/translate messages one by one. This usually happens
in batches. When you finalize your work or PR, run :cli:`extract` to generate latest
message catalogs and before building the app for production, run :cli:`compile`.

For more info about CLI, checkout the :ref:`CLI tutorial <tutorial-cli>`.

Formatting
==========

Let's move on to another paragraph in our project. This paragraph has some
variables, some HTML and components inside:

.. code-block:: jsx

   <p>
      See all <Link to="/unread">unread messages</Link>{" or "}
      <a onClick={markAsRead}>mark them</a> as read.
   </p>

Although it looks complex, there's really nothing special here. Just wrap the content
of the paragraph in :jsxmacro:`Trans` and let the macro do the magic:

.. code-block:: html

   <p>
      <Trans>
         See all <Link to="/unread">unread messages</Link>{" or "}
         <a onClick={markAsRead}>mark them</a> as read.
      </Trans>
   </p>

Spooky, right? Let's see how this message actually looks in the message catalog.
Run :cli:`extract` command and take a look at the message::

   See all <0>unread messages</0> or <1>mark them</1> as read.

You may notice that components and html tags are replaced with indexed
tags (`<0>`, `<1>`). This is a little extension to the ICU MessageFormat which
allows rich-text formatting inside translations. Components and their props
remain in the source code and don't scare our translators. The tags in the extracted message won't scare our translators either: their are used to seeing tags and their tools support them. Also, in case we
change a ``className``, we don't need to update our message catalogs. How
cool is that?

JSX to MessageFormat transformations
------------------------------------

It may look a bit *hackish* at first sight, but these transformations are
actually very easy, intuitive and feel very *Reactish*. We don't have to think
about the MessageFormat, because it's created by the library. We write our
components in the same way as we're used to and simply wrap text in the
:jsxmacro:`Trans` macro.

Let's see some examples with MessageFormat equivalents:

.. code-block:: jsx

   // Expressions
   <p><Trans>Hello {name}</Trans></p>
   // Hello {name}

Any expressions are allowed, not just simple variables. The only difference is,
only the variable name will be included in the extracted message:

Simple variable -> named argument:

   .. code-block:: jsx

      <p><Trans>Hello {name}</Trans></p>
      // Hello {name}

Any expression -> positional argument:

   .. code-block:: jsx

      <p><Trans>Hello {user.name}</Trans></p>
      // Hello {0}

Object, arrays, function calls -> positional argument:

   .. code-block:: jsx

      <p><Trans>The random number is {Math.rand()}</Trans></p>
      // The random number is {0}

Components might get tricky, but like we saw, it's really easy:

.. code-block:: jsx

   <Trans>Read <a href="/more">more</a>.</Trans>
   // Read <0>more</0>.

.. code-block:: jsx

   <Trans>
      Dear Watson,<br />
      it's not exactly what I had in my mind.
   </Trans>
   // Dear Watson,<0/>it's not exactly what I had in my mind.

Obviously, you can also shoot yourself in the foot. Some expressions are *valid*
and won't throw any error, yet it doesn't make any sense to write:

.. code-block:: jsx

   // Oh, seriously?
   <Trans>
      {isOpen && <Modal />}
   </Trans>

If in doubt, imagine how the final message should look like.

Message ID
----------

At this point we're going to explain what message ID is and how to set it manually.

Translators work with the *message catalogs* we saw above. No matter what format
we use (gettext, xliff, json), it's just a mapping of
a message ID to the translation.

Here's an example of a simple message catalog in **Czech** language:

=============== ===========
Message ID      Translation
=============== ===========
Monday          Pondělí
Tuesday         Úterý
Wednesday       Středa
=============== ===========

… and the same catalog in **French** language:

=============== ===========
Message ID      Translation
=============== ===========
Monday          Lundi
Tuesday         Mardi
Wednesday       Mercredi
=============== ===========

The message ID is *what all catalogs have in common* -- Lundi and Pondělí
represent the same message in different languages. It's also the same as the ``id``
prop in :jsxmacro:`Trans` macro.

There are two approaches to how a message ID can be created:

1. Using the source language (e.g. ``Monday`` from English, as in example above)
2. Using a custom id (e.g. ``weekday.monday``)

Both approaches have their pros and cons and it's not in the scope of this tutorial
to compare them.

By default, LinguiJS_ generates message ID from the content of :jsxmacro:`Trans`
macro, which means it uses the source language. However, we can easily override
it by setting the ``id`` prop manually:

.. code-block:: jsx

   <h1><Trans id="inbox.title">Message Inbox</Trans></h1>

This will generate:

.. code-block:: jsx

   <h1><Trans id="inbox.title" defaults="Message Inbox" /></h1>

In our message catalog, we'll see ``inbox.title`` as message ID, but we also
get ``Message Inbox`` as default translation for English.

For the rest of this tutorial, we'll use auto-generated message IDs to keep
it simple.

Plurals
=======

Let's move on and add i18n to another text in our component:

.. code-block:: jsx

   <p>
      {
         messagesCount === 1
            ? "There's {messagesCount} message in your inbox."
            : "There're {messagesCount} messages in your inbox."
      }
   </p>

This message is a bit special, because it depends on the value of the ``messagesCount``
variable. Most languages use different forms of words when describing quantities
- this is called `pluralization <https://en.wikipedia.org/wiki/Plural>`_.

What's tricky is that different languages use different number of plural forms.
For example, English has only two forms - singular and plural - as we can see
in the example above. However, Czech language has three plural forms. Some
languages have up to 6 plural forms and some don't have plurals at all!

.. hint::

   Plural forms for all languages can be found in the
   `CLDR repository <http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html>`_.

English plural rules
--------------------

How do we know which plural form we should use? It's very simple:
we, as developers, only need to know plural forms of the language we use in
our source. Our component is written in English, so looking at
`English plural rules <http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html#en>`_ we'll need just two forms:

``one``
   Singular form

``other``
   Plural form

We don't need to select these forms manually. We'll use :jsxmacro:`Plural`
component, which takes a ``value`` prop and based on the active language, selects
the right plural form:

.. code-block:: jsx

   <p>
      <Plural
         value={messagesCount}
         one="There's # message in your inbox"
         other="There're # messages in your inbox"
      />
   </p>

This component will render ``There's 1 message in your inbox`` when
``messageCount = 1`` and ``There're # messages in your inbox`` for any other
values of ``messageCount``. ``#`` is a placeholder, which is replaced with ``value``.

Cool! Curious how this component is transformed under the hood and how the
message looks in MessageFormat syntax? Run :cli:`extract` command and find out by
yourself::

   {messagesCount, plural,
      one {There's # message in your inbox}
      other {There're # messages in your inbox}}

In the catalog, you'll see the message in one line. Here we wrapped it to make it more readable.

The :jsxmacro:`Plural` is gone and replaced with :component:`Trans` again!
The sole purpose of :jsxmacro:`Plural` is to generate proper syntax in message.

Things are getting a bit more complicated, but i18n is a complex process. At
least we don't have to write this message manually!

Beware of zeroes!
-----------------

Just a short detour, because it's a common misunderstanding.

You may wonder, why the following code doesn't work as expected:

.. code-block:: jsx

   <Plural
      value={messagesCount}
      zero="There're no messages"
      one="There's # message in your inbox"
      other="There're # messages in your inbox"
   />

This component will render ``There're 0 messages in your inbox`` for
``messagesCount = 0``. Why so? Because English doesn't have ``zero``
`plural form <http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html#en>`_.

Looking at `English plural rules <http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html#en>`_, it's:

= =====================
N Form
= =====================
0 other
1 one
n other (anything else)
= =====================

However, decimal numbers (even ``1.0``) use ``other`` form every time::

   There're 0.0 messages in your inbox.

Aren't languages beautiful? 

Exact forms
-----------

Alright, back to our example. What if we really want to render ``There're no messages``
for ``messagesCount = 0``? Exact forms to the rescue!

.. code-block:: jsx

   <Plural
      value={messagesCount}
      _0="There're no messages"
      one="There's # message in your inbox"
      other="There're # messages in your inbox"
   />

What's that ``_0``? MessageFormat allows exact forms, like ``=0``. However,
React props can't start with ``=`` and can't be numbers either, so we need to
write ``_N`` instead of ``=0``.

It works with any number, so we can go wild and customize it this way:

.. code-block:: jsx

   <Plural
      value={messagesCount}
      _0="There're no messages"
      _1="There's one message in your inbox"
      _2="There're two messages in your inbox, that's not much!"
      other="There're # messages in your inbox"
   />

… and so on. Exact matches always take precedence before plural forms.

Variables and components
------------------------

Let's go back to our original pluralized message:

.. code-block:: jsx

   <p>
      <Plural
         value={messagesCount}
         one="There's # message in your inbox"
         other="There're # messages in your inbox"
      />
   </p>

What if we want to use variables or components inside messages? Easy! Either
wrap messages in :jsxmacro:`Trans` macro or use template literals
(suppose we have a variable ``name``):

.. code-block:: html

   <p>
      <Plural
         value={messagesCount}
         one={`There's # message in your inbox, ${name}`}
         other={<Trans>There're <strong>#</strong> messages in your inbox, {name}</Trans>}
      />
   </p>

We can use nested macros, components, variables, expressions, really anything.

This gives us enough flexibility for all usecases.

Custom message ID
-----------------

Let's finish this with a short example of plurals with custom ID. We can
pass an ``id`` prop to :jsxmacro:`Plural` as we would to :jsxmacro:`Trans`:

.. code-block:: jsx

   <p>
      <Plural
         id="Inbox.messagesCount"
         value={messagesCount}
         one="There's # message in your inbox"
         other="There're # messages in your inbox"
      />
   </p>

Formats
=======

The last message in our component is again a bit specific:

.. code-block:: jsx

   <footer>
      Last login on {lastLogin}.
   </footer>

``lastLogin`` is a date object and we need to format it properly. Dates are
formatted differently in different languages, but we don't have
to do this manually. The heavylifting is done by the `Intl object <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl>`_, we'll just use :jsmacro:`date` macro:

.. code-block:: jsx

   <footer>
      <Trans>
         Last login on {date(lastLogin)} />.
      </Trans>
   </footer>

This will format the date using the conventional format for the active language.

Review
======

After all modifications, the final component with i18n looks like this:

.. code-block:: jsx

   // Inbox.js
   import React from 'react'
   import { Trans, Plural, date } from '@lingui/macro'

   const Inbox = ({ messages, markAsRead, user }) => {
     const messagesCount = messages.length
     const { name, lastLogin } = user

     return (
         <div>
           <h1><Trans>Message Inbox</Trans></h1>

           <p>
             <Trans>
               See all <Link to="/unread">unread messages</Link>{" or "}
               <a onClick={markAsRead}>mark them</a> as read.
             </Trans>
           </p>

           <p>
             <Plural
               value={messagesCount}
               one="There's # message in your inbox."
               other="There're # messages in your inbox."
             />
           </p>

           <footer>
             <Trans>Last login on {date(lastLogin)} />.</Trans>
           </footer>
         </div>
       )
   }

That's all for this tutorial! Checkout the reference documentation or various guides
in the documentation for more info and happy internationalizing!

Further reading
===============

- `@lingui/react reference documentation <../ref/react.html>`_
- `@lingui/cli reference documentation <../ref/cli.html>`_
- `Pluralization Guide <../guides/plurals.html>`_
