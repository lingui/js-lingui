---
title: Explicit vs Generated Message IDs in Lingui
description: Compare explicit and generated message IDs in Lingui i18n, understand the trade-offs, and choose the best approach for your localization workflow
---

# Explicit vs Generated IDs

When internationalizing your application, you may need to decide whether to use explicit or generated IDs for your messages.

In this guide, we explore the basic concepts of explicit and generated IDs, and then delve into a comprehensive comparison, highlighting the advantages and disadvantages of each approach.

## Differences Between Explicit and Generated IDs

### Explicit ID

An explicit ID, often referred to as a user-defined or custom ID, is a manually assigned identifier associated with a specific message. These IDs are typically chosen by developers and are explicitly specified within your code. The typical explicit ID may look like `index.header.title` or `modal.buttons.cancel`.

Example:

```jsx
<Trans id="index.header.title">Lingui example</Trans>

// extracted as
{
  id: "index.header.title",
  message: "Lingui example",
}
```

### Generated IDs

On the other hand, generated IDs are created automatically by the internationalization library. In Lingui, such IDs are created based on the source message and [context](#context).

Example:

```jsx
<Trans>Lingui example</Trans>

// extracted as
{
  id: "MbT6FE",
  message: "Lingui example",
}
```

### Benefits of Generated IDs

- **Avoiding the "naming things" problem:** you don't need to come up with a name for each single phrase in the app. Lingui generates the IDs (in the form of short hashes) from the messages.
- **Better developer experience:** developers can focus on coding without needing to manually assign IDs, leading to a more streamlined development process. Searching for a user-facing string will lead to the place in code where it's used, as opposed to taking you to a (typically JSON) file full of translations.
- **Avoiding duplicates:** duplicate messages are merged together automatically. Translators will not have to translate the same phrases again and again. This could lead to cost savings, especially if translators charge by word count.
- **Smaller bundle:** Lingui generates short IDs such as `MbT6FE` which are typically shorter than manually crafted IDs like `index.header.title`. This results in a smaller bundle size, optimizing your application's performance.
- **Preventing ID collisions:** as your application scales, explicit IDs can potentially lead to conflicts. Lingui's generated IDs help avoid such collisions.

### Benefits of Explicit IDs

- **Control:** developers have full control over the naming and assignment of explicit IDs. This control allows for precise targeting and easy maintenance of internationalization keys.
- **Loose coupling:** explicit IDs are loosely coupled with the messages (as opposed to when they are generated from the messages). This means that if the message changes, the ID remains the same. When your team uses a TMS (Translation Management System), this makes it easier even for non-technical people to update the strings.
- **Readability:** explicit IDs often have meaningful names, making it easier for developers, translators, and content creators to understand their purpose within the codebase.
- **Predictability:** since explicit IDs are manually assigned, they remain stable across different versions of your application, reducing the likelihood of breaking changes during updates.

:::tip
If you use explicit IDs, you can opt in to [Typed Message IDs](/guides/typed-message-ids.md) for autocomplete and compile-time validation of your message identifiers.
:::

The choice between these two strategies depends on your project requirements and priorities. However, it's important to note that Lingui provides the full range of benefits, especially with generated IDs.

:::note
You don't have to worry about the readability of the IDs because you would hardly see them. When extracted into a PO file, translators would see the source string and its corresponding translation, while the IDs remain behind the scenes:

```gettext
#: src/App.tsx:1
msgid "Lingui example"
msgstr "Lingui przyklad"
```

:::

## Context

By default, when using generated IDs, the same text elements are extracted with the same ID, and then translated once. However, this might not always be desirable since the same text can have different meanings and translations. For example, consider the word "right" and its two possible meanings:

- correct as in "you are right"
- direction as in "turn right"

To distinguish these two cases, you can add `context` to messages. The same text elements with different contexts are extracted with different IDs. Then, they can be translated differently and merged back into the application as different translation entries.

Regardless of whether you use generated IDs or not, adding context makes the translation process less challenging and helps translators interpret the source accurately. You, in return, get translations of better quality faster and decrease the number of context-related issues you would need to solve.

Examples:

```jsx
import { Trans } from "@lingui/react/macro";

<Trans context="direction">right</Trans>;
<Trans context="correctness">right</Trans>;

// ↓ ↓ ↓ ↓ ↓ ↓

import { Trans } from "@lingui/react";

<Trans id={"d1wX4r"} message="right" />;
<Trans id={"16eaSK"} message="right" />;
```

or with non-JSX macro:

```jsx
import { msg } from "@lingui/core/macro";

const ex1 = msg({
  message: `right`,
  context: "direction",
});

const ex2 = msg({
  message: `right`,
  context: "correctness",
});

// ↓ ↓ ↓ ↓ ↓ ↓

import { msg } from "@lingui/core/macro";

const ex1 = {
  id: "d1wX4r",
  message: `right`,
};
const ex2 = {
  id: "16eaSK",
  message: `right`,
};
```

## Using Generated IDs

### With JSX Macro

```jsx
import { Trans } from "@lingui/react/macro";

function render() {
  return (
    <>
      <h1>
        <Trans>Lingui example</Trans>
      </h1>
      <p>
        <Trans>
          Hello <a href="/profile">{name}</a>.
        </Trans>
      </p>
    </>
  );
}
```

In the example code above, the content of [`Trans`](/ref/macro#trans) is transformed into a message in MessageFormat syntax. By default, this message is used for generating the ID. Considering the example above, the catalog would contain these entries:

```js
const catalog = [
  {
    id: "MbT6FE",
    message: "Lingui example",
  },
  {
    id: "9_omjw",
    message: "Hello <0>{name}</0>.",
  },
];
```

### With Core Macro

In the following example, the message `Hello World` will be extracted and used to create an ID:

```jsx
import { msg } from "@lingui/core/macro";

msg`Hello World`;
```

## Using Explicit IDs

### With JSX Macro

To use custom IDs in JSX macros, pass the ID as a prop to the component:

```jsx
import { Trans } from "@lingui/react/macro";

function render() {
  return (
    <>
      <h1>
        <Trans id="msg.header">Lingui example</Trans>
      </h1>
      <p>
        <Trans id="msg.hello">
          Hello <a href="/profile">{name}</a>.
        </Trans>
      </p>
    </>
  );
}
```

The messages with IDs `msg.header` and `msg.hello` will be extracted with their default values as `Lingui example` and `Hello <0>{name}</0>.` respectively.

### With Core Macro

To use custom IDs in non-JSX macros, call the [`msg`](/ref/macro#definemessage) function with a message descriptor object, passing the ID using the `id` property:

```jsx
import { msg } from "@lingui/core/macro";

msg({ id: "msg.greeting", message: `Hello World` });
```

Message `msg.greeting` will be extracted with default value `Hello World`.

For all other js macros ([`plural`](/ref/macro#plural), [`select`](/ref/macro#select), [`selectOrdinal`](/ref/macro#selectordinal), use them inside [`msg`](/ref/macro#definemessage) macro to pass ID (in this case, `'msg.caption'`).

```jsx
import { msg, plural } from "@lingui/core/macro";

msg({
  id: "msg.caption",
  message: plural(count, {
    one: "# image caption",
    other: "# image captions",
  }),
});
```

:::tip
Enforce explicit IDs with the Lingui [ESLint Plugin](/ref/eslint-plugin) rule [`require-explicit-id`](https://github.com/lingui/eslint-plugin/blob/main/docs/rules/require-explicit-id.md).
:::

## See Also

- [Message Extraction](/guides/message-extraction)
- [Macros Reference](/ref/macro)
