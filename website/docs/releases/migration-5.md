# Migration guide from 4.x to 5.x

## Node.js version

TBD

## Split React and JS Macro into separate packages

The current Lingui macro is tightly coupled with React, which poses problems for developers using vanilla JavaScript or other frameworks such as Vue.

#### Issues

- The existing macro assumes React usage, which isn't ideal for non-React projects.
- Using `@types/react` and `@lingui/react` adds React dependencies to projects that don't use React, which is unnecessary.

#### Benefits of the Split

- Allows the macro to be used with other JSX-based frameworks in the future.
- Removes unwanted React dependencies, making Lingui more versatile.

#### Solution

To address this, the macro package has been split into two separate packages:

- `@lingui/react/macro`
- `@lingui/core/macro`

Also, the transformation code has been extracted into a separate Babel plugin `@lingui/babel-plugin-lingui-macro`, which can be used independently of `babel-plugin-macros`.

**Example Usage:**

```jsx
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";

function MyComponent() {
  <Trans>Hi, my name is {name}</Trans>
  <span title={t`Title`} />
}
```

#### Migration Strategy

- Users can migrate gradually by starting with `@lingui/macro`, which consolidates macros from both core and React-specific packages.
- Over time, users are encouraged to migrate directly to `@lingui/core/macro` or `@lingui/react/macro` depending on their specific needs.

:::tip
There is a Codemod [@lingui/codemods](https://www.npmjs.com/package/@lingui/codemods) to help you with the migration. Check out the [`split-macro-imports.ts`](https://github.com/lingui/codemods/blob/main/transforms/split-macro-imports.ts) for more details.
:::

## Full Vue.js support

TBD ([#1925](https://github.com/lingui/js-lingui/pull/1925))

## Whitespaces handling changes

The current whitespace handling in Lingui, specifically through `normalizeWhitespace`, has been identified as problematic due to occasional incorrect processing of whitespace normalization. This proposal suggests a revised approach that uses stricter rules based on JSX node types to ensure more accurate and predictable whitespace handling.

#### Issues

- The existing `normalizeWhitespace` function uses regex to manage whitespace, which sometimes leads to unintended normalization results.
- Complex JSX structures and interactions with Babel transformations can further complicate whitespace management.
- The current method merges various JSX node types into a single string before normalization, potentially losing context-specific whitespace information.

#### Solution

- **Utilize JSX Node Information:**
  - Instead of treating JSX content as a single string for normalization, use specific JSX node types (e.g., JSXText, JSXExpressionContainer) to apply appropriate whitespace rules.
  - Implement a function (cleanJSXElementLiteralChild) that adheres to JSX's intrinsic whitespace handling rules, similar to those defined in Babel's sources.

**Before:**

```ts
<Trans>Hello◦{"◦"}◦world</Trans>
// -> normalizeWhitespace("Hello◦◦◦world")  we lost here information that middle space came from explicit `{"◦"}`
```

**After:**

```ts
<Trans>Hello◦{"◦"}◦world</Trans>

// there are strict rules how whitespaces processed in JSXText,
// use `cleanJSXElementLiteralChild` function which follows this rules (taken from babel's sources)
cleanJSXElementLiteralChild("processHello◦") // JSXText
{"◦"} // JSXExpressionContainer - arbitary content, left as is
cleanJSXElementLiteralChild("◦world") // JSXText
```

This revised approach to whitespace handling in Lingui addresses current limitations and aligns with best practices observed in JSX processing. The processing now mirrors how JSX handles whitespace.

## Introducing `useLingui` Macro for Simplified Localization in React

The `useLingui` macro simplifies the handling of non-JSX messages in React components, making internationalization (i18n) integration easy. It replaces direct `t` function calls with cleaner syntax and supports advanced usage within React hooks.

**For example:**

```jsx
import { useLingui } from "@lingui/macro";
function MyComponent() {
  const { t } = useLingui();
  const a = t`Text`;
}

// ↓ ↓ ↓ ↓ ↓ ↓

import { useLingui } from "@lingui/react";
function MyComponent() {
  const { _: _t } = useLingui();
  const a = _t(
    /*i18n*/
    {
      id: "xeiujy",
      message: "Text",
    }
  );
}
```

As a result, it reduces complexity by consolidating i18n handling into a single macro call.

## Dependency tree crawling extractor improvements

TBD ([#1958](https://github.com/lingui/js-lingui/pull/1958))

## Improved context

This proposal improves Lingui messages by automatically adding placeholder values as comments in PO files. This improves clarity for translators and AI tools. This feature provides critical **context** to support accurate translations.

For example:

```js title="Message"
t`from ${myTrip.date}`;
```

```po title="PO file" {1}
#. placeholder {0}: myTrip.date
msgid "from {0}"
```

In case the string is used in multiple places with different values, the context will be more specific:

```js title="Messages"
t`from ${myTrip.date}`;

// ...

t`from ${eventDate}`;
```

```po title="PO file" {1,2}
#. placeholder {0}: myTrip.date
#. placeholder {0}: eventDate
msgid "from {0}"
```

By improving the handling of placeholder contexts, Lingui enhances the **usability for translators and AI**, promoting more accurate and efficient localization processes.

## Deprecations

- Removed the deprecated `isTranslated` property (React `Trans` component)
