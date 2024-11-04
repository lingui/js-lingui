---
title: Lingui vs react-intl
description: Comparison of Lingui and react-intl internationalization libraries
---

# Comparison with react-intl

[react-intl](https://github.com/formatjs/formatjs) (Format.js) is a popular and widely used i18n library for React. [Lingui](https://github.com/lingui/js-lingui) is very similar in many ways: both libraries use the same syntax for messages (ICU MessageFormat), and they also have a very similar API.

Here's an example from the react-intl docs:

```jsx
<FormattedMessage
  id="welcome"
  defaultMessage={`Hello {name}, you have {unreadCount, number} {unreadCount, plural,
     one {message}
     other {messages}
   }`}
  values={{ name: <b>{name}</b>, unreadCount }}
/>
```

Looking at the low-level API of Lingui, there isn't much difference:

```jsx
<Trans
  id="welcome"
  message={`Hello {name}, you have {unreadCount, number} {unreadCount, plural,
     one {message}
     other {messages}
   }`}
  values={{ name: <b>{name}</b>, unreadCount }}
/>
```

There's really no reason to reinvent the wheel when both libs are built on top of the same message syntax. The story doesn't end here, though.

## Translations with Rich-Text Markup

Suppose we have the following text:

```html
<p>Read the <a href="/docs">documentation</a>.</p>
```

In react-intl, this would be translated as:

```jsx
<FormattedMessage
  id="msg.docs"
  defaultMessage="Read the <link>documentation</link>."
  values={{
    link: (...chunks) => <a href="/docs">{chunks}</a>,
  }}
/>
```

Lingui extends the ICU MessageFormat with tags. The above example would be:

```jsx
<Trans id="msg.docs" message="Read the <link>documentation</link>." components={{ link: <a href="/docs" /> }} />
```

The translator gets the message in one piece: `Read the <link>documentation</link>`.

## Macros for Component-Based Message Syntax

Lingui provides powerful [Macros](/ref/macro) that automatically generate a message syntax.

Let's go back to the previous example:

```html
<p>Read the <a href="/docs">documentation</a>.</p>
```

All we need to do is to wrap the message in a [`Trans`](/ref/macro#trans) macro:

```html
<p>
  <Trans id="msg.docs">Read the <a href="/docs">documentation</a>.</Trans>
</p>
```

The macro will then parse the [`Trans`](/ref/macro#trans) macro children and automatically generate `message` and `components` props in the form described in the previous section.

This is very useful when adding i18n to an existing project. All we need to do is wrap all messages in the [`Trans`](/ref/macro#trans) macro.

Let's compare it to the react-intl solution to see the difference:

```jsx
<p>
  <FormattedMessage
    id="msg.docs"
    defaultMessage="Read the <link>documentation</link>."
    values={{
      link: (...chunks) => <a href="/docs">{chunks}</a>,
    }}
  />
</p>
```

:::note
It's also worth mentioning that the message IDs are completely optional. Lingui is unopinionated in this way and perfectly works with messages as IDs as well:

```html
<p>
  <Trans>Read the <a href="/docs">documentation</a>.</Trans>
</p>
```

The message ID is `Read the <0>documentation</0>.` instead of `msg.docs`. Both solutions have pros and cons and the library lets you choose the one which works best for you.

Read more about [Explicit vs Generated Message IDs](/guides/explicit-vs-generated-ids).
:::

## Plurals

Another very common linguistic feature is pluralization.

Let's take a look at the original example from react-intl docs:

```jsx
<FormattedMessage
  id="welcome"
  defaultMessage={`Hello {name}, you have {unreadCount, number} {unreadCount, plural,
     one {message}
     other {messages}
   }`}
  values={{ name: <b>{name}</b>, unreadCount }}
/>
```

Using Lingui macros, we could combine [`Trans`](/ref/macro#trans), [`Plural`](/ref/macro#plural-1) components and [`i18n.number`](/ref/core#i18n.number) macro:

```jsx
<Trans id="welcome">
  Hello <b>{name}</b>, you have {i18n.number(unreadCount)} <Plural one="message" other="messages" />
</Trans>
```

and the final message would be very similar:

```jsx
<Trans
  id="welcome"
  message={`Hello <0>{name}</0>, you have {unreadCount, number} {unreadCount, plural,
     one {message}
     other {messages}
   }`}
  values={{ name, unreadCount }}
/>
```

The only difference is the `<0>` tag in the message, since Lingui can handle components in variables as well as in the message itself.

:::note
It's worth mentioning here that this is not the best example of using plurals. Make your translators happy by moving plurals to the top of the message:

```jsx
<Plural
  id="welcome"
  value={number}
  one={
    <>
      Hello <b>{name}</b>, you have {i18n.number(unreadMessages)} message.
    </>
  }
  other={
    <>
      Hello <b>{name}</b>, you have {i18n.number(unreadMessages)} messages.
    </>
  }
/>
```

Even though both variants are syntactically valid in ICU MessageFormat, the second one is easier for translating, because (again) the translator gets the phrase in one piece.
:::

## Text Attributes

Components can't be used in some contexts, e.g. to translate text attributes. While react-intl provides JS methods (e.g. `formatMessage`) that return plain strings, Lingui provides its core library for such translations. And it also provides macros for these use cases!

Here are a few short examples:

```jsx
<a title={i18n._(t`The title of ${name}`)}>{name}</a>
<img alt={i18n._(plural({ value: count, one: "flag", other: "flags" }))} src="..." />
```

Custom IDs are supported as well:

```jsx
<a title={i18n._(t("link.title")`The title of ${name}`}>{name}</a>
<img alt={i18n._(plural("img.alt", { value: count, one: "flag", other: "flags" }))} src="..." />
```

:::note
To inject `i18n` object into props, you need to use [`useLingui`](/ref/react#uselingui) hook. It's very similar to `useIntl` from [react-intl](https://formatjs.io/docs/react-intl/api/#useintl-hook).
:::

## External Message Catalog

Let's say our application has been internationalized and we want to send the messages to the translator.

react-intl comes with the Babel plugin which extracts messages from individual files, but it's up to you to merge them into one file which you can send to translators.

Lingui provides a handy [`CLI`](/ref/cli) that extracts messages and merges them with any existing translations. It supports both the Babel and SWC ecosystems for extracting messages.

## Compiling Messages

The largest and slowest part of the i18n libraries are message parsers and formatters. Lingui compiles messages from MessageFormat syntax into JS functions that accept only values for interpolation (e.g. components, variables, etc.). This makes the final bundle smaller and the library faster.

The compiled catalogs are also bundled with locale data like plurals, so there's no need to load them manually.

## Summary

- both libraries use the same MessageFormat syntax.
- similar API (easy to port from one to the other).

**On top of that, Lingui:**

- Supports rich-text messages.
- Provides macros to simplify writing messages using MessageFormat syntax.
- Provides a CLI tool for extracting and compiling messages.
- Is very small, fast, flexible, and stable.
- Works for vanilla JS, Next.js, Vue.js, Node.js etc.
- Is actively maintained.

**On the other hand, react-intl:**

- Is the most popular and used i18n lib in React.
- Ss used in many production websites (stability).
- Has lots of resources available online.
