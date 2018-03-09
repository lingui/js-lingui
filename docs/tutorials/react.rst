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
                 ? "There's {messagesCount} message in your inbox."
                 : "There're {messagesCount} messages in your inbox."
             }
           </p>

           <footer>
             Last login on {lastLogin}.
           </footer>
         </div>
      )
   }

As you can see, it's a simple mailbox application with only one page.

Installing jsLingui
========================

jsLingui_ isn't just a package. It's a set of tools which helps you to
internationalize. You can pick whichever tool you want to use in your project.
We're trying to use most of them to show the full power of jsLingui.

Let's start with the three major packages:

``@lingui/react``
   React components for translation and formatting

``@lingui/babel-preset-react``
   Transforms messages wrapped in components from ``@lingui/react`` to ICU
   MessageFormat and validates them

``@lingui/cli``
   CLI for working with message catalogs

1. Install ``@lingui/babel-preset-react`` as a development dependency,
   ``@lingui/react`` as a runtime dependency and ``@lingui/cli`` globally:

   .. code-block:: shell

      npm install -g @lingui/cli
      npm install --save @lingui/react
      npm install --save-dev @lingui/babel-preset-react

2. Add ``@lingui/babel-preset-react`` preset to Babel config (e.g: ``.babelrc``):

   .. code-block:: json

      {
        "presets": [
          "env",
          "react",
          "@lingui/babel-preset-react"
        ]
      }

Now we have the environment up and running and we can start internationalizing our app!

Setup
=====

We will directly start translating the ``Inbox`` component, but we need
to complete one more step to setup our application.

Components needs to be aware of their active language. All jsLingui_ components
read translations and language settings from the context. In order to get this
information into the React context, we need to wrap our application in
:component:`I18nProvider` component.

Let's add all required imports and wrap our app inside :component:`I18nProvider`:

.. code-block:: jsx

   // index.js
   import React from 'react'
   import { render } from 'react-dom'
   import Inbox from './Inbox.js'

   import { I18nProvider } from '@lingui/react'

   const App = () => (
     <I18nProvider language="en">
       <Inbox />
     </I18nProvider>
   )

   render(<App />, document.getElementById('app'))

.. hint::

   You might be wondering: how are we going to change the active language?
   Yes, that's a great question, but we need to focus! We're not going to change
   the language unless we have translated the message catalog. And we won't have
   translated the catalog before we extract all messages from source.

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

   From now on, *internationalization* will be shortened to a common acronym *i18n*.

Let's start with the basics - static messages. These messages don't have any variables, HTML or components inside. 
Just some text:

.. code-block:: jsx

   <h1>Message Inbox</h1>

All we need to make this heading translatable is wrap it in :component:`Trans`
component:

.. code-block:: jsx

   <h1><Trans>Message Inbox</Trans></h1>

Yes, that's it. Let's move on to another paragraph. This paragraph has some
variables, some HTML and components inside:

.. code-block:: jsx

   <p>
      See all <Link to="/unread">unread messages</Link>{" or "}
      <a onClick={markAsRead}>mark them</a> as read.
   </p>

Nothing special here. Again, we just need to wrap the content in :component:`Trans`
component:

.. code-block:: jsx

   <p>
      <Trans>
         See all <Link to="/unread">unread messages</Link>{" or "}
         <a onClick={markAsRead}>mark them</a> as read.
      </Trans>
   </p>

Spooky, right? Let's pause for a while.

All children of :component:`Trans` component are transformed into ICU MessageFormat
syntax, which is the standard format for i18n.

This component:

.. code-block:: jsx

   <h1><Trans>Message Inbox</Trans></h1>

… is transformed into this:

.. code-block:: jsx

   <h1><Trans id="Message Inbox" /></h1>

It's more interesting with variables and components. Our paragraph:

.. code-block:: jsx

   <p>
      <Trans>
         See all <Link to="/unread">unread messages</Link>{" or "}
         <a onClick={markAsRead}>mark them</a> as read.
      </Trans>
   </p>

… is transformed into this:

.. code-block:: jsx

   <p>
      <Trans
         id="See all <0>unread messages</0> or <1>mark them</1> as read."
         components={[
            <Link to="/unread" />,
            <a onClick={markAsRead} />
         ]}
      />
   </p>

All these transformations happen under the hood and we don't need to
do them manually. However, it's good to know what's going on, because content
of ``id`` prop is *what our translators get*!

Let's make it clear -- when we have the following code:

.. code-block:: jsx

   <h1><Trans>Message Inbox</Trans></h1>

.. code-block:: jsx

   <p>
      <Trans>
         See all <Link to="/unread">unread messages</Link>{" or "}
         <a onClick={markAsRead}>mark them</a> as read.
      </Trans>
   </p>

… it will be transformed and these messages will be extracted for translators::

   Message Inbox
   See all <0>unread messages</0> or <1>mark them</1> as read.

You may notice that components and html tags are replaced with indexed
tags (`<0>`, `<1>`). This is a little extension to the ICU MessageFormat which
allows rich-text formatting inside translations. Components and their props
remains in the source code and don't scare our translators. Also, in case we
change a ``className``, we don't need to update our message catalogs. How
cool is that?

:component:`Trans` component
============================

It may look a bit *hackish* at first sight, but these transformations are
actually very easy, intuitive and feel very *Reactish*. We don't have to think
about the MessageFormat, because it's created by the library. We write our
components in the same way as we're used to and simply wrap text in
:component:`Trans` component.

Let's see some examples with MessageFormat equivalents:

.. code-block:: jsx

   // Expressions
   <p><Trans>Hello {name}</Trans></p>
   // Hello {name}

Any expression is allowed, not just simple variables. The only difference is,
the variable name won't be included in the extracted message:

Simple variable -> named argument
   .. code-block:: jsx

      <p><Trans>Hello {name}</Trans></p>
      // Hello {name}

Any expression -> positional argument
   .. code-block:: jsx

      <p><Trans>Hello {user.name}</Trans></p>
      // Hello {0}

Object, arrays, function calls -> positional argument
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
   // Dead Watson,<0/>it's not exactly what I had in my mind.

Obviously, you can also shoot yourself in the foot. Some expressions are *valid*
and won't throw any error, it doesn't make any sense to write:

.. code-block:: jsx

   // Oh, seriously?
   <Trans>
      {isOpen && <Modal />}
   </Trans>

Everytime you're in doubt, imagine how the final message should look like.

Message ID
==========

At this point we're going to explain what message ID is and how to set it manually.

Translators work with the *message catalogs*. No matter what format
we use (gettext, xliff, json), it's just mapping of
message ID to the translation.

Here's an example of simple message catalog in **Czech** language:

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

The message ID is *what all catalogs have in common* -- Lundi, Pondělí and Monday
represent the same message in different languages. It's also the same as the ``id``
prop in :component:`Trans` component.

There are two common approaches to message IDs:

1. Use source language (e.g. English as in example above)
2. Use a custom key (e.g. ``weekday.monday``)

Both approaches have their pros and cons and it's not in the scope of this tutorial
to compare them.

By default, jsLingui_ generates message ID from the content of :component:`Trans`
component, which means it uses source language. However, we can easily override
it by setting ``id`` prop manually:

.. code-block:: jsx

   <h1><Trans id="inbox.title">Message Inbox</Trans></h1>

This will generate:

.. code-block:: jsx

   <h1><Trans id="inbox.title" defaults="Message Inbox" /></h1>

In our message catalog, we'll see ``inbox.title`` as message ID, but we also
get ``Message Inbox`` as default translation for English language.

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

What's tricky is that different langauges use different number of plural forms.
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
`English plural rules <http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html#en>`_ we'll
need just two forms:

``one``
   Singular form

``other``
   Plural form

We don't need to select these forms manually. We'll use :component:`Plural`
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
message looks in MessageFormat syntax?

.. code-block:: jsx

   <p>
      <Trans
         id="{messagesCount, plural, one {There's # message in your inbox} other {There're # messages in your inbox}}"
         values={{ messagesCount }}
      />
   </p>

The :component:`Plural` is gone and replaced with :component:`Trans` again!
The purpose of :component:`Plural` is to generate proper syntax in message.

Our translator will work with this message::

   {messagesCount, plural,
      one {There's # message in your inbox}
      other {There're # messages in your inbox}
   }

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
wrap messages in :component:`Trans` component or use template literals
(suppose we have an variable ``name``):

.. code-block:: jsx

   <p>
      <Plural
         value={messagesCount}
         one={`There's # message in your inbox, ${name}`}
         other={<Trans>There're <strong>#</strong> messages in your inbox, {name}</Trans>}
      />
   </p>

:component:`Trans` component works as if it were the top-most i18n component,
without any limitation. We can use components, variables, expressions, whatever
works.

This gives us enough flexibility for all usecases.

Custom message ID
-----------------

Let's finish this with a short example of plurals with custom ID. We can
pass an ``id`` prop to :component:`Plural` as we would to :component:`Trans`:

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
to do manually. The heavylifting is done in `Intl object <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl>`_,
we'll just use :component:`DateTimeFormat` component:

.. code-block:: jsx

   <footer>
      <Trans>
         Last login on <DateTimeFormat value={lastLogin} />.
      </Trans>
   </footer>

This will format the date using the conventional format for the active language.

Review
======

After all modifications, the final component with i18n looks like this:

.. code-block:: jsx

   // Inbox.js
   import React from 'react'
   import { Trans, Plural, DateFormat } from '@lingui/react'

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
             <Trans>Last login on <DateFormat value={lastLogin} />.</Trans>
           </footer>
         </div>
       )
   }

Extracting messages
===================

Our work here is done and we can start working with message catalogs. First,
we need to extract all messages from the source code. jsLingui_ has a handy CLI
for this task, so let's pause here and go to :ref:`CLI tutorial <tutorial-cli>` to
add locales, extract messages and compile translated message catalogs.

Loading translations
====================

Take a look into our ``locale`` directory. There should be two files for each
locale:

``messages.json``
   Readable JSON with all languages and metadata (for translators)
``messages.js``
   Minified JS file with compiled messages (for application)

We'll just import a compiled message catalog and pass it to
:component:`I18nProvider`:

.. code-block:: jsx

   // index.js
   import React from 'react'
   import { render } from 'react-dom'
   import Inbox from './Inbox.js'

   import { I18nProvider } from '@lingui/react'

   import catalog from 'locale/cs/messages.js'

   const App = () => (
     <I18nProvider language="cs" catalogs={{ cs: catalog }}>
       <Inbox />
     </I18nProvider>
   )

   render(<App />, document.getElementById('app'))

The ``catalogs`` prop expects a dictionary of message catalogs in *all* languages,
but we can load them on demand. It depends on your setup and there's
an example :ref:`how to do it with webpack <dynamic-loading-catalogs>`.

Further reading
===============

- `@lingui/react reference documentation <../ref/lingui-react.html>`_
- `@lingui/cli reference documentation <../ref/lingui-cli.html>`_
- `Pluralization Guide <../guides/plurals.html>`_
