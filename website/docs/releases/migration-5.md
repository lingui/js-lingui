# Migration guide from 4.x to 5.x

## Node.js version

TBD

## React and JS Macros were split to separate packages

The previous Lingui macro was tightly coupled with React, which posed problems for developers using Lingui with vanilla JavaScript or other frameworks such as Vue.

The macro package has been split into two separate entrypoints from existing packages:

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

### Migration

This is not a breaking change.

Imports from `@lingui/macro` still work, but are marked as deprecated. They will be removed in the next major release.

You can use an automatic [codemod](https://www.npmjs.com/package/@lingui/codemods) to convert your codebase to the new imports:

```bash
npx @lingui/codemods split-macro-imports <path>
```

After running this codemod you can drop `@lingui/macro` from your dependencies.

## Full Vue.js support

TBD ([#1925](https://github.com/lingui/js-lingui/pull/1925))

## Changes in whitespaces handling

### Robust whitespace cleaning in JSX

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

With v5, Lingui uses the same set of rules to clean whitespaces as it's done in JSX. This leads to more predictable results without unwanted cleaning of whitespaces.

### No whitespaces cleaning in `t` and other JS macros

Based on feedback from developers, it was agreed that whitespace cleaning in the JS macros is redundant and counterintuitive.

```js
t`Label:◦` + value;
```

Note the space after ":" - it's expected by developer to stay in the extracted string, but "normalization" would previously remove it.

Other example would be markdown, or any reason for which developer wants to keep the original formatting.

Starting from v5, cleaning whitespaces for JS macros is completely removed.

### Migration

This is a breaking change. Some messages in catalogs might be extracted with different whitespaces and therefore with different ids.

There is no way to automatically convert your catalogs to pick-up existing translation.

If you use TMS (such as Crowdin or Translation.io), migration should be pretty simple. Use Translation Memory feature (or analog).

If you don't use a TMS you will need to migrate catalogs manually.

## Standalone `babel-plugin-lingui-macro`

Starting with this version there two ways of using Lingui macro with Babel. With `babel-macro-plugin` and with `babel-plugin-lingui-macro`.

```bash npm2yarn
npm install --save-dev @lingui/babel-plugin-lingui-macro
```

### Migration

If you have access to the babel configuration and don't use any other macro in your code, you can drop `babel-macro-plugin` and add `babel-plugin-lingui-macro` to your babel config.

You will benefit from a slightly faster transpiling time and more configuration options for the plugin which are not available for `babel-macro-plugin` version.

## Introducing `useLingui` macro

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

## Dependency tree crawling extractor improvements

TBD ([#1958](https://github.com/lingui/js-lingui/pull/1958))

## Print placeholder values for better translation context

If the message contains unnamed placeholders such as `{0}`, Lingui will print their values into PO comments, so that translators and AI get more context on what the placeholder is about.

```js
t`Hello ${user.name} ${value}`;
```

This will be extracted as

Before:

```po
msgid "Hello {0} {value}"
```

After:

```po
#. placeholder {0}: user.name
msgid "Hello {0} {value}"
```

## Deprecations

- Removed the deprecated `isTranslated` property (React `Trans` component)
