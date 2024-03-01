---
title: Common i18n patterns in React
description: Learn about the most common i18n patterns in React and how to use them with Lingui
---

# Common i18n patterns in React

This page describes the most common i18n patterns in React. It's a follow-up to the [tutorial](/docs/tutorials/react.md) with practical examples. See the [API reference](/docs/ref/react.md) for detailed information about all components.

## Macros

Using jsx macros is the most straightforward way to translate your React components.

[`Trans`](/docs/ref/macro.md#trans) handles translations of messages including variables and other React components:

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

You don't need anything special to use [`Trans`](/docs/ref/macro.md#trans) inside your app (except of wrapping the root component in [`I18nProvider`](/docs/ref/react.md#i18nprovider)).

## Element attributes and string-only translations

Sometimes you can't use [`Trans`](/docs/ref/macro.md#trans) component, for example when translating element attributes:

```html
<img src="..." alt="Image caption" />
```

In such case you need to use the [`useLingui()`](/docs/ref/macro.md#uselingui) macro.

```jsx
import { useLingui } from "@lingui/macro";

export default function ImageWithCaption() {
  const { t } = useLingui();

  return <img src="..." alt={t`Image caption`} />;
}
```

If `useLingui` macro is not available in your setup you can use the [`useLingui()`](/docs/ref/react.md#uselingui) runtime hook with the [`msg`](/docs/ref/macro.md#definemessage) macro.

```jsx
import { msg } from "@lingui/macro";
import { useLingui } from "@lingui/react";

export default function ImageWithCaption() {
  const { _ } = useLingui();

  return <img src="..." alt={_(msg`Image caption`)} />;
}
```

## Translations outside React components

Sometimes, you may need to access translations outside React components, which is another common pattern. You can use [`t`](/docs/ref/macro.md#t) macro outside React context as usual:

```jsx
import { t } from "@lingui/macro";

export function showAlert() {
  alert(t`...`);
}
```

:::caution
When you use [`t`](/docs/ref/macro.md#t) macro (and [`plural`](/docs/ref/macro.md#plural), [`select`](/docs/ref/macro.md#select), [`selectOrdinal`](/docs/ref/macro.md#selectordinal)), it uses a global `i18n` instance. While this generally works, there are situations, like in server-side rendering (SSR) applications, where it may not be the best fit.

For better control and flexibility, it's a good idea to avoid the global `i18n` instance and instead use a specific instance tailored to your needs.

```ts
import { msg, useLingui } from "@lingui/macro";
import { I18n } from "@lingui/core";

export function showAlert(i18n: I18n) {
  alert(i18n._(msg`...`));
}

function MyComponent() {
  // get i18n instance from React Context
  const { i18n } = useLingui();

  // pass instance outside
  showAlert(i18n);
}
```

Note that we import `useLingui` from `@lingui/macro`. There is also a runtime version of `useLingui` hook exported from `@lingui/react`. In the case above, it doesn't matter what version to choose since we use only `i18n` object which is presented in both.

:::

:::note
All js macros such as [`t`](/docs/ref/macro.md#t) [`plural`](/docs/ref/macro.md#plural), [`select`](/docs/ref/macro.md#select), [`selectOrdinal`](/docs/ref/macro.md#selectordinal) cannot be used on the module level.

```jsx
import { t } from "@lingui/macro";

// ❌ Bad! This won't work because the `t` macro is used at the module level.
// The `t` macro returns a string, and once this string is assigned, it won't react to locale changes.
const colors = [t`Red`, t`Orange`, t`Yellow`, t`Green`];

// ✅ Good! Every time the function is executed, the `t` macro will be re-executed as well,
// and the correctly translated color labels will be returned.
function getColors() {
  return [t`Red`, t`Orange`, t`Yellow`, t`Green`];
}
```

There is an [ESLint Rule](https://github.com/lingui/eslint-plugin#t-call-in-function) designed to check for this misuse.

A better option would be to use the Lazy Translations pattern described in the following paragraph.
:::

## Lazy Translations

You don't need to declare messages at the same code location where they are displayed. Tag a string with the [`msg`](/docs/ref/macro.md#definemessage) macro, and you've created a "message descriptor", which can then be passed around as a variable, and can be displayed as a translated string by passing its `id` to [`Trans`](/docs/ref/macro.md#trans) as its `id` prop:

```jsx
import { msg } from "@lingui/macro";
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
import { msg } from "@lingui/macro";

const favoriteColors = [msg`Red`, msg`Orange`, msg`Yellow`, msg`Green`];

export function getTranslatedColorNames() {
  return favoriteColors.map((color) => i18n._(color));
}
```

### Picking a message based on a variable

Sometimes you need to pick between different messages to display, depending on the value of a variable. For example, imagine you have a numeric "status" code that comes from an API, and you need to display a message representing the current status.

A simple way to do this is to create an object that maps the possible values of "status" to message descriptors (tagged with the [`msg`](/docs/ref/macro.md#definemessage) macro), and render them as needed with deferred translation:

```jsx
import { msg } from "@lingui/macro";
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

## Memoization pitfall

In the following contrived example, we document how a welcome message will or will not be updated when locale changes.

The documented behavior may not be intuitive at first, but it is expected, because of how `useMemo` dependencies work.

To avoid bugs with stale translations, use the `_` function returned from [`useLingui`](/ref/react#uselingui): it is safe to use with memoization because its reference changes whenever the Lingui context updates. We are open to accepting solutions to make working with the Lingui context easier.

Keep in mind that `useMemo` is primarily a performance optimization tool in React. Because of this, there might be no need to memoize your translations. Additionally, this issue is not present when using the `Trans` component which we recommend to use when possible.

```jsx
import { msg } from "@lingui/macro";
import { i18n } from "@lingui/core";

const welcomeMessage = msg`Welcome!`;

// ❌ Bad! This code won't work
export function Welcome() {
  const buggyWelcome = useMemo(() => {
    return i18n._(welcomeMessage);
  }, []);

  return <div>{buggyWelcome}</div>;
}

// ❌ Bad! This code won't work either because the reference to i18n does not change
export function Welcome() {
  const { i18n } = useLingui();

  const buggyWelcome = useMemo(() => {
    return i18n._(welcomeMessage);
  }, [i18n]);

  return <div>{buggyWelcome}</div>;
}

// ✅ Good! `useMemo` has i18n context in the dependency
export function Welcome() {
  const linguiCtx = useLingui();

  const welcome = useMemo(() => {
    return linguiCtx.i18n._(welcomeMessage);
  }, [linguiCtx]);

  return <div>{welcome}</div>;
}

// 🤩 Better! `useMemo` consumes the `_` function from the Lingui context
export function Welcome() {
  const { _ } = useLingui();

  const welcome = useMemo(() => {
    return _(welcomeMessage);
  }, [_]);

  return <div>{welcome}</div>;
}
```

:::note
Note on [`useLingui`](/ref/macro#uselingui) macro usage. The `t` function destructured from this hook, behaves the same way as `_` from the runtime [`useLingui`](/ref/react#uselingui) counterpart, so you can safely use it in the dependency array.

```ts
import { useLingui } from "@lingui/macro";

export function Welcome() {
  const { t } = useLingui();

  const welcome = useMemo(() => {
    return t`Welcome!`;
  }, [t]);

  return <div>{welcome}</div>;
}
```

:::
