---
title: Lingui vs react-intl
description: How Lingui compares with react-intl from FormatJS. Both use ICU MessageFormat, the differences are in rich text, macros, extraction tooling, compiled catalogs and bundle size
---

# Lingui vs react-intl

[react-intl](https://formatjs.github.io/docs/react-intl/) is the React binding of [FormatJS](https://formatjs.github.io/), a long-standing i18n project that also ships a Vue binding, a CLI and `Intl` polyfills. [Lingui](https://github.com/lingui/js-lingui) is a close relative: both libraries use ICU MessageFormat for messages, and their low-level APIs look almost the same. The differences are in how much of the message syntax you write yourself, how much the tooling does for you, and what ships to the browser.

## At a Glance

|                   | Lingui                                                                                                                        | react-intl (FormatJS)                                                                                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Writing messages  | Macros generate the ICU message from JSX or a template literal: `<Trans>Hello {name}</Trans>`                                 | You write the ICU string yourself: `<FormattedMessage defaultMessage="Hello {name}" values={{ name }} />`                                                               |
| Rich text         | Components inside a message are plain JSX. The translator sees `Read the <0>documentation</0>`                                | Each tag maps to a render function in `values`: `link: (chunks) => <a href="/docs">{chunks}</a>`                                                                        |
| Message IDs       | Generated from the source text by the macro, explicit IDs optional                                                            | Explicit `id`, or a generated hash with the Babel or SWC plugin or the TypeScript transformer                                                                           |
| Extraction        | `lingui extract` merges new messages into every locale's catalog, keeps existing translations and marks removed ones obsolete | `formatjs extract` writes the source messages to one JSON file. Translated files are handled separately, with formatters for Crowdin, Lokalise, Smartling and Transifex |
| Catalog format    | PO by default, which every translation tool opens. JSON, CSV and custom formatters available                                  | JSON, in the FormatJS layout or a translation platform's layout                                                                                                         |
| Runtime           | Catalogs are compiled at build time and no parser ships. Core and React bindings about 4 kB gzipped                           | Messages parsed at runtime unless pre-compiled with `formatjs compile --ast`. About 15 kB gzipped                                                                       |
| Server Components | `@lingui/react/server`. `Trans` works in server and client components alike                                                   | `react-intl/server` with `createIntl`. `FormattedMessage` and `useIntl` are client-only                                                                                 |
| Beyond React      | `@lingui/core` for Node.js and plain JS, bindings for React Native, Vue, SolidJS, Astro and Svelte                            | `@formatjs/intl` for plain JS, `vue-intl` for Vue                                                                                                                       |
| TypeScript        | Written in TypeScript. Opt-in typed message IDs via module augmentation                                                       | Written in TypeScript. Typed message IDs via the `FormatjsIntl` global namespace                                                                                        |

Bundle sizes were measured with [bundlejs](https://bundlejs.com/) in September 2026 for `@lingui/core` and `@lingui/react` 6.6 and `react-intl` 10.1, with `react` excluded.

## Basic Comparison

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

Each tag needs a function that receives the translated chunks and wraps them.

Lingui extends the ICU MessageFormat with tags. The above example would be:

```jsx
<Trans id="msg.docs" message="Read the <link>documentation</link>." components={{ link: <a href="/docs" /> }} />
```

The element is passed as it is, with no wrapper function, and the translator gets the message in one piece: `Read the <link>documentation</link>`.

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

FormatJS also has Babel and SWC plugins, but they generate message IDs and pre-compile messages. The ICU string in `defaultMessage` is still written by hand.

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

Using Lingui macros, we could combine [`Trans`](/ref/macro#trans) and [`Plural`](/ref/macro#plural-1) components:

```jsx
<Trans id="welcome">
  Hello <b>{name}</b>, you have {unreadCount} <Plural value={unreadCount} one="message" other="messages" />
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
  value={unreadMessages}
  one={
    <>
      Hello <b>{name}</b>, you have {unreadMessages} message.
    </>
  }
  other={
    <>
      Hello <b>{name}</b>, you have {unreadMessages} messages.
    </>
  }
/>
```

Even though both variants are syntactically valid in ICU MessageFormat, the second one is easier for translating, because (again) the translator gets the phrase in one piece.
:::

## Text Attributes

Components can't be used in some contexts, e.g. to translate text attributes. react-intl provides `formatMessage` from the `useIntl` hook for this. Lingui provides the `t` macro, which the [`useLingui`](/ref/macro#uselingui) macro binds to the `i18n` instance from the React context:

```jsx
import { useLingui } from "@lingui/react/macro";
import { plural } from "@lingui/core/macro";

function Flag({ name, count }) {
  const { t } = useLingui();

  return (
    <>
      <a title={t`The title of ${name}`}>{name}</a>
      <img alt={t`${plural(count, { one: "flag", other: "flags" })}`} src="..." />
    </>
  );
}
```

Custom IDs are supported as well:

```jsx
<a title={t({ id: "link.title", message: `The title of ${name}` })}>{name}</a>
<img alt={t({ id: "img.alt", message: plural(count, { one: "flag", other: "flags" }) })} src="..." />
```

## External Message Catalog

Let's say our application has been internationalized and we want to send the messages to the translator.

FormatJS ships a CLI: `formatjs extract` collects the source messages into a single JSON file, and `formatjs compile` turns the translated files you get back into the format react-intl consumes, verifying the ICU syntax on the way. Formatters for Crowdin, Lokalise, Smartling and Transifex are built in. Keeping the translated files in step with the source, and noticing which translations are stale, happens outside the CLI, usually in the translation platform.

Lingui's [CLI](/ref/cli) closes that loop itself. `lingui extract` merges new messages into every locale's catalog, keeps the existing translations and marks removed messages as obsolete, so each PO file always mirrors the current source and stale entries are visible at a glance. It supports both the Babel and SWC ecosystems for extracting messages.

## Compiling Messages

Parsing and formatting ICU messages is the largest part of an i18n runtime. Lingui compiles each message at build time into a small structure that the runtime fills with values, so neither a parser nor a MessageFormat compiler ships to the browser. This is what `lingui compile` does by default, with nothing to opt into. Plural rules come from `Intl.PluralRules`, so there is no locale data to load by hand.

react-intl parses messages at runtime by default. The FormatJS CLI can pre-compile messages to an AST with `formatjs compile --ast`, and pairing that with the parser-free build of `@formatjs/icu-messageformat-parser` cuts the bundle by about 40% according to the FormatJS docs. The formatter itself stays in the bundle.

## Summary

Both libraries use ICU MessageFormat and have similar low-level APIs, so porting from one to the other is mostly mechanical. What differs is how much of the work the library takes off your hands.

**Lingui:**

- Macros generate the message syntax from JSX and template literals. Rich text is written as plain JSX, and there is no ICU string to hand-write or keep in step with the code.
- Extraction and compilation are part of the core toolchain, and the CLI keeps every locale's catalog in step with the source. Catalogs are PO files by default, with JSON, CSV and custom formats available.
- Catalogs are compiled ahead of time. Core and React bindings together stay around 4 kB gzipped.
- The same core serves vanilla JS, Node.js, React Native, Vue, SolidJS, Astro and Svelte.

**react-intl:**

- Is one of the longest-standing i18n libraries for React, used in many production websites.
- Is part of FormatJS, whose `@formatjs/intl` core also powers `vue-intl` and whose polyfills fill gaps in the `Intl` API.
- Has lots of resources available online.

Because the message syntax is shared, an existing react-intl codebase can move to Lingui without rewriting its messages. Each `FormattedMessage` becomes a `Trans` with the same message, and from then on the ICU string is generated for you.
