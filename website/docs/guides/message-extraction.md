---
title: Message Extraction
description: Learn about message extraction in i18n and how to use Lingui to extract messages from your application
---

# Message Extraction

Message extraction is an essential step in the internationalization process. It involves analyzing your code and extracting all messages defined in it so that your message catalogs are always up-to-date with the source code.

To extract messages (as marked with `<Trans>`, `t` or other macros) from your application, use the `lingui extract` cli command.

## Supported patterns

The extractor operates on a static level and doesn't execute your code. As a result, complex patterns and dynamic code are not supported.

### Macro usages

Extractor supports all macro usages, such as the following examples:

```tsx
t`Message`;

t({
  id: "ID Some",
  message: "Message with id some",
});

const jsx = <Trans>Hi, my name is {name}</Trans>;
```

For more usage examples, refer to the [macro documentation](/docs/ref/macro.mdx).

### Non-Macro usages

Note that the non-macro usage is not common. We recommend you use macros.

The extractor matches `i18n._` or `i18n.t` function calls. It also matches when these functions are called from other member expressions, such as `ctx.i18n.t()`.

:::note
Extractor matches calls only by name. It doesn't check whether they were really imported from Lingui packages.
:::

```ts
i18n._("message.id");
i18n._({ id: "message.id" });

ctx.i18n._("message.id");
ctx.i18n.t("message.id");

ctx.request.i18n.t("message.id");

// and so on
```

You can ignore a specific call expression by adding a `lingui-extract-ignore` comment.

```ts
/* lingui-extract-ignore */
ctx.i18n._("Message");
```

This message would not be extracted.

### Explicitly marking messages

Apart from call expressions, which are the most commonly used method, the extractor tool also supports simple string literals and message descriptors with explicit annotations.

To do this, simply prefix your expression with the `/*i18n*/` comment, like so:

```ts
const messageDescriptor: MessageDescriptor = /*i18n*/ { id: "Description", comment: "description" };
const stringLiteral = /*i18n*/ "Message";
```

## Unsupported Patterns

The extractor is limited to extracting messages from code that is written in a certain way. It cannot extract messages from variables or function calls. It also cannot follow program structure and get the value of a variable defined elsewhere.

This means that in order for a message to be extracted, it must be defined directly in the function call.

For example, the following code cannot be extracted:

```ts
const message = "Message";
i18n._(message);
```

Instead, you should define the message directly in the function arguments:

```ts
i18n._("Message");
```

## Defining sources for analyzing

The lingui extract command can discover source files in two ways: by using a glob pattern or by crawling the dependency tree.

### Glob Pattern

By default, `lingui extract` uses a glob pattern to search for source files that contain messages.

The pattern is defined in the `catalogs` property in the `lingui.config.js` file, which is located in the root directory of your project.

![Scheme of discovering by glob pattern](/img/docs/extractor-glob-scheme.jpg#gh-light-mode-only)
![Scheme of discovering by glob pattern](/img/docs/extractor-glob-scheme-dark.jpg#gh-dark-mode-only)

### Dependency tree crawling (experimental)

:::caution
This is experimental feature. Experimental features not covered by semver and might be subject of a change.
:::

Although the glob-based extraction process is effective for most projects, however, multipage (MPA) frameworks such as NextJS pose a problem because the glob-based approach creates a catalog consisting of all messages from all pages.

This means that the entire catalog must be loaded for each page/navigation, which results in loading messages that are not used on that page.

To address this issue, a new `experimental-extractor` has been introduced in version 4.

This extractor uses the dependency tree of files, rather than just a glob pattern, to crawl imports and discover files more accurately.

By doing so, it creates a more optimized catalog that only contains the messages needed for each page.

The catalogs would still contain duplicating messages for common components, but it would be much better than the current approach.

![Scheme of discovering by dependencies](/img/docs/extractor-deps-scheme.jpg#gh-light-mode-only)
![Scheme of discovering by dependencies](/img/docs/extractor-deps-scheme-dark.jpg#gh-dark-mode-only)

To start using `experimental-extractor`, you need to add the following section to lingui config:

```ts
/**
 *
 * @type {import('@lingui/conf').LinguiConfig}
 */
module.exports = {
  // remove everethying from `catalogs` property
  catalogs: [],
  // highlight-start
  experimental: {
    extractor: {
      // glob pattern of entrypoints
      // this will find all nextjs pages
      entries: ["<rootDir>/src/pages/**/*.tsx"],
      // output pattern, this instruct extractor where to store catalogs
      // src/pages/faq.tsx -> src/pages/locales/faq/en.po
      output: "<rootDir>/{entryDir}/locales/{entryName}/{locale}",
    },
  },
  // highlight-end
};
```

And then call in the terminal:

```bash
lingui extract-experimental
```

#### Notes

It's worth noting that the accuracy of the catalog heavily relies on tree-shaking, a technique used by modern bundlers to eliminate unused code from the final bundle.

If the code passed to the extractor is written in a tree-shakeable way, the user will receive highly accurate catalogs.

While you might think that your code is tree-shakeable, in practice, tree-shaking might work differently than what you expect and some unwanted strings may be included in the catalogs.

To illustrate, let's consider the following code:

```ts
import { msg } from "@lingui/core/macro";

export const species = {
  Cardano: [
    {
      startsAt: 0,
      name: msg`Ghost`,
      icon: "Ghost",
    },
    {
      startsAt: 0.000001,
      name: msg`Plankton`,
      icon: "Plankton",
    },
  ],
};
```

On the surface, it may appear that this code can be safely removed from the final bundle if it's not used. However, the `msg` function call can potentially produce a side effect, preventing the bundler from removing the entire `species` object from the final bundle. As a result, messages defined in this snippet may be included in more catalogs than expected.

To avoid this issue, one solution is to wrap the `species` object inside an Immediately Invoked Function Expression (IIFE) and add the `/* @__PURE__ */` annotation.

By adding this annotation to the IIFE, we are telling the bundler that the entire `species` object can be safely removed if it is not used or exported elsewhere in the code.

## Supported source types

The extractor supports TypeScript, Flow and JavaScript (Stage 3) out of the box.

If you use some experimental features (Stage 0 - Stage 2) or frameworks with custom syntax such as Vue.js or Svelte, you may want to implement your custom extractor.

Visit [Advanced: Custom Extractor](/docs/guides/custom-extractor.md) to learn how to create a custom extractor.
