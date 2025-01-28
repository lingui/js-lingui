---
title: React i18n with Lingui
description: Learn how to add internationalization to a React application using Lingui
---

# React Apps Internationalization

In this tutorial, we'll learn how to add internationalization (i18n) to an existing React JS application. We'll focus on the most common patterns and best practices for using Lingui in React.

:::tip Example
If you're looking for a working solution, check out the [Examples](/examples) page. It contains several sample projects with the complete setup using Lingui and React.

It includes examples for _Create React App_, _React with Vite and Babel_, _React with Vite and SWC_, and more.
:::

## Installing Lingui

1. Follow the [Installation and Setup](/installation) page for initial setup.
2. Install the [`@lingui/core`](/ref/core) and [`@lingui/react`](/ref/react) packages.

## Example Component

We're going to translate the following one-page mailbox application:

```jsx title="src/index.js"
import React from "react";
import ReactDOM from "react-dom/client";
import Inbox from "./Inbox";

const App = () => <Inbox />;

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
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

This application is a simple mailbox with a header, a paragraph with a link and a button, another paragraph with a message count, and a footer with the last login date. We will use it as the basis for our tutorial.

## Setup

We will start translating the `Inbox` component right away, but we need to do one more step to set up our application.

Components need to read information about current language and message catalogs from the [`i18n`](/ref/core#i18n) instance. Lingui uses the [`I18nProvider`](/ref/react#i18nprovider) to pass the `i18n` instance to your React components.

Let's add all required imports and wrap our app inside [`I18nProvider`](/ref/react#i18nprovider):

```jsx title="src/index.js"
import React from "react";
import ReactDOM from "react-dom/client";

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

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

:::info
You might be wondering: how are we going to change the active language? That's what the [`I18n.load`](/ref/core#i18n.load) and [`i18n.activate`](/ref/core#i18n.activate) calls are for! However, we cannot change the language unless we have the translated message catalog. And to get the catalog, we first need to extract all messages from the source code.
:::

## Introducing Internationalization

Now we're finally going to _translate_ our application. Actually, we're not going to _translate_ from one language to another right now. Instead, we're going to _prepare_ our app for translation. This process is called _internationalization_.

Let's start with the basics - static messages. These messages don't have any variables, HTML or components inside. Just some text:

```jsx
<h1>Message Inbox</h1>
```

To make this heading translatable, simply wrap it in the [`Trans`](/ref/macro#trans) macro:

```jsx
import { Trans } from "@lingui/react/macro";

<h1>
  <Trans>Message Inbox</Trans>
</h1>;
```

Using JSX Macros is the easiest way to translate your React components. It handles translations of messages, including variables and other React components.

### Macros vs. Components

If you're wondering what [Macros](/ref/macro) are and the difference between macros and runtime components, here's a quick explanation.

In general, macros are executed at compile time and serve to transform the source code to make the message writing process easier. Under the hood, all JSX macros are transformed into the runtime component [`Trans`](/ref/react#trans) (imported from `@lingui/react`).

Below is a brief example demonstrating this transformation:

```jsx
import { Trans } from "@lingui/react/macro";

<Trans>Hello {name}</Trans>;

// ↓ ↓ ↓ ↓ ↓ ↓

import { Trans } from "@lingui/react";

<Trans id="OVaF9k" message="Hello {name}" values={{ name }} />;
```

As you can see, the [`Trans`](/ref/react#trans) runtime component gets `id` and `message` props with a message in [ICU MessageFormat](/guides/message-format) syntax. We could write it manually, but it's just easier and shorter to write JSX as we're used to and let macros generate the message for us.

:::tip Bundle Size Impact
Another advantage of using macros is that all non-essential properties are excluded from the production build. This results in a significant reduction in the size footprint for internationalization:

```jsx
// NODE_ENV=production
import { Trans } from "@lingui/react";

<Trans id="OVaF9k" values={{ name }} />;
```

:::

### Extracting Messages

Back to our project. It's nice to use JSX and let macros generate messages under the hood. Let's check that it actually works correctly.

All messages from the source code must be extracted into external message catalogs. Message catalogs are interchange files between developers and translators. We're going to have one file per language.

:::info
Refer to the [Message Extraction](/guides/message-extraction) guide for more information about various message extraction concepts and strategies.
:::

Let's switch to the command line for a moment. Execute the [`extract`](/ref/cli#extract) CLI command. If everything is set up correctly, you should see the extracted message statistics in the output:

```bash
> lingui extract

Catalog statistics:
┌──────────┬─────────────┬─────────┐
│ Language │ Total count │ Missing │
├──────────┼─────────────┼─────────┤
│ cs       │      1      │    1    │
│ en       │      1      │    1    │
└──────────┴─────────────┴─────────┘
```

As a result, we have two new files in the `locales` directory: `en/messages.po` and `cs/messages.po`. These files contain extracted messages from the source code.

Let's take a look at the Czech message catalog:

```gettext title="src/locales/cs/messages.po"
msgid ""
msgstr ""
"POT-Creation-Date: 2021-07-22 21:44+0900\n"
"MIME-Version: 1.0\n"
"Content-Type: text/plain; charset=utf-8\n"
"Content-Transfer-Encoding: 8bit\n"
"X-Generator: @lingui/cli\n"
"Language: cs\n"

// highlight-start
#: src/Inbox.js:12
msgid "Message Inbox"
msgstr ""
// highlight-end
```

It contains the message we wrapped in the [`Trans`](/ref/macro#trans) macro. Let's add the Czech translation:

```po title="src/locales/cs/messages.po" {3}
#: src/Inbox.js:12
msgid "Message Inbox"
msgstr "Příchozí zprávy"
```

If we run the [`extract`](/ref/cli#extract) command again, we'll see that all the Czech messages have been translated:

```bash
> lingui extract

Catalog statistics:
┌──────────┬─────────────┬─────────┐
│ Language │ Total count │ Missing │
├──────────┼─────────────┼─────────┤
│ cs       │      1      │    0    │
│ en       │      1      │    1    │
└──────────┴─────────────┴─────────┘
```

That's great! So how do we load it into your application? Lingui introduces the concept of compiled message catalogs. Before we load messages into our application, we need to compile them.

Use the [`compile`](/ref/cli#compile) command to do this:

```bash
> lingui compile

Compiling message catalogs…
Done!
```

If you look inside the `locales/<locale>` directory, you'll see that there is a new file for each locale: `messages.js`. This file contains the compiled message catalog.

:::tip
If you use TypeScript, you can add the `--typescript` flag to the `compile` command to produce compiled message catalogs with TypeScript types.
:::

Let's load this file into our app and set active language to `cs`:

```jsx title="src/index.js" {6-7,10-14}
import React from "react";
import ReactDOM from "react-dom/client";

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

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

When we run the app, we see the inbox header is translated into Czech.

:::tip
Alternatively, you can load catalogs dynamically using the [`@lingui/loader`](/ref/loader) or [`@lingui/vite-plugin`](/ref/vite-plugin) without the need to import compiled messages manually.
:::

### Summary of Basic Workflow

Let's go through the workflow again:

1. Add an [`I18nProvider`](/ref/react#i18nprovider), this component provides the active language and catalog(s) to other components.
2. Wrap messages in the [`Trans`](/ref/macro#trans) macro.
3. Run [`extract`](/ref/cli#extract) command to generate message catalogs.
4. Translate message catalogs (send them to translators usually).
5. Run [`compile`](/ref/cli#compile) to create runtime catalogs.
6. Load runtime catalog.
7. Profit! 🎉

It's not necessary to extract/translate messages one by one. This is usually done in batches. When you finish your work or PR, run [`extract`](/ref/cli#extract) to generate the latest message catalogs, and before building the application for production, run [`compile`](/ref/cli#compile).

## Formatting

Let's move on to another paragraph in our project. The following paragraph has some variables, some HTML and components inside:

```jsx
<p>
  See all <a href="/unread">unread messages</a>
  {" or "}
  <a onClick={markAsRead}>mark them</a> as read.
</p>
```

Although it looks complex, there's really nothing special here. Just wrap the content of the paragraph in [`Trans`](/ref/macro#trans) and let the macro do the magic:

```jsx
<p>
  <Trans>
    See all <a href="/unread">unread messages</a>
    {" or "}
    <a onClick={markAsRead}>mark them</a> as read.
  </Trans>
</p>
```

Let's see how this message actually looks in the message catalog. Run the [`extract`](/ref/cli#extract) command and take a look at the message:

```gettext
#: src/Inbox.js:20
msgid "See all <0>unread messages</0> or <1>mark them</1> as read."
msgstr ""
```

You may notice that components and html tags are replaced with indexed tags (`<0>`, `<1>`). This is a little extension to the ICU MessageFormat which allows rich-text formatting inside translations. Components and their props remain in the source code and don't scare our translators. Also, in case we change a `className`, we don't need to update our message catalogs.

### JSX to MessageFormat Transformations

At first glance, these transformations might seem somewhat unconventional; however, they are straightforward, intuitive, and align well with React principles. There is no need to focus on MessageFormat, as the library handles its creation for us. We can write our components as we typically would and simply wrap the text in the [`Trans`](/ref/macro#trans) macro.

Let's see some examples with MessageFormat equivalents:

```jsx
<Trans>Hello {name}</Trans>
// Hello {name}
```

Any expressions are allowed, not just simple variables. The only difference is, only the variable name will be included in the extracted message:

- Any expression -> positional argument:

  ```jsx
  <Trans>Hello {user.name}</Trans>
  // Hello {0}
  ```

- Object, arrays, function calls -> positional argument:

  ```jsx
  <Trans>The random number is {Math.rand()}</Trans>
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

:::caution
Try to keep your messages simple and avoid complex expressions. During extraction, these expressions will be replaced by placeholders, resulting in a lack of context for translators. There is also a special rule in Lingui [ESLint Plugin](/ref/eslint-plugin) to catch these cases: [`no-expression-in-message`](https://github.com/lingui/eslint-plugin/blob/main/docs/rules/no-expression-in-message.md).
:::

### Dates and Numbers

Take a look at the message in the footer of our component. It is a bit special because it contains a date:

```jsx
<footer>Last login on {lastLogin.toLocaleDateString()}.</footer>
```

Dates (as well as numbers) are formatted differently in different languages, but we don't have to do this manually. The heavy lifting is done by the [`Intl` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl), we'll just use the [`i18n.date()`](/ref/core#i18n.date) function.

The `i18n` object can be accessed with the [`useLingui`](/ref/react#uselingui) hook:

```jsx title="src/Inbox.js" {4,9}
import { useLingui, Trans } from "@lingui/react/macro";

export default function Inbox() {
  const { i18n } = useLingui();

  return (
    <div>
      <footer>
        <Trans>Last login on {i18n.date(lastLogin)}.</Trans>
      </footer>
    </div>
  );
}
```

This will format the date using the conventional format for the active language. To format numbers, use the [`i18n.number()`](/ref/core#i18n.number) function.

### Message ID

At this point, we'll explain what the message ID is and how to set it manually. Translators work with _message catalogs_. No matter what format we use, it's just a mapping of a message ID to the translation.

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

The message ID is _what all catalogs have in common_ – "Lundi" and "Pondělí" represent the same message in different languages.

There are two approaches for creating a message ID:

- Automatically generated from message (e.g. `Monday`) and context, if available.
- Explicit message ID set by the developer (e.g. `days.monday`).

:::info
Refer to the [Explicit vs Generated IDs](/guides/explicit-vs-generated-ids) guide for more information about the pros and cons of each approach.
:::

## Plurals

Let's take a closer look at the following code in our component:

```jsx
<p>
  {messagesCount === 1
    ? `There's ${messagesCount} message in your inbox.`
    : `There are ${messagesCount} messages in your inbox.`}
</p>
```

This message is a bit special, because it depends on the value of the `messagesCount` variable. Most languages use different forms of words when describing quantities - this is called [pluralization](/guides/plurals).

What's tricky is that different languages use different number of plural forms. For example, English has only two forms - singular and plural - as we can see in the example above. However, Czech language has three plural forms. Some languages have up to 6 plural forms and some don't have plurals at all!

:::info
Lingui uses `Intl.PluralRules` which is supported in [every modern browser](https://caniuse.com/intl-pluralrules) and can be polyfilled for older. So you don't need to setup anything special.
:::

### English Plural Rules

How do we know which plural form we should use? It's very simple: we, as developers, only need to know plural forms of the language we use in our source. Our component is written in English, so looking at [English plural rules](http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html#en) we'll need just two forms:

`one`

> Singular form

`other`

> Plural form

We don't need to select these forms manually. We'll use [`Plural`](/ref/macro#plural-1) component, which takes a `value` prop and based on the active language, selects the right plural form:

```jsx
import { Plural } from "@lingui/react/macro";

<p>
  <Plural value={messagesCount} one="There's # message in your inbox" other="There are # messages in your inbox" />
</p>;
```

This component will render `There's 1 message in your inbox` when `messageCount = 1` and `There are # messages in your inbox` for any other values of `messageCount`. `#` is a placeholder, which is replaced with `value`.

Let's run the [`extract`](/ref/cli#extract) command to see the extracted message:

```icu-message-format
{messagesCount, plural,
  one {There's # message in your inbox}
  other {There are # messages in your inbox}
}
```

In the catalog, you'll see the message in a single line. Here we have wrapped it to make it more readable.

### Beware of Zeroes!

Just a short detour, because it's a common misunderstanding. You may wonder why the following code doesn't work as expected:

```jsx
<p>
  <Plural
    value={messagesCount}
    zero="There are no messages"
    one="There's # message in your inbox"
    other="There are # messages in your inbox"
  />
</p>
```

This component will render `There are 0 messages in your inbox` for `messagesCount = 0`. Why so? Because English doesn't have `zero` plural form. Looking at [English plural rules](http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html#en), it's:

| N   | Form                  |
| --- | --------------------- |
| 0   | other                 |
| 1   | one                   |
| n   | other (anything else) |

However, decimal numbers (even `1.0`) always use the `other` form:

```default
There are 0.0 messages in your inbox.
```

### Exact Forms

Going back to our example, what if we specifically want to display `There are no messages` when `messagesCount = 0`? This is where exact forms come in handy:

```jsx {4}
<p>
  <Plural
    value={messagesCount}
    _0="There are no messages"
    one="There's # message in your inbox"
    other="There are # messages in your inbox"
  />
</p>
```

:::tip
MessageFormat allows exact forms, like `=0`. However, React props can't start with `=` and can't be numbers either, so we need to write `_N` instead of `=0`.
:::

It works with any number, allowing for extensive customization as follows:

```jsx {4-6}
<p>
  <Plural
    value={messagesCount}
    _0="There are no messages"
    _1="There's one message in your inbox"
    _2="There are two messages in your inbox, that's not much!"
    other="There are # messages in your inbox"
  />
</p>
```

Exact matches always take precedence over plural forms.

### Variables and Components

Let's go back to our original pluralized message:

```jsx
<p>
  <Plural value={messagesCount} one="There's # message in your inbox" other="There are # messages in your inbox" />
</p>
```

To include variables or components within messages, simply wrap them in the [`Trans`](/ref/macro#trans) macro or use template literals (for example, with a variable `name`):

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

Nested macros, components, variables, and expressions are all supported, providing the flexibility needed for any use case.

## Internationalization Outside of React

So far, we have learned how to translate strings within a JSX element. However, what if we need to translate content that is outside JSX or pass a translation as a prop to another component?

In our example, we have the following code:

```js
const markAsRead = () => {
  alert("Marked as read.");
};
```

To translate it, we will use the [`useLingui`](/ref/macro#uselingui) macro hook:

```js
import { useLingui } from "@lingui/react/macro";

const { t } = useLingui();

const markAsRead = () => {
  alert(t`Marked as read.`);
};
```

Now the `Marked as read.` message would be picked up by the extractor, and available for translation in the catalog.

You could also pass variables and use any other macro in the message:

```jsx
const { t } = useLingui();

const markAsRead = () => {
  const userName = "User1234";
  alert(t`Hello ${userName}, your messages marked as read!`);
};
```

:::tip
You can also use this approach to translate element attributes, such as `alt` in an `img` tag:

```jsx
import { useLingui } from "@lingui/react/macro";

export default function ImageWithCaption() {
  const { t } = useLingui();

  return <img src="..." alt={t`Image caption`} />;
}
```

:::

:::caution
All Core Macros cannot be used at the module level. They must be used within a component or function. See the [Macros](/ref/macro#using-macros) documentation for more information.
:::

## Review

After all modifications, the final i18n-ready component looks like this:

```jsx title="src/Inbox.js"
import React from "react";
import { Trans, Plural, useLingui } from "@lingui/react/macro";

export default function Inbox() {
  const { i18n, t } = useLingui();
  const messages = [{}, {}];
  const messagesCount = messages.length;
  const lastLogin = new Date();
  const markAsRead = () => {
    alert(t`Marked as read.`);
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

That's it for this tutorial! For more details, see the reference documentation or check out additional tutorials. Happy Internationalizing!

## See Also

- [React Server Components Tutorial](/tutorials/react-rsc)
- [React Native i18n Tutorial](/tutorials/react-native)
- [`@lingui/react` Reference](/ref/react)
