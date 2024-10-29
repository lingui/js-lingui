---
title: Lazy Translations
description: Lazy translations allow you to defer translation of a message until it is actually displayed.
---

# Lazy Translations

You don't need to declare messages at the same code location where they are displayed. Tag a string with the [`msg`](/docs/ref/macro.mdx#definemessage) macro, and you've created a "message descriptor", which can then be passed around as a variable, and can be displayed as a translated string by passing its `id` to [`Trans`](/docs/ref/macro.mdx#trans) as its `id` prop:

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

:::note
Note that we import `<Trans>` component from `@lingui/react`, because we want to use the runtime `Trans` component here, not the (compile-time) macro.
:::

To render the message descriptor as a string-only translation, pass it to the [`i18n._()`](/docs/ref/core.md#i18n._) method:

```jsx
import { i18n } from "@lingui/core";
import { msg } from "@lingui/core/macro";

const favoriteColors = [msg`Red`, msg`Orange`, msg`Yellow`, msg`Green`];

export function getTranslatedColorNames() {
  return favoriteColors.map((color) => i18n._(color));
}
```

### Picking a message based on a variable

Sometimes you need to pick between different messages to display, depending on the value of a variable. For example, imagine you have a numeric "status" code that comes from an API, and you need to display a message representing the current status.

A simple way to do this is to create an object that maps the possible values of "status" to message descriptors (tagged with the [`msg`](/docs/ref/macro.mdx#definemessage) macro), and render them as needed with deferred translation:

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
