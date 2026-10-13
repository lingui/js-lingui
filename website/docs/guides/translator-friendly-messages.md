---
title: Translator-friendly Messages
description: Write Lingui messages that give translators and AI the context they need - whole sentences, named placeholders and tags, comments, and context - and enforce it with ESLint
---

# Translator-friendly Messages

Translators rarely see your UI. They see a catalog: one message at a time, out of order, with no screen around it. AI translation tools see exactly the same thing. Everything they can't learn from the message itself is a guess, and every guess is a bug you find only after release.

Lingui gives you several ways to put that missing knowledge into the message. This guide walks through them, from the sentence itself down to a single placeholder, and shows how to enforce each one with the [ESLint Plugin](/ref/eslint-plugin) so quality doesn't depend on code review.

## Keep the Sentence Whole

The most common context loss is splitting a sentence into pieces. Word order, grammar, and agreement differ between languages, so a translator needs the entire sentence to produce a correct one.

Don't build sentences from fragments:

```jsx
// ❌ Three unrelated messages; nothing can be reordered in translation
<Trans>You have</Trans> {count} <Trans>unread messages</Trans>
```

Use one message with placeholders, and let ICU handle the plural forms:

```jsx
import { Plural } from "@lingui/react/macro";

<Plural value={count} one="You have # unread message" other="You have # unread messages" />;
```

The same applies to markup. [`Trans`](/ref/macro#trans) extracts a sentence with inline elements as a single string, so the translator can move the link to wherever their language needs it:

```jsx
import { Trans } from "@lingui/react/macro";

<Trans>
  Read the <a href="/docs">docs</a> before you start.
</Trans>;

// extracted message: "Read the <0>docs</0> before you start."
```

Use [`select`](/ref/macro#select) for grammatical variations such as gender instead of branching in code, so the whole sentence stays in one message for every variant. See [Pluralization](/guides/plurals) for the full set of ICU options.

:::tip Enforce with ESLint
[`no-single-variables-to-translate`](https://github.com/lingui/eslint-plugin/blob/main/docs/rules/no-single-variables-to-translate.md) catches `` t`${value}` `` and `<Trans>{value}</Trans>`, [`no-single-tag-to-translate`](https://github.com/lingui/eslint-plugin/blob/main/docs/rules/no-single-tag-to-translate.md) catches `<Trans><b>{value}</b></Trans>`, and [`no-trans-inside-trans`](https://github.com/lingui/eslint-plugin/blob/main/docs/rules/no-trans-inside-trans.md) catches a sentence that was split into nested `Trans` elements. All three are part of the recommended config.
:::

## Name Your Placeholders

Simple variables become named placeholders automatically. Any other expression becomes a positional one:

```js
import { t } from "@lingui/core/macro";

t`Hello ${name}`; // Hello {name}
t`Hello ${user.name}`; // Hello {0}
t`Hello ${getUserName()}`; // Hello {0}
```

`{0}` says nothing about what will be inserted. Is it a name, a number, a date? Does it need an article, or a specific case? A named placeholder answers those questions for free.

Use the [`ph`](/ref/macro#ph) macro to label any expression:

```js
import { t, ph } from "@lingui/core/macro";

t`Hello ${ph({ name: user.name })}`; // Hello {name}
t`Due ${ph({ dueDate: formatDate(task.due) })}`; // Due {dueDate}
```

It works everywhere expressions are accepted, including [`plural`](/ref/macro#plural), [`select`](/ref/macro#select), and JSX macros:

```jsx
import { Trans } from "@lingui/react/macro";
import { ph } from "@lingui/core/macro";

<Trans>Welcome back, {ph({ username: getUser().name })}!</Trans>;

// extracted message: "Welcome back, {username}!"
```

Extracting the expression into a well-named variable first gives the same result and is often the more readable choice.

:::note
Because variable names become placeholder names, renaming a variable changes the message and therefore its generated ID. `ph` decouples the two: the label stays stable even when the code around it is refactored.
:::

### Placeholder Values in Catalog Comments

For positional placeholders that remain, Lingui prints the source expression as a comment in the PO catalog, so translators at least see where the value comes from:

```po
#. placeholder {0}: user.name
msgid "Hello {0}"
msgstr ""
```

This is on by default and controlled by the [`printPlaceholdersInComments`](/ref/catalog-formats#po-configuration) formatter option. Treat it as a safety net, not a replacement for naming: a comment is easier to overlook than the placeholder itself, and it is not shown by every translation tool.

:::tip Enforce with ESLint
[`no-expression-in-message`](https://github.com/lingui/eslint-plugin/blob/main/docs/rules/no-expression-in-message.md) reports member expressions and function calls inside messages. It accepts plain identifiers, `ph()`, and nested `plural`, `select`, and `selectOrdinal` calls. It is part of the recommended config.
:::

## Name Your Tags

Inline elements inside `Trans` are indexed by default: `<0>`, `<1>`, and so on. In a sentence with two or three elements, the translator has to guess which index is the link and which is the emphasis, and reordering the elements in code silently changes the message.

Configure semantic names once in the Lingui config:

```ts title="lingui.config.ts"
import { defineConfig } from "@lingui/cli";

export default defineConfig({
  // [...]
  macro: {
    jsxPlaceholderAttribute: "_t",
    jsxPlaceholderDefaults: {
      a: "link",
      strong: "bold",
      em: "emphasis",
      br: "br",
    },
  },
});
```

[`macro.jsxPlaceholderDefaults`](/ref/conf#macrojsxplaceholderdefaults) maps tag names to placeholder names, and [`macro.jsxPlaceholderAttribute`](/ref/conf#macrojsxplaceholderattribute) lets you name an individual element inline. The attribute is stripped from the compiled output:

```jsx
import { Trans } from "@lingui/react/macro";

<Trans>
  Click <a href="/">here</a> and <em>read carefully</em>.
</Trans>;
// Click <link>here</link> and <emphasis>read carefully</emphasis>.

<Trans>
  Read the{" "}
  <a _t="docs" href="/docs">
    docs
  </a>{" "}
  or the{" "}
  <a _t="faq" href="/faq">
    FAQ
  </a>
  .
</Trans>;
// Read the <docs>docs</docs> or the <faq>FAQ</faq>.
```

An explicit attribute wins over a default, and a default wins over the numeric index.

:::caution One name per distinct element
A placeholder name can be used only once per message. Two `<a>` elements with different props in the same sentence both map to `link` and the macro throws instead of numbering them. Give at least one of them an explicit `_t`, as in the second example above. Identical elements, such as two `<br />` with no props, share a single placeholder without error.
:::

In TypeScript projects, declare the attribute so it type-checks on every element:

```ts title="lingui.d.ts"
import "react";

declare module "react" {
  interface Attributes {
    _t?: string;
  }
}
```

Named tags are supported by the Babel macro and the [SWC Plugin](/ref/swc-plugin#jsx-placeholder-naming-in-trans).

:::tip Enforce with ESLint
[`no-unnamed-tag-placeholders`](https://github.com/lingui/eslint-plugin/blob/main/docs/rules/no-unnamed-tag-placeholders.md) reports any element inside `Trans` that would still be extracted as a numeric tag. It is not in the recommended config, so enable it once your project has the config above.
:::

## Explain What the Message Means

Placeholders and tags tell the translator what goes into the sentence. Two more pieces of information tell them what the sentence is for.

### Comment

A [`comment`](/ref/macro#comment) is a free-form note for the translator. It ends up in the catalog and in your TMS, and is removed from production code:

```jsx
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";

t({
  message: "Post",
  comment: "Verb: button that publishes the article. Keep it short, max 8 characters.",
});

<Trans comment="Shown in the empty state of the inbox, next to an illustration">No mail yet</Trans>;
```

Good comments say what the UI element is, where it appears, any length limits, and whether a word is a noun or a verb. Short strings such as "Back", "Post", "Save", or "Open" are exactly the ones that need it most.

### Context

[`context`](/guides/explicit-vs-generated-ids#context) disambiguates identical source strings. Two messages with the same text and different contexts get different IDs and can be translated differently:

```jsx
import { Trans } from "@lingui/react/macro";

<Trans context="direction">right</Trans>;
<Trans context="correctness">right</Trans>;
```

Use `comment` when the text is unambiguous and you want to add information. Use `context` when the same text needs two translations. Context also changes the generated ID, so adding it to an already translated message creates a new entry in the catalog.

:::tip Enforce with ESLint
[`require-comment`](https://github.com/lingui/eslint-plugin/blob/main/docs/rules/require-comment.md) requires every message to carry a comment, either directly or from a `lingui-set` directive. It is strict by design and works best on new code or with `text-restrictions`-style exceptions for well-known strings.
:::

## Set Context Once per File

Passing `comment` and `context` to every macro in a component gets noisy fast, and tagged templates such as `` t`Save` `` have no place to pass them at all. The [`lingui-set` and `lingui-reset` comment directives](/ref/macro#lingui-directive) apply values to every macro that follows them in the same file:

```jsx
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";

// lingui-set context="settings" comment="Account settings page"
const title = t`Account`;
const save = t`Save`;

function Page() {
  return <Trans>Delete account</Trans>;
}
// lingui-reset
```

All three messages are extracted with `context="settings"` and the comment. A later `lingui-set` merges into the current values, so you can set a base context at the top of the file and refine it per section. Explicit values on a macro always override the directive.

Directives are the cheapest way to add context to a legacy file where wrapping every call is impractical, and the only way to comment a tagged template literal. See the [reference](/ref/macro#lingui-directive) for merging, unsetting, and the `idPrefix` parameter.

:::tip Enforce with ESLint
A `lingui-set` that is never reset applies to every message added to the file later. [`require-directive-reset`](https://github.com/lingui/eslint-plugin/blob/main/docs/rules/require-directive-reset.md) requires each `lingui-set` to be closed with a `lingui-reset`.
:::

## Point to the Source

The PO formatter records where each message is used:

```po
#: src/pages/Settings.tsx:42
#. Account settings page
msgctxt "settings"
msgid "Save"
msgstr ""
```

The origin comment is enabled by default through the [`origins`](/ref/catalog-formats#po-configuration) and `lineNumbers` options. Translators working in a TMS that shows source references can open the file and see the surrounding code, which is often enough to resolve an ambiguity without a round trip to you. If your team prefers catalogs that don't change on every unrelated edit, set `lineNumbers: false` and keep `origins` on.

Translation platforms add context of their own on top of the catalog, such as screenshots and in-context editing. See [Sync & Collaboration Tools](/tools/introduction) for what each integration supports.

## Checklist

Use this as a review checklist for new messages, and turn as much of it as possible into lint rules:

| Practice                                      | Enforced by                                                                                           |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| One sentence per message, plurals via ICU     | `no-single-variables-to-translate`, `no-single-tag-to-translate`, `no-trans-inside-trans`             |
| Named placeholders, no `{0}`                  | `no-expression-in-message`                                                                            |
| Named tags, no `<0>`                          | `no-unnamed-tag-placeholders` with `macro.jsxPlaceholderAttribute` and `macro.jsxPlaceholderDefaults` |
| A comment on every short or ambiguous message | `require-comment`, or a `lingui-set comment` directive                                                |
| Context for identical strings                 | Review; `lingui-set context` per file                                                                 |
| Directives closed                             | `require-directive-reset`                                                                             |
| Source references in the catalog              | `origins` formatter option, on by default                                                             |

## See Also

- [Explicit vs Generated IDs](/guides/explicit-vs-generated-ids)
- [Pluralization](/guides/plurals)
- [Macros Reference](/ref/macro)
- [ESLint Plugin](/ref/eslint-plugin)
- [Catalog Formats](/ref/catalog-formats)
