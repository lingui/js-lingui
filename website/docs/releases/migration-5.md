# Migration guide from 4.x to 5.x

This guide will help you migrate from Lingui 4.x to 5.x. It covers the most important changes and breaking changes.

Need to upgrade an older project to v4 first? See our [older migration guide](/docs/releases/migration-4.md).

## Node.js Version

The minimum supported version of Node.js in Lingui v5 is v20.

## React and JS Macros Were Split to Separate Packages

The previous Lingui macro was tightly coupled with React, which posed problems for developers using Lingui with vanilla JavaScript or other frameworks such as Vue.

The `@lingui/macro` package has been split into two separate entry points from the existing packages:

- `@lingui/react/macro`
- `@lingui/core/macro`

**Example Usage:**

```jsx
import { Trans } from "@lingui/react/macro";
import { msg } from "@lingui/core/macro";

const colors = [msg`Red`, msg`Yellow`, msg`Green`];

function MyComponent() {
  <Trans>Hi, my name is {name}</Trans>;
}
```

This change allows developers to use Lingui macros in any JavaScript project without pulling in the entire React package.

### Migration

This is not a breaking change. Imports from `@lingui/macro` still work, but are marked as deprecated. They will be removed in the next major release.

You can use an automatic [codemod](https://www.npmjs.com/package/@lingui/codemods) to convert your codebase to the new imports:

```bash
npx @lingui/codemods split-macro-imports <path>
```

After running this codemod, you can remove `@lingui/macro` from your dependencies.

:::tip
Read more about the motivation and discuss the changes in the [RFC](https://github.com/lingui/js-lingui/issues/1361).
:::

## Whitespace Handling Changes

Lingui has made some changes to how whitespace is handled in JSX and JS macros.

### Robust Whitespace Cleaning in JSX

Whitespace cleaning in JSX expression is unavoidable, otherwise formatting your JSX code, for example with Prettier, will cause changes in extracted message.

```jsx
// prettier-ignore
<Trans>
  Hello◦{"◦"}◦world
</Trans>

// should be extracted as
// "Hello◦◦◦world"
// without new lines in start and end of tag
```

Previously, Lingui used a regexp based approach to normalize whitespaces in the JSX nodes processed by macro. That approach was not perfect and didn't follow JSX language grammar, which sometimes lead to unexpected results.

Now Lingui uses the same set of rules to clean whitespaces as it does in JSX. This leads to more predictable results without unwanted whitespace cleaning.

### No Whitespace Cleaning in JS macros

Based on feedback from developers, it was agreed that whitespace cleaning in JS macros was redundant and counterintuitive.

```js
t`Label:◦` + value;
```

Note the space after ":" - it's expected by the developer to stay in the extracted string, but "normalization" would remove it before. Another example would be markdown or any other reason where the developer wants to keep the original formatting.

From this release, whitespace cleaning for JS macros has been **completely removed**.

### Migration

This is a **breaking change**. Some messages in catalogs might be extracted with different whitespaces and therefore with different ids. There is no way to automatically convert your catalogs to pick up existing translations.

If you use a TMS (such as Crowdin or Translation.io), migration should be straightforward. Use the translation memory feature (or similar). Otherwise, you will need to migrate the catalogs manually.

:::tip
Read more about the motivation and discuss the changes in the [RFC](https://github.com/lingui/js-lingui/discussions/1873).
:::

## Standalone `babel-plugin-lingui-macro`

From this release, there are two ways to use Lingui macro with Babel. With `babel-macro-plugin` and with `babel-plugin-lingui-macro`.

```bash npm2yarn
npm install --save-dev @lingui/babel-plugin-lingui-macro
```

### Migration

If you have access to the babel configuration and don't use any other macro in your code, you can drop `babel-macro-plugin` and add `babel-plugin-lingui-macro` to your babel config.

You will benefit from a slightly faster transpiling time and more configuration options for the plugin that are not available for the `babel-macro-plugin` version.

## Introducing `useLingui` Macro

The `useLingui` macro simplify working with non-jsx messages in react components.

Before this macro you had to combine `t` or `msg` macro with the i18n instance returned from `useLingui` hook:

```jsx
import { t, msg } from "@lingui/macro";
import { useLingui } from "@lingui/react";

function MyComponent() {
  const { i18n, _ } = useLingui();

  const a = t(i18n)`Text`;
  // or
  const b = _(msg`Text`);
}
```

With the new macro code above simplifies to:

```jsx
import { useLingui } from "@lingui/react/macro";

function MyComponent() {
  const { t } = useLingui();

  const a = t`Text`;
}
```

Note that `useLingui()` is imported from `@lingui/react/macro`, because it's a macro and not a runtime function. This will be transpiled to the regular `useLingui` from `@lingui/react` under the hood by Lingui.

:::tip
Read more about the motivation and discuss the changes in the [RFC](https://github.com/lingui/js-lingui/issues/1852).
:::

## Print Placeholder Values for Better Translation Context

If the message contains unnamed placeholders such as `{0}`, Lingui will print their values into PO comments, so that translators and AI get more context on what the placeholder is about.

```js
t`Hello ${user.name} ${value}`;
```

This will be extracted as:

Before:

```po
msgid "Hello {0} {value}"
```

Now:

```po
#. placeholder {0}: user.name
msgid "Hello {0} {value}"
```

This feature is enabled by default and can be disabled by setting `printPlaceholdersInComments` to `false` in the [configuration](/docs/ref/catalog-formats.md#po).

## Compiled Messages Structure Changes

The structure of compiled messages has been changed to make them more predictable and easier to work with.

**Previous Format**:

- Messages without ICU placeholders were represented as strings.
- Messages with ICU placeholders were represented as arrays.
- This inconsistency made it difficult to distinguish between compiled and uncompiled messages, leading to problems such as double compilation.

```json
{
  "simpleMessage": "Hello, world!",
  "messageWithICU": ["Hello ", "name", "!"]
}
```

**New Format**:

- All uncompiled messages are always represented as strings.
- All compiled messages are always represented as arrays.

```json
{
  "simpleMessage": ["Hello, world!"],
  "messageWithICU": ["Hello", "name", "!"]
}
```

You'll need to [re-compile](/docs/ref/cli.md#compile) your messages in the new format.

## Deprecations and Removals

- Removed the deprecated `isTranslated` prop from the React `Trans` component.
