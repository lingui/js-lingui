**************************
Comparison with react-intl
**************************

`react-intl`_ is definitely the most popural and widely-used i18n library for React.
`jsLingui`_ is in many ways very similar: both libraries use the same syntax for
(messages ICU MessageFormat) and they also have very similar API.

Here's an example from `react-intl`_ docs:

.. code-block:: jsx

   <FormattedMessage
      id="welcome"
      defaultMessage={`Hello {name}, you have {unreadCount, number} {unreadCount, plural,
        one {message}
        other {messages}
      }`}
      values={{name: <b>{name}</b>, unreadCount}}
    />

Looking at the low-level API of `jsLingui`_, there isn't much difference:

.. code-block:: jsx

   <Trans
      id="welcome"
      defaults={`Hello {name}, you have {unreadCount, number} {unreadCount, plural,
        one {message}
        other {messages}
      }`}
      values={{name: <b>{name}</b>, unreadCount}}
    />

There's really no reason to reinvent the wheel when both libs are build on top of the
same message syntax. The story doesn't end here, though.

Translations with rich-text markup
==================================

Suppose we have a following text:

.. code-block:: html

   <p>Read the <a href="/docs>documentation</a>.</p>

In `react-intl`_, this would be translated as:

.. code-block:: jsx

   <FormattedMessage
       id='msg.docs'
       defaultMessage='Read the {link}.'
       values={{
           name: <a href="/docs">documentation</a>
       }}
   />

which isn't enough, because word ``documentation`` is still left untranslated.
Correct solution would be:

.. code-block:: jsx

   <FormattedMessage
       id='msg.docs'
       defaultMessage='Read the {link}.'
       values={{
           name: (
            <a href="/docs">
               <FormattedMessage id="msg.docs.link" defaultMessage="documentation" />
            </a>
           )
       }}
   />

but even this solution is sub-optimal, because translator gets two messages to translate:

.. code-block:: json

   {
      "msg.docs": "Read the {link}.",
      "msg.docs.link": "documentation"
   }

This is very fragile and error prone because phrases can't be translated word by word
in general.

`jsLingui`_ extends ICU MessageFormat with tags. The example above would be:

.. code-block:: jsx

   <Trans
       id='msg.docs'
       defaults='Read the <0>documentation</0>.'
       components={[
           <a href="/docs" />
       ]}
   />

and translator gets the message in one piece: ``Read the <0>documentation</0>``.

However, we still go one level deeper.

Plugin for component-based message syntax
=========================================

`jsLingui`_ provides ``@lingui/babel-preset-react`` which generates message syntax
automatically.

Let's go back to the previous example:

.. code-block:: html

   <p>
      Read the <a href="/docs>documentation</a>.
   </p>

When using babel plugin, all we need to do is wrap the message in
:component:`Trans` component:

.. code-block:: html

   <p>
      <Trans id="msg.docs">Read the <a href="/docs>documentation</a>.</Trans>
   </p>

Babel plugin then parses children of :component:`Trans` component and generates
``defaults`` and ``components`` props automaticaly in a form we saw in previous section.

.. note::

   Upcoming `jsLingui`_ 3.0 will be even easier to use, because instead of plugins
   it uses babel macros. They are much easier to use and  work with Create React App
   without ejecting.

This is extremly useful when adding i18n to existing project. All we need to do is wrap
all messages in :component:`Trans` component.

Let's compare it with `react-intl`_ solution to see the difference:

.. code-block:: jsx

   <p>
      <FormattedMessage
          id='msg.docs'
          defaultMessage='Read the {link}.'
          values={{
              name: (
               <a href="/docs">
                  <FormattedMessage id="msg.docs.link" defaultMessage="documentation" />
               </a>
              )
          }}
      />
   </p>

.. note::

   It' also worth mentioning that the message IDs are completely optional.
   `jsLingui`_ is unopinionated in this way and perfectly works with messages as IDs as
   well:

   .. code-block:: html

      <p>
         <Trans>Read the <a href="/docs>documentation</a>.</Trans>
      </p>

   Message ID is ``Read the <0>documentation</0>.`` instead of ``msg.id``. Both
   solutions has pros and cons and library let you choose the one which works for you.

Plurals
=======

Another very common linguistic feature is pluralization.

Let's take a look at original example from `react-intl`_ docs:

.. code-block:: jsx

   <FormattedMessage
      id="welcome"
      defaultMessage={`Hello {name}, you have {unreadCount, number} {unreadCount, plural,
        one {message}
        other {messages}
      }`}
      values={{name: <b>{name}</b>, unreadCount}}
    />

Using `jsLingui`_ plugins, we could combine :component:`Trans`, :component:`Plural` and
:component:`NumberFormat` components:

.. code-block:: jsx

   <Trans id="welcome">
      Hello <b>{name}</b>, you have <NumberFormat value={number} /> <Plural
         one="message"
         other="messages"
      />
   </Trans>

and the final message would be very similar:

.. code-block:: jsx

   <Trans
      id="welcome"
      defaults={`Hello <0>{name}</0>, you have {unreadCount, number} {unreadCount, plural,
        one {message}
        other {messages}
      }`}
      values={{name, unreadCount}}
    />

The only difference is `<0>` tag included in message, because `jsLingui`_ handles
both components in variables and message itself.

.. note::

   It's good to mention here that this isn't the best example of using plurals.
   Make your translators happy and move plurals to the top of the message:

   .. code-block:: jsx

      <Plural
         id="welcome"
         one={Hello <b>{name}</b>, you have <NumberFormat value={number} message.}
         other={Hello <b>{name}</b>, you have <NumberFormat value={number} messages.}
      />

   Even though both variants are syntactically valid in ICU MessageFormat, the second
   one is easier for translating, because (again) translator gets the phrase in one
   piece.

Text attributes
===============

Components can't be used in some contexts, e.g: for translation of text attributes.
As `react-intl`_ provides JS methods (e.g: ``formatMessage``) which return plain
strings, `jsLingui`_ uses core library for such translations. And it also provides
plugins for these usecases!

Few short examples:

.. code-block:: jsx

   <a title={i18n.t`The title of ${name}`}>{name}</a>
   <img alt={i18n.plural({ value: count, one: "flag", other: "flags" })} src="..." />

These examples are transformed into low-level API calls:

.. code-block:: jsx

   <a title={i18n._("The title of {name}", { name })>{name}</a>
   <img alt={i18n._("{count, plural, one {flag} other {flags}}", { count } )} src="..." />

Custom IDs are supported as well:

.. code-block:: jsx

   <a title={i18n.t("link.title")`The title of ${name}`}>{name}</a>
   <img alt={i18n.plural({ id: "img.alt", value: count, one: "flag", other: "flags" })} src="..." />

.. note::

   To inject ``i18n`` object into props, you need to use HOC :js:meth:`withI18n`. It's
   very similar to ``injectIntl`` from `react-intl`_.

External message catalog
========================

We have our app internationalized and now we want to send messages to translator.

`react-intl`_ comes with babel plugin which extracts messages from individual files,
but it's up to you to merge them into one file which you can send to translators.

`jsLingui`_ provides handy `CLI <../tutorials/cli>`_ which extracts messages and merges
them with any existing translations. Again, the story doesn't end here.

Compiling messages
==================

The biggest and slowest part of i18n libraries are message parsers and formatters.
`jsLingui`_ compiles messages from MessageFormat syntax into JS functions which only
accept values for interpolation (e.g. components, variables, ets). This makes
final bundle smaller and library faster. Compiled catalogs are also bundled with locale
data like plurals, so it's not necessary to load them manually.

Disadvatages of jsLingui
========================

`react-intl`_ has been around for some time and it's definitely more popular, more used
and lot of production sites are running it. The community is larger and it's much
easier to get a help of StackOverflow or other sites.

`jsLingui`_ is very new library and the community is very small at the moment. It's
not tested on many production sites. On the other hand, the testing suit of `jsLingui`_
is very large and all examples are part of integration testing suit to make sure
everything is working fine.

Also, `jsLingui`_ is actively maintained. Bug fixes are fixed regularly and new
features are constantly coming in. At the moment there's work on progress on
code splitting in webpack, so only messages related to code in chunk are loaded.

Summary
=======

- both libraries use the same MessageFormat syntax
- similar API (easy to port from one to another)

On top of that, `jsLingui`_:

- supports rich-text messages
- provides plugins to simlify writing messages using MessageFormat syntax
- provides CLI for extracting and compiling messages
- is very small (<5kb gzipped) and fast
- works also in vanilla JS (without React)
- is actively maintained

On the other hand, `react-intl`_:

- is the most popular and used i18n lib in React
- is used in many production websites (stability)
- has lot of resources available online

Discussion
==========

Do you have any comments or questions? Join discussion at
`gitter <https://gitter.im/lingui/js-lingui>`_ or raise an
`issue <https://github.com/lingui/js-lingui/issues/new>`_. Any feedback welcome!

.. _react-intl: https://github.com/yahoo/react-intl
.. _jsLingui: https://github.com/lingui/js-lingui
