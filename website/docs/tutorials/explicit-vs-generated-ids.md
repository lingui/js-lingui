# Choosing between generated and explicit IDs

In this guide, we will explore the fundamental concepts of explicit and generated IDs, and then delve into a comprehensive comparison, highlighting the benefits and drawbacks of each approach.

## What are Explicit IDs and Generated IDs?

### Explicit ID

An explicit ID, often referred to as a user-defined or custom ID, is a manually assigned identifier associated with a specific message. These IDs are typically chosen by developers and are explicitly specified within your code. The typical explicit id may look like `index.header.title` or `modal.buttons.cancel`.

Lingui example:

```jsx
<Trans id="index.header.title">LinguiJS example</Trans>

// extracted as
{
  id: "index.header.title",
  message: "LinguiJS example",
}
```

### Generated IDs

On the other hand, generated IDs are automatically created by the internalization library. In Lingui, such IDs are created based on a source message and [context](#context).

Lingui example:

```jsx
<Trans>LinguiJS example</Trans>

// extracted as
{
  id: "uxV9Xq",
  message: "LinguiJS example",
}
```

### Benefits of Generated IDs

1. **Avoiding the challenge of naming things:** You don't need to come up with a name for each single phrase in the app. The natural language is used to create an ID.
2. **Better Developer Experience:** Developers can focus on coding without needing to manually assign IDs, leading to a more streamlined development process.
3. **Preventing ID collisions:** As your application scales, explicit IDs can potentially lead to conflicts. Lingui's generated IDs ensure you steer clear of such collisions.
4. **Avoiding Duplicates:** Duplicate messages are merged together automatically. Your translators will not have to translate the same phrases again and again. This could lead to cost savings, especially if translators charge by word count.
5. **Smaller bundle:** The Lingui generates short ID such as `uxV9Xq` which are typically shorter than manually crafted IDs like `index.header.title`. This results in a smaller bundle size, optimizing your application's performance.

### Benefits of Explicit IDs

1. **Control:** Developers have full control over the naming and assignment of explicit IDs. This control allows for precise targeting and easy maintenance of internationalization keys.
2. **Readability:** Explicit IDs often have meaningful names, making it easier for developers, translators, and content creators to understand their purpose within the codebase.
3. **Predictability:** Since explicit IDs are manually assigned, they remain stable across different versions of your application, reducing the likelihood of breaking changes during updates.

In conclusion, the choice between these two strategies depends on your project requirements and priorities. However, it's important to note that Lingui provides the full range of benefits, especially with generated IDs.

:::note
You don't need to worry about the readability of IDs because you would barely see them. When extracted into a PO file, translators would see source string and its corresponding translation, while the IDs remain behind the scenes.

```gettext
#: src/App.tsx:1
msgid "LinguiJS example"
msgstr "LinguiJS przyklad"
```

:::

## Using ID generated from a message

### With [`Trans`](/docs/ref/macro.md#trans) macro

```jsx
import { Trans } from "@lingui/macro";

function render() {
  return (
    <>
      <h1>
        <Trans>LinguiJS example</Trans>
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

In the example code above, the content of [`Trans`](/docs/ref/macro.md#trans) is transformed into a message in MessageFormat syntax. By default, this message is used for generating the ID. Considering the example above, the catalog would contain these entries:

```js
const catalog = [
  {
    id: "uxV9Xq",
    message: "LinguiJS example",
  },
  {
    id: "9/omjw",
    message: "Hello <0>{name}</0>.",
  },
];
```

### With non-JSX macro

In the following example, the message `Hello World` will be extracted and used to create an ID.

```jsx
import { msg } from "@lingui/macro";

msg`Hello World`;
```

### Context {#context}

By default, when using generated IDs, the same text elements are extracted with the same ID, and then translated once. However, this might not always be desirable since the same text can have different meanings and translations. For example, consider the word "right" and its two possible meanings:

- correct as in "you are right"
- direction as in "turn right"

To distinguish these two cases, you can add `context` to messages. The same text elements with different contexts are extracted with different IDs. Then, they can be translated differently and merged back into the application as different translation entries.

Regardless of whether you use generated IDs or not, adding context makes the translation process less challenging and helps translators interpret the source accurately. You, in return, get translations of better quality faster and decrease the number of context-related issues you would need to solve.

#### Providing context for a message

```jsx
import { Trans } from "@lingui/macro";
<Trans context="direction">right</Trans>;
<Trans context="correctness">right</Trans>;

// ↓ ↓ ↓ ↓ ↓ ↓

import { Trans } from "@lingui/react";
<Trans id={"d1wX4r"} message="right" />;
<Trans id={"16eaSK"} message="right" />;
```

or with non-jsx macro

```jsx
import { msg } from "@lingui/macro";

const ex1 = msg({
  message: `right`,
  context: "direction",
});

const ex2 = msg({
  message: `right`,
  context: "correctness",
});

// ↓ ↓ ↓ ↓ ↓ ↓
const ex1 = {
  id: "d1wX4r",
  message: `right`,
};
const ex2 = {
  id: "16eaSK",
  message: `right`,
};
```

## Using custom ID

### With [`Trans`](/docs/ref/macro.md#trans)

If you're using custom IDs in your project, add `id` prop to i18n components:

```jsx
import { Trans } from "@lingui/macro";

function render() {
  return (
    <>
      <h1>
        <Trans id="msg.header">LinguiJS example</Trans>
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

The messages with IDs `msg.header` and `msg.hello` will be extracted with their default values as `LinguiJS example` and `Hello <0>{name}</0>.` respectively.

### With non-JSX macro

If you're using custom IDs in your project, call the [`msg`](/docs/ref/macro.md#definemessage) function with a message descriptor object, passing the ID using the `id` property:

```jsx
import { msg } from "@lingui/macro";

msg({ id: "msg.greeting", message: `Hello World` });
```

Message `msg.greeting` will be extracted with default value `Hello World`.

For all other js macros ([`plural`](/docs/ref/macro.md#plural), [`select`](/docs/ref/macro.md#select), [`selectOrdinal`](/docs/ref/macro.md#selectordinal), use them inside [`msg`](/docs/ref/macro.md#definemessage) macro to pass ID (in this case, `'msg.caption'`).

```jsx
import { msg, plural } from "@lingui/macro";

msg({
  id: "msg.caption",
  message: plural(count, {
    one: "# image caption",
    other: "# image captions",
  }),
});
```
