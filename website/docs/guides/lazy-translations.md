---
title: Lazy Translations
description: Lazy translations allow you to defer translation of a message until it is actually displayed
---

# Lazy Translations

Lazy translation allows you to defer translation of a message until it's rendered, giving you flexibility in how and where you define messages in your code. With lazy translation, you can tag a string with the [`msg`](/docs/ref/macro.mdx#definemessage) macro to create a _message descriptor_ that can be saved, passed around as a variable, and rendered later.

## Usage Example

To render the message descriptor as a string-only translation, pass it to the [`i18n._()`](/docs/ref/core.md#i18n._) method:

```jsx
import { msg } from "@lingui/core/macro";
import { i18n } from "@lingui/core";

const favoriteColors = [msg`Red`, msg`Orange`, msg`Yellow`, msg`Green`];

export function getTranslatedColorNames() {
  return favoriteColors.map((color) => i18n._(color));
}
```

## Usage in React

To render the message descriptor in a React component, pass its `id` to the [`Trans`](/docs/ref/react.md#trans) component as a value of the `id` prop:

```jsx
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react";

const favoriteColors = [msg`Red`, msg`Orange`, msg`Yellow`, msg`Green`];

export default function ColorList() {
  return (
    <ul>
      {favoriteColors.map((color) => (
        <li>
          <Trans id={color.id} />
        </li>
      ))}
    </ul>
  );
}
```

:::info Important
Please note that we import the `<Trans>` component from `@lingui/react` to use the runtime version, as the message is already defined and we don't need the compile-time macro here.
:::

### Picking a Message Based on a Variable

Sometimes you need to choose between different messages to display depending on the value of a variable. For example, imagine you have a numeric "status" code that comes from an API, and you need to display a message that represents the current status.

An easy way to do this is to create an object that maps the possible values of "status" to message descriptors (tagged with the [`msg`](/docs/ref/macro.mdx#definemessage) macro) and render them as needed with deferred translation:

```jsx
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";

const statusMessages = {
  ["STATUS_OPEN"]: msg`Open`,
  ["STATUS_CLOSED"]: msg`Closed`,
  ["STATUS_CANCELLED"]: msg`Cancelled`,
  ["STATUS_COMPLETED"]: msg`Completed`,
};

export default function StatusDisplay({ statusCode }) {
  const { _ } = useLingui();
  return <div>{_(statusMessages[statusCode])}</div>;
}
```
