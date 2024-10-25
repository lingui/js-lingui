---
title: React i18n with Lingui
description: Learn how to add internationalization to a React application using Lingui
---

# Internationalization of React Apps

In this tutorial, we'll learn how to add internationalization (i18n) to an existing React JS application.

## Let's Start

We're going to translate the following app:

```jsx title="src/index.js"
import React from "react";
import { render } from "react-dom";
import Inbox from "./Inbox";

const App = () => <Inbox />;

render(<App />, document.getElementById("root"));
```

```jsx title="src/Inbox.js"
import React from "react";

export default function Inbox() {
  const messages = [{}, {}];
  const messagesCount = messages.length;
  const lastLogin = new Date();
  const markAsRead = () => {
    alert("Marked as read.");
  };

  return (
    <div>
      <h1>Message Inbox</h1>

      <p>
        See all <a href="/unread">unread messages</a>
        {" or "}
        <a onClick={markAsRead}>mark them</a> as read.
      </p>

      <p>
        {messagesCount === 1
          ? `There's ${messagesCount} message in your inbox.`
          : `There are ${messagesCount} messages in your inbox.`}
      </p>

      <footer>Last login on {lastLogin.toLocaleDateString()}.</footer>
    </div>
  );
}
```

As you can see, it's a simple mailbox application with only one page.

## Installing Lingui

Follow the [React Project](/docs/tutorials/setup-react.mdx) setup guide.

## Setup

We will directly start translating the `Inbox` component, but we need to complete one more step to setup our application.

Components need to read information about current language and message catalogs from `i18n` instance. Initially, you can use the one created and exported from `@lingui/core` and later you can replace with your one if such need arises.

Lingui uses the `I18nProvider` to pass the instance `i18n` to your React components.

Let's add all required imports and wrap our app inside [`I18nProvider`](/docs/ref/react.md#i18nprovider):

```jsx title="src/index.js"
import React from "react";
import { render } from "react-dom";

import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { messages } from "./locales/en/messages";
import Inbox from "./Inbox";

i18n.load("en", messages);
i18n.activate("en");

const App = () => (
  <I18nProvider i18n={i18n}>
    <Inbox />
  </I18nProvider>
);

render(<App />, document.getElementById("root"));
```

:::tip
You might be wondering: how are we going to change the active language? That's what the [`I18n.load`](/docs/ref/core.md#i18n.load) and [`i18n.activate`](/docs/ref/core.md#i18n.activate) calls are for! However, we cannot change the language unless we have the translated message catalog. And to get the catalog, we first need to extract all messages from the source code.

Let's deal with language switching later... but if you're still curious, take a look at [example](/docs/guides/dynamic-loading-catalogs.md) with Redux and Webpack.
:::

## Introducing Internationalization

Now we're finally going to _translate_ our app. Actually, we aren't going to _translate_ from one language to another right now. Instead, we're going to _prepare_ our app for translation. This process is called _internationalization_ and you should practice saying this word aloud until you're able to say it three times very quickly.

:::note
From now on, _internationalization_ will be shortened to a common numeronym _i18n_.
:::

Let's start with the basics - static messages. These messages don't have any variables, HTML or components inside. Just some text:

```jsx
<h1>Message Inbox</h1>
```

All we need to make this heading translatable is wrap it in [`Trans`](/docs/ref/macro.mdx#trans) macro:

```jsx
import { Trans } from "@lingui/macro";

<h1>
  <Trans>Message Inbox</Trans>
</h1>;
```

### Macros vs. Components

If you're wondering what macros are and what's the difference between macros and components, this short paragraph is for you.

In general, macros are executed at compile time and they transform source code in some way. We use this feature in [Lingui](https://github.com/lingui/js-lingui) to simplify writing messages.

Under the hood, all JSX macros are transformed into [`Trans`](/docs/ref/react.md#trans) component. Take a look at this short example. This is what we write:

```jsx
import { Trans } from "@lingui/macro";

<Trans>Hello {name}</Trans>;
```

And this is how the code is transformed:

```jsx
import { Trans } from "@lingui/react";

<Trans id="OVaF9k" message="Hello {name}" values={{ name }} />;
```

See the difference? [`Trans`](/docs/ref/react.md#trans) component receives `id` and `message` props with a message in ICU MessageFormat syntax.
We could write it manually, but it's just easier and shorter to write JSX as we're used to and let macros generate the message for us.

Another advantage of using macros is that all non-essential properties are excluded from the production build. This results in a significant reduction in the size footprint for internationalization.

```jsx
// NODE_ENV=production
import { Trans } from "@lingui/react";

<Trans id="OVaF9k" values={{ name }} />;
```

### Extracting Messages

Back to our project. It's nice to use JSX and let macros generate messages under the hood. Let's check that it actually works correctly.

All messages from the source code must be extracted into external message catalogs. Message catalogs are interchange files between developers and translators. We're going to have one file per language. Let's enter command line for a while.

We're going to use [CLI](/docs/ref/cli.md) again. Run [`extract`](/docs/ref/cli.md#extract) command to extract messages:

```bash
> lingui extract

Lingui was unable to find a config!

Create 'lingui.config.js' file with Lingui configuration in root of your project (next to package.json). See https://lingui.dev/ref/conf
```

We need to create the `lingui.config.js` file:

```js title="lingui.config.js"
/** @type {import('@lingui/conf').LinguiConfig} */
const config = {
  locales: ["cs", "en"],
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}/messages",
      include: ["src"],
    },
  ],
  compileNamespace: "es",
};

export default config;
```

After adding the configuration file, let's run [`extract`](/docs/ref/cli.md#extract) command again:

```bash
> lingui extract

Catalog statistics:
┌──────────┬─────────────┬─────────┐
│ Language │ Total count │ Missing │
├──────────┼─────────────┼─────────┤
│ cs       │      1      │    1    │
│ en       │      1      │    1    │
└──────────┴─────────────┴─────────┘

(use "lingui extract" to update catalogs with new messages)
(use "lingui compile" to compile catalogs for production)
```

Nice! It seems it worked, we have two message catalogs (one per each locale) with 1 message each. Let's take a look at file `src/locales/cs/messages.po`:

```gettext title="src/locales/cs/messages.po"
msgid ""
msgstr ""
"POT-Creation-Date: 2021-07-22 21:44+0900\n"
"MIME-Version: 1.0\n"
"Content-Type: text/plain; charset=utf-8\n"
"Content-Transfer-Encoding: 8bit\n"
"X-Generator: @lingui/cli\n"
"Language: cs\n"

#: src/Inbox.js:12
msgid "Message Inbox"
msgstr ""
```

That's the message we've wrapped inside [`Trans`](/docs/ref/macro.mdx#trans) macro!

Let's add the Czech translation:

```po title="src/locales/cs/messages.po"
#: src/Inbox.js:12
msgid "Message Inbox"
msgstr "Příchozí zprávy"
```

If we run [`extract`](/docs/ref/cli.md#extract) command again, we'll see that all Czech messages are translated:

```bash
> lingui extract

Catalog statistics:
┌──────────┬─────────────┬─────────┐
│ Language │ Total count │ Missing │
├──────────┼─────────────┼─────────┤
│ cs       │      1      │    0    │
│ en       │      1      │    1    │
└──────────┴─────────────┴─────────┘

(use "lingui extract" to update catalogs with new messages)
(use "lingui compile" to compile catalogs for production)
```

That's great! So, how we're going to load it into your app? [Lingui](https://github.com/lingui/js-lingui) introduces concept of compiled message catalogs. Before we load messages into our app, we need to compile them. As you see in the help in command output, we use [`compile`](/docs/ref/cli.md#compile) for that:

```bash
> lingui compile

Compiling message catalogs…
Done!
```

What just happened? If you look inside `locales/<locale>` directory, you'll see there's a new file for each locale: `messages.js`. This file contains compiled message catalog.

:::tip
If you use TypeScript, you can add `--typescript` flag to `compile` script to produce compiled message catalogs with TypeScript types.
:::

Let's load this file into our app and set active language to `cs`:

```jsx title="src/index.js" {6-7,10-14}
import React from "react";
import { render } from "react-dom";

import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { messages as enMessages } from "./locales/en/messages";
import { messages as csMessages } from "./locales/cs/messages";
import Inbox from "./Inbox";

i18n.load({
  en: enMessages,
  cs: csMessages,
});
i18n.activate("cs");

const App = () => (
  <I18nProvider i18n={i18n}>
    <Inbox />
  </I18nProvider>
);

render(<App />, document.getElementById("root"));
```

When we run the app, we see the inbox header is translated into Czech.

### Summary of Basic Workflow

Let's go through the workflow again:

1.  Add an [`I18nProvider`](/docs/ref/react.md#i18nprovider), this component provides the active language and catalog(s) to other components
2.  Wrap messages in [`Trans`](/docs/ref/macro.mdx#trans) macro
3.  Run [`extract`](/docs/ref/cli.md#extract) command to generate message catalogs
4.  Translate message catalogs (send them to translators usually)
5.  Run [`compile`](/docs/ref/cli.md#compile) to create runtime catalogs
6.  Load runtime catalog
7.  Profit

Steps 1 and 7 needs to be done only once per project and locale. Steps 2 to 5 become the common workflow for internationalizing the app.

It isn't necessary to extract/translate messages one by one. This usually happens in batches. When you finalize your work or PR, run [`extract`](/docs/ref/cli.md#extract) to generate latest message catalogs and before building the app for production, run [`compile`](/docs/ref/cli.md#compile).

For more info about CLI, checkout the [CLI reference](/docs/ref/cli.md).

## Formatting

Let's move on to another paragraph in our project. This paragraph has some variables, some HTML and components inside:

```jsx
<p>
  See all <a href="/unread">unread messages</a>
  {" or "}
  <a onClick={markAsRead}>mark them</a> as read.
</p>
```

Although it looks complex, there's really nothing special here. Just wrap the content of the paragraph in [`Trans`](/docs/ref/macro.mdx#trans) and let the macro do the magic:

```jsx
<p>
  <Trans>
    See all <a href="/unread">unread messages</a>
    {" or "}
    <a onClick={markAsRead}>mark them</a> as read.
  </Trans>
</p>
```

Spooky, right? Let's see how this message actually looks in the message catalog. Run [`extract`](/docs/ref/cli.md#extract) command and take a look at the message:

```jsx
See all <0>unread messages</0> or <1>mark them</1> as read.
```

You may notice that components and html tags are replaced with indexed tags (`<0>`, `<1>`). This is a little extension to the ICU MessageFormat which allows rich-text formatting inside translations. Components and their props remain in the source code and don't scare our translators. The tags in the extracted message won't scare our translators either: translators are used to seeing tags and their tools support them. Also, in case we change a `className`, we don't need to update our message catalogs. How cool is that?

### JSX to MessageFormat Transformations

It may look a bit _hackish_ at first sight, but these transformations are actually very easy, intuitive and feel very _Reactish_. We don't have to think about the MessageFormat, because it's created by the library. We write our components in the same way as we're used to and simply wrap text in the [`Trans`](/docs/ref/macro.mdx#trans) macro.

Let's see some examples with MessageFormat equivalents:

```jsx
// Expressions
<p>
  <Trans>Hello {name}</Trans>
</p>
// Hello {name}
```

Any expressions are allowed, not just simple variables. The only difference is, only the variable name will be included in the extracted message:

- Simple variable -> named argument:

  ```jsx
  <p>
    <Trans>Hello {name}</Trans>
  </p>
  // Hello {name}
  ```

- Any expression -> positional argument:

  ```jsx
  <p>
    <Trans>Hello {user.name}</Trans>
  </p>
  // Hello {0}
  ```

- Object, arrays, function calls -> positional argument:

  ```jsx
  <p>
    <Trans>The random number is {Math.rand()}</Trans>
  </p>
  // The random number is {0}
  ```

- Components might get tricky, but like we saw, it's really easy:

  ```jsx
  <Trans>
    Read <a href="/more">more</a>.
  </Trans>
  // Read <0>more</0>.
  ```

  ```jsx
  <Trans>
    Dear Watson,
    <br />
    it's not exactly what I had in my mind.
  </Trans>
  // Dear Watson,<0/>it's not exactly what I had in my mind.
  ```

Some expressions are _valid_ and won't throw any error, yet it doesn't make any sense to write:

```jsx
<Trans>{isOpen && <Modal />}</Trans>
```

### Message ID

At this point we're going to explain what message ID is and how to set it manually.

Translators work with the _message catalogs_ we saw above. No matter what format we use (gettext, xliff, json), it's just a mapping of a message ID to the translation.

Here's an example of a simple message catalog in **Czech** language:

| Message ID | Translation |
| ---------- | ----------- |
| Monday     | Pondělí     |
| Tuesday    | Úterý       |
| Wednesday  | Středa      |

... and the same catalog in **French** language:

| Message ID | Translation |
| ---------- | ----------- |
| Monday     | Lundi       |
| Tuesday    | Mardi       |
| Wednesday  | Mercredi    |

The message ID is _what all catalogs have in common_ – Lundi and Pondělí represent the same message in different languages. It's also the same as the `id` prop in [`Trans`](/docs/ref/macro.mdx#trans) macro.

There are two approaches to how a message ID can be created:

1.  Using the source language (e.g. `Monday` from English, as in example above)
2.  Using a custom id (e.g. `weekday.monday`)

Both approaches have their pros and cons and it's not in the scope of this tutorial to compare them.

By default, [Lingui](https://github.com/lingui/js-lingui) generates message ID from the content of [`Trans`](/docs/ref/macro.mdx#trans) macro, which means it uses the source language. However, we can easily override it by setting the `id` prop manually:

```jsx
<h1>
  <Trans id="inbox.title">Message Inbox</Trans>
</h1>
```

This will generate:

```jsx
<h1>
  <Trans id="inbox.title" message="Message Inbox" />
</h1>
```

In our message catalog, we'll see `inbox.title` as message ID, but we also get `Message Inbox` as default translation for English.

For the rest of this tutorial, we'll use auto-generated message IDs to keep it simple.

## Plurals

Let's move on and add i18n to another text in our component:

```jsx
<p>
  {messagesCount === 1
    ? `There's ${messagesCount} message in your inbox.`
    : `There are ${messagesCount} messages in your inbox.`}
</p>
```

This message is a bit special, because it depends on the value of the `messagesCount` variable. Most languages use different forms of words when describing quantities - this is called [pluralization](https://en.wikipedia.org/wiki/Plural).

What's tricky is that different languages use different number of plural forms. For example, English has only two forms - singular and plural - as we can see in the example above. However, Czech language has three plural forms. Some languages have up to 6 plural forms and some don't have plurals at all!

:::tip
Lingui uses `Intl.PluralRules` which is supported in [every modern browser](https://caniuse.com/intl-pluralrules) and can be polyfilled for older. So you don't need to setup anything special.
:::

### English Plural Rules

How do we know which plural form we should use? It's very simple: we, as developers, only need to know plural forms of the language we use in our source. Our component is written in English, so looking at [English plural rules](http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html#en) we'll need just two forms:

`one`

> Singular form

`other`

> Plural form

We don't need to select these forms manually. We'll use [`Plural`](/docs/ref/macro.mdx#plural-1) component, which takes a `value` prop and based on the active language, selects the right plural form:

```jsx
import { Trans, Plural } from "@lingui/macro";

<p>
  <Plural value={messagesCount} one="There's # message in your inbox" other="There are # messages in your inbox" />
</p>;
```

This component will render `There's 1 message in your inbox` when `messageCount = 1` and `There are # messages in your inbox` for any other values of `messageCount`. `#` is a placeholder, which is replaced with `value`.

Cool! Curious how this component is transformed under the hood and how the message looks in MessageFormat syntax? Run [`extract`](/docs/ref/cli.md#extract) command and find out by yourself:

```icu-message-format
{messagesCount, plural,
    one {There's # message in your inbox}
    other {There are # messages in your inbox}}
```

In the catalog, you'll see the message in one line. Here we wrapped it to make it more readable.

The [`Plural`](/docs/ref/macro.mdx#plural-1) is gone and replaced with [`Trans`](/docs/ref/react.md#trans) again! The sole purpose of [`Plural`](/docs/ref/macro.mdx#plural-1) is to generate proper syntax in message.

Things are getting a bit more complicated, but i18n is a complex process. At least we don't have to write this message manually!

### Beware of zeroes!

Just a short detour, because it's a common misunderstanding.

You may wonder why the following code doesn't work as expected:

```jsx
<Plural
  value={messagesCount}
  zero="There are no messages"
  one="There's # message in your inbox"
  other="There are # messages in your inbox"
/>
```

This component will render `There are 0 messages in your inbox` for `messagesCount = 0`. Why so? Because English doesn't have `zero` [plural form](http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html#en).

Looking at [English plural rules](http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html#en), it's:

| N   | Form                  |
| --- | --------------------- |
| 0   | other                 |
| 1   | one                   |
| n   | other (anything else) |

However, decimal numbers (even `1.0`) use `other` form every time:

```default
There are 0.0 messages in your inbox.
```

Aren't languages beautiful?

### Exact Forms

Alright, back to our example. What if we really want to render `There are no messages` for `messagesCount = 0`? Exact forms to the rescue!

```jsx
<Plural
  value={messagesCount}
  _0="There are no messages"
  one="There's # message in your inbox"
  other="There are # messages in your inbox"
/>
```

What's that `_0`? MessageFormat allows exact forms, like `=0`. However, React props can't start with `=` and can't be numbers either, so we need to write `_N` instead of `=0`.

It works with any number, so we can go wild and customize it this way:

```jsx
<Plural
  value={messagesCount}
  _0="There are no messages"
  _1="There's one message in your inbox"
  _2="There are two messages in your inbox, that's not much!"
  other="There are # messages in your inbox"
/>
```

... and so on. Exact matches always take precedence before plural forms.

### Variables and Components

Let's go back to our original pluralized message:

```jsx
<p>
  <Plural value={messagesCount} one="There's # message in your inbox" other="There are # messages in your inbox" />
</p>
```

What if we want to use variables or components inside messages? Easy! Either wrap messages in [`Trans`](/docs/ref/macro.mdx#trans) macro or use template literals (suppose we have a variable `name`):

```jsx
<p>
  <Plural
    value={messagesCount}
    one={`There's # message in your inbox, ${name}`}
    other={
      <Trans>
        There are <strong>#</strong> messages in your inbox, {name}
      </Trans>
    }
  />
</p>
```

We can use nested macros, components, variables, expressions, really anything.

This gives us enough flexibility for all usecases.

### Custom Message ID

Let's finish this with a short example of plurals with custom ID. We can pass an `id` prop to [`Plural`](/docs/ref/macro.mdx#plural-1) as we would to [`Trans`](/docs/ref/macro.mdx#trans):

```jsx
<p>
  <Plural
    id="Inbox.messagesCount"
    value={messagesCount}
    one="There's # message in your inbox"
    other="There are # messages in your inbox"
  />
</p>
```

## Formats

The last message in our component is again a bit specific:

```jsx
<footer>Last login on {lastLogin.toLocaleDateString()}.</footer>
```

`lastLogin` is a date object, and we need to format it properly. Dates are formatted differently in different languages, but we don't have to do this manually. The heavy lifting is done by the [Intl object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl), we'll just use [`i18n.date()`](/docs/ref/core.md#i18n.date) function. The `i18n` object can be accessed by [`useLingui`](/docs/ref/react.md#uselingui) hook:

```jsx title="src/Inbox.js"
import { useLingui } from "@lingui/react";

export default function Inbox() {
  const { i18n } = useLingui();
  // ...

  return (
    <div>
      {/* ... */}
      <footer>
        <Trans>Last login on {i18n.date(lastLogin)}.</Trans>
      </footer>
    </div>
  );
}
```

This will format the date using the conventional format for the active language.

## Review

After all modifications, the final component with i18n looks like this:

```jsx title="src/Inbox.js"
import React from "react";
import { Trans, Plural } from "@lingui/macro";
import { useLingui } from "@lingui/react";

export default function Inbox() {
  const { i18n } = useLingui();
  const messages = [{}, {}];
  const messagesCount = messages.length;
  const lastLogin = new Date();
  const markAsRead = () => {
    alert("Marked as read.");
  };

  return (
    <div>
      <h1>
        <Trans>Message Inbox</Trans>
      </h1>

      <p>
        <Trans>
          See all <a href="/unread">unread messages</a>
          {" or "}
          <a onClick={markAsRead}>mark them</a> as read.
        </Trans>
      </p>

      <p>
        <Plural
          value={messagesCount}
          one="There's # message in your inbox"
          other="There are # messages in your inbox"
        />
      </p>

      <footer>
        <Trans>Last login on {i18n.date(lastLogin)}.</Trans>
      </footer>
    </div>
  );
}
```

That's all for this tutorial! Checkout the reference documentation or various guides in the documentation for more info and happy internationalizing!

## Further reading

- [Common i18n Patterns in React](/docs/tutorials/react-patterns.md)
- [`@lingui/react` Reference Documentation](/docs/ref/react.md)
- [CLI Reference](/docs/ref/cli.md)
- [Pluralization Guide](/docs/guides/plurals.md)
