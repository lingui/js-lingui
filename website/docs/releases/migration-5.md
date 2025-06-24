# Migration guide from 4.x to 5.x

This guide will help you migrate from Lingui 4.x to 5.x. It covers the most important changes and breaking changes.

Need to upgrade an older project to v4 first? See our [older migration guide](./migration-4.md).

If you're looking for 4.x documentation, you can find it [here](https://js-lingui-m3z8jlqt6-crowdin.vercel.app/).

## Node.js Version

The minimum supported version of Node.js in Lingui v5 is v20.

## React and JS Macros Were Split to Separate Packages

The previous Lingui macro was tightly coupled with React, which posed problems for developers using Lingui with vanilla JavaScript or other frameworks such as Vue.

The `@lingui/macro` package has been split into two separate entry points from the existing packages:

- `@lingui/react/macro` - for React (JSX) macros.
- `@lingui/core/macro` - for Core (JS) macros.

```diff
- import { t, plural, select, selectOrdinal, defineMessage, msg } from "@lingui/macro";
+ import { t, plural, select, selectOrdinal, defineMessage, msg } from "@lingui/core/macro";

- import { Trans, Plural, Select, SelectOrdinal } from "@lingui/macro";
+ import { Trans, Plural, Select, SelectOrdinal } from "@lingui/react/macro";
```

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

There is also a [community codemod](https://gist.github.com/AndrewIngram/299a7370ac636478cc9600872d306031) (based on GritQL) that can help you with the migration.

After migrating your imports, you can remove `@lingui/macro` from your dependencies.

:::info
Read more about the motivation and discuss the changes in the [RFC](https://github.com/lingui/js-lingui/issues/1361).
:::

## Whitespace Handling Changes

To improve consistency and meet developer expectations, the whitespace handling in JSX and JS macros has been adjusted.

### Robust Whitespace Cleaning in JSX

Whitespace cleaning in JSX expression is unavoidable, otherwise formatting your JSX code, for example with Prettier, will cause changes in extracted message.

For example, the following code:

```jsx
// prettier-ignore
<Trans>
  Hello◦{"◦"}◦world
</Trans>
```

... should be extracted as `Hello◦◦◦world` without new lines in the start and end of the tag.

Prior to v5, Lingui used a regexp-based approach to normalize whitespaces in the JSX nodes processed by macros. This approach was not perfect and didn't follow JSX language grammar, which sometimes led to unexpected results.

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

:::info
Read more about the motivation and discuss the changes in the [RFC](https://github.com/lingui/js-lingui/discussions/1873).
:::

## Standalone `babel-plugin-lingui-macro`

Starting with this release, there are now two options for using Lingui macros with Babel: the `babel-macro-plugin` and the standalone `babel-plugin-lingui-macro`.

To install the standalone version:

```bash npm2yarn
npm install --save-dev @lingui/babel-plugin-lingui-macro
```

### Migration

If you have direct access to your Babel configuration and do not use other macros in your project, you can replace `babel-macro-plugin` with `babel-plugin-lingui-macro`.

This switch offers faster transpiling and additional configuration options not available in `babel-macro-plugin`.

Simply add `babel-plugin-lingui-macro` to your Babel configuration to get started:

```diff title=".babelrc"
{
  "plugins": [
-    "macros"
+    "@lingui/babel-plugin-lingui-macro"
  ]
}
```

## Introducing `useLingui` Macro

The new [`useLingui`](../ref/macro.mdx#uselingui) macro simplifies handling non-JSX messages within React components.

Previously, you had to combine the `t` or `msg` macro with the `i18n` instance returned by the [`useLingui`](../ref/react.md#uselingui) hook:

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

With the `useLingui` macro, this setup becomes simpler:

```jsx
import { useLingui } from "@lingui/react/macro";

function MyComponent() {
  const { t } = useLingui();

  const a = t`Text`;
}
```

Note that `useLingui()` is imported from `@lingui/react/macro`, because it's a macro and not a runtime function. Lingui transpiles this to the regular `useLingui` from `@lingui/react` under the hood.

:::info
Read more about the motivation and discuss the changes in the related [issue](https://github.com/lingui/js-lingui/issues/1852).
:::

## Print Placeholder Values for Better Translation Context

Context is critical for translators (and AI) to provide accurate translations. This release introduces a new feature that prints placeholder values in PO comments.

If the message contains unnamed placeholders such as `{0}`, Lingui will print the name of the placeholder variable in the PO comments, so that translators and AI have more context about what the placeholder is.

For example:

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

This feature is enabled by default and can be disabled by setting `printPlaceholdersInComments` to `false` in the [configuration](../ref/catalog-formats.md#po).

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

### Migration

You'll need to re-[`compile`](../ref/cli.md#compile) your messages in the new format.

:::info
Read more about the motivation and discuss the changes in the related [issue](https://github.com/lingui/js-lingui/issues/2043).
:::

## Deprecations

In this release, we've removed some deprecated features and introduced new deprecations.

### Previous Deprecations Removed

- Removed the `isTranslated` prop from the React `Trans` component.
- Removed support of the module path strings in `LinguiConfig.extractors` property. Pass the extractor object directly.

### New Deprecations

Using a custom `i18n` instance with the `t` macro is deprecated. When you use the global `t` macro from `@lingui/macro`, it automatically relies on the global `i18n` instance. If you want to use a custom `i18n` instance, you could pass it directly to the `t` macro like this:

```js
import { t } from "@lingui/macro";

t(i18n)`Hello!`;
```

However, as Lingui evolved, an alternative approach was introduced using the `msg` macro:

```js
import { msg } from "@lingui/macro";

i18n._(msg(`Hello!`));
```

This approach is neither better nor worse; it simply offers a different way to achieve the same result.

From a technical perspective, supporting the custom `i18n` instance with the `t` macro required extra handling in Lingui's plugins for Babel, SWC, and ESLint, which introduced unnecessary complexity and maintenance overhead.

As a result, using a custom `i18n` instance with the `t` macro has been deprecated. To assist with the transition, an automatic migration is available using [GritQL](https://gist.github.com/timofei-iatsenko/876706f265d725d0aac01018f1812b39).
