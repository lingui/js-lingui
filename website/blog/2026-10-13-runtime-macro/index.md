---
title: "Lingui Without a Build Step: the Runtime Macro"
authors: [andrii-bodnar]
tags: [features]
---

Lingui macros turn `` msg`Hello` `` into a message descriptor at build time, so they need Babel, SWC or the native transform. That works well in apps, but not everywhere. Node.js scripts, serverless functions, CLI tools and test runners often run your code as it is, with no compile step. The new experimental runtime macro covers those cases.

<!--truncate-->

## Same messages, no compiler

`@lingui/core/runtime-macro` exports `msg`, `plural`, `select` and `selectOrdinal` as plain functions:

```ts
import { i18n } from "@lingui/core";
import { msg, plural } from "@lingui/core/runtime-macro";

const name = "Tom";
const count = 3;

i18n._(msg`Hello ${{ name }}`);
i18n._(msg`You have ${plural({ count }, { one: "# message", other: "# messages" })}`);
```

They produce the same messages and the same generated IDs as the compile-time macros. A test suite runs every case through both and compares the results. So your catalogs don't change, and a backend without a build step can share messages with a frontend that uses the macros.

To extract these messages, enable the flag in your Lingui config:

```js title="lingui.config.js"
import { defineConfig } from "@lingui/conf";

export default defineConfig({
  sourceLocale: "en",
  locales: ["en", "cs"],
  experimental: {
    runtimeMacro: true,
  },
});
```

## What's different

Variable names can't be read at runtime, so placeholders must be named: `${{ name }}` instead of `${name}`. A plain value throws an error that tells you what to write instead. This is what keeps the messages identical to the compile-time output.

The runtime macro also has no `t` and no JSX: you define a message with `msg` and translate it with `i18n._`. If you prefer a shorter call, `const t = i18n.t` works too. Without a compile step, the source message stays in your bundle. The [reference](/ref/core#runtime-macro) covers the details.

## Experimental for now

The API and the import path may still change in a minor release, and we'll revisit the name before the next major. Real-world feedback will shape both. If you have thoughts on the name, join the [naming discussion](https://github.com/lingui/js-lingui/discussions/2720).

## Try it out

The runtime macro is available in the latest Lingui release. Enable the flag, define a few messages and let us know how it goes in [GitHub Discussions](https://github.com/lingui/js-lingui/discussions). If something doesn't match what the compile-time macro produces, please [open an issue](https://github.com/lingui/js-lingui/issues).
