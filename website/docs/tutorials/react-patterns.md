---
title: Common i18n Patterns in React
description: Learn about the most common i18n patterns in React and how to use them with Lingui
---

# Common i18n Patterns in React


## Memoization pitfall

In the following contrived example, we document how a welcome message will or will not be updated when locale changes.

The documented behavior may not be intuitive at first, but it is expected, because of how `useMemo` dependencies work.

To avoid bugs with stale translations, use the `_` function returned from [`useLingui`](/ref/react#uselingui): it is safe to use with memoization because its reference changes whenever the Lingui context updates. We are open to accepting solutions to make working with the Lingui context easier.

Keep in mind that `useMemo` is primarily a performance optimization tool in React. Because of this, there might be no need to memoize your translations. Additionally, this issue is not present when using the `Trans` component which we recommend to use when possible.

```jsx
import { msg } from "@lingui/core/macro";
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
Note on [`useLingui`](/docs/ref/macro.mdx#uselingui) macro usage. The `t` function destructured from this hook, behaves the same way as `_` from the runtime [`useLingui`](/docs/ref/react.md#uselingui) counterpart, so you can safely use it in the dependency array.

```ts
import { useLingui } from "@lingui/react/macro";

export function Welcome() {
  const { t } = useLingui();

  const welcome = useMemo(() => {
    return t`Welcome!`;
  }, [t]);

  return <div>{welcome}</div>;
}
```

:::
