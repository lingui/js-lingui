---
title: Announcing Lingui 6.0
authors: andrii-bodnar
tags: [release]
image: ./social-card.png
---

We're announcing Lingui 6.0! :rocket:

This release focuses primarily on **technical improvements and modernization** of the codebase. It includes the transition to ESM-only distribution, reduced dependency graph, removal of deprecated APIs, and improved TypeScript support. It also introduces a few new features. In this post, we'll highlight the key changes in this release.

In line with the principles of [Semantic Versioning](https://semver.org/), this release contains **breaking changes** that we have thoroughly documented in the [v6 migration guide](/releases/migration-6).

![social-card image](./social-card.png)

<!--truncate-->

## Table of Contents

- [What is Lingui?](#what-is-lingui)
- [Progress Highlights](#progress-highlights)
- [Recap](#recap)
  - [Ecosystem](#ecosystem)
  - [Embracing the AI Era](#embracing-the-ai-era)
  - [CLI Multithreading](#cli-multithreading)
  - [Explicit Placeholder Labels Macro](#explicit-placeholder-labels-macro)
- [What's New in 6.0?](#whats-new-in-60)
  - [ESM-Only Distribution](#esm-only-distribution)
  - [Reduced Package Size](#reduced-package-size)
  - [Configurable JSX Placeholder Names in `<Trans>`](#configurable-jsx-placeholder-names-in-trans)
  - [Vue 3 Reactivity Transform in Vue Extractor](#vue-3-reactivity-transform-in-vue-extractor)
  - [Vite Plugin Improvements](#vite-plugin-improvements)
  - [Stronger Type Safety](#stronger-type-safety)
  - [New Example](#new-example)
- [Conclusion](#conclusion)
- [Links](#links)

## What is Lingui?

Lingui is an open-source JavaScript library for internationalization (**i18n**) and localization (**l10n**). Designed to make it easy for developers to build fully translated, multilingual applications, it offers support for React, React Native, Vue.js, Node.js, TypeScript. It is also compatible with Astro and Svelte via community-supported packages.

## Progress Highlights

The journey from [Lingui 5.0](/blog/2024/11/28/announcing-lingui-5.0) includes **22 version updates** (minor and patch), more than **130 closed issues**, and more than **170 merged pull requests**.

Before we dive into the changes in 6.0, let's take a look at the project's metrics since version 5.0. The project has grown significantly, with GitHub stars up 24% and significantly increased downloads across all packages:

```mermaid
%%{init: {"themeCSS": ".node rect { rx: 5; ry: 5; }"} }%%

graph LR
    subgraph OCT2024["<b>October 2024</b>"]
        stars1["GitHub Stars ⭐<br/>4.6K"]

        subgraph downloads1["Downloads 📥 / month"]
            A1["@lingui/core<br/>1.3M"]
            A2["@lingui/react<br/>770k"]
            A3["@lingui/swc-plugin<br/>186k"]
            A4["@lingui/vite-plugin<br/>147k"]
        end
    end

    subgraph MAR2026["<b>March 2026</b>"]
        stars2["GitHub Stars ⭐<br/>5.7K"]

        subgraph downloads2["Downloads 📥 / month"]
            B1["@lingui/core<br/>4.4M"]
            B2["@lingui/react<br/>2M"]
            B3["@lingui/swc-plugin<br/>819k"]
            B4["@lingui/vite-plugin<br/>760k"]
        end
    end

    stars1 -->|"<b>ㅤ+24%ㅤ</b>"| stars2
    A1 -->|"<b>ㅤ+238%ㅤ</b>"| B1
    A2 -->|"<b>ㅤ+160%ㅤ</b>"| B2
    A3 -->|"<b>ㅤ+340%ㅤ</b>"| B3
    A4 -->|"<b>ㅤ+417%ㅤ</b>"| B4

style stars1 stroke-width:2px,rx:20,ry:20
style stars2 stroke-width:2px,rx:20,ry:20
```

(_The download numbers are based on the [npm-stat.com](https://npm-stat.com/) data_)

Additionally, `eslint-plugin-lingui` has seen strong adoption, with monthly downloads growing from **~107k** to **~791k** (+639%) over the same period.

## Recap

Let's quickly walk through some of the major changes that have happened between 5.0 and 6.0.

### Ecosystem

We've introduced a new example project featuring Lingui + [TanStack Start](https://tanstack.com/start/latest)! Add internationalization to your TanStack Start apps using Lingui's powerful localization tools with Vite and Babel plugin integration.

📖 View the [TanStack Start example](https://github.com/lingui/js-lingui/tree/main/examples/tanstack-start).

### Embracing the AI Era

With the growing prevalence of AI-powered development tools, we've worked to ensure Lingui integrates seamlessly with this new paradigm.

We now provide [`llms.txt`](https://lingui.dev/llms.txt) and [`llms-full.txt`](https://lingui.dev/llms-full.txt) documentation files following the [llms.txt specification](https://llmstxt.org/), optimized for LLM context windows. [Context7](https://context7.com/lingui/js-lingui) provides Lingui documentation via MCP, allowing AI assistants to fetch up-to-date docs directly into prompts.

We've also released [Lingui Skills](https://github.com/lingui/skills) - Agent Skills that help AI coding assistants implement internationalization correctly. Available skills cover best practices and other helpful tips.

📖 See the [i18n with AI](/ai-tools) documentation page for more details.

### CLI Multithreading

The CLI received significant performance improvements with worker thread support. Multithreading is now available across all CLI commands: `extract`, `compile`, `extract-template`, and `extract-experimental` (the dependency-tree based extractor). Each command processes files, catalogs, or locales in parallel using a worker pool.

You can configure the number of worker threads with the `--workers` flag:

```bash
lingui extract --workers 4
```

By default, Lingui uses CPU cores - 1, capped at 8. Use `--workers 1` to disable multithreading and run in a single process.

### Explicit Placeholder Labels Macro

The [`ph()`](/ref/macro#ph) macro allows labeling placeholders with meaningful names. Without it, complex
expressions become positional placeholders (`{0}`, `{1}`). With `ph()`, you can assign names that provide
better context for translators:

```diff
- t`Hello ${getUserName()}`;
+ t`Hello ${ph({ name: getUserName() })}`;
```

```diff
- msgid "Hello {0}"
- msgstr "Hello {0}"
+ msgid "Hello {name}"
+ msgstr "Hello {name}"
```

Named placeholders help translators understand _what_ the value represents, so they can choose the correct grammar or wording for the target language.

📖 Read more about the `ph()` macro in the [macro documentation](/ref/macro#ph).

## What's New in 6.0?

### ESM-Only Distribution

Lingui 6.0 is distributed as **ESM-only** (ECMAScript Modules). ESM is the official, standardized module system for JavaScript, and the ecosystem has largely converged on it. After years of shipping dual ESM/CommonJS builds, we've taken the step to simplify.

**Why ESM-only?** Dual builds came with real costs: they nearly doubled our package sizes, added maintenance complexity (conditionals, workarounds, and separate entry points), and occasionally led to subtle bugs from module duplication and dependency resolution. Going ESM-only makes Lingui smaller, simpler to maintain, and aligned with where the ecosystem is headed. With Node.js supporting [`require(esm)`](https://joyeecheung.github.io/blog/2024/03/18/require-esm-in-node-js/) in recent versions, the transition is smooth for most users.

**Node.js v22.19+** (or v24+) is now required. This aligns with the ESM-only move and lets us rely on modern Node behavior without legacy workarounds.

### Reduced Package Size

Lingui 6.0 is noticeably lighter to install and maintain. Across the core packages, we cut both disk usage and transitive dependency count.

To make this representative of real projects, the numbers are calculated for `@lingui/core`, `@lingui/react`, and `@lingui/cli` together. Most apps use this combination, so measuring them as a set captures the practical install footprint better than showing each package in isolation.

#### `node_modules` Footprint

The combined install of `@lingui/core` + `@lingui/react` + `@lingui/cli` dropped from **62 MB to 35 MB** - a ~44% reduction. That means faster `npm install`, lighter CI caches, and less disk clutter on every developer's machine.

#### Dependency Count

The transitive dependency tree shrank from **146 packages down to 104** - 42 fewer packages to resolve, download, and audit on every install. The graph below shows just how much the tree thinned out:

![Dependency graph comparison](./deps-light.png#gh-light-mode-only)
![Dependency graph comparison](./deps-dark.png#gh-dark-mode-only)

### Configurable JSX Placeholder Names in `<Trans>`

When `<Trans>` includes JSX elements, extracted messages traditionally used numeric placeholders like `<0>...</0>`. This works, but creates two translation problems:

- Numeric tags provide little context to translators, especially in longer messages with several nested elements.
- Reordering or refactoring JSX can change placeholder indices, producing noisy catalog diffs and increasing the chance of unnecessary re-translation.

Lingui 6.0 introduces two new macro config options to make placeholders semantic and more stable:

- [`macro.jsxPlaceholderAttribute`](/ref/conf#macrojsxplaceholderattribute) for explicit local naming (for example, `_t="link"`).
- [`macro.jsxPlaceholderDefaults`](/ref/conf#macrojsxplaceholderdefaults) for project-wide default names by element/tag.

```jsx title="lingui.config.{js,ts}"
import { defineConfig } from "@lingui/cli";

export default defineConfig({
  macro: {
    jsxPlaceholderAttribute: "_t",
    jsxPlaceholderDefaults: {
      a: "link",
      strong: "bold",
    },
  },
});
```

```jsx title="App.jsx"
<Trans>
  Open <a href="/">docs</a> and read the <strong>important</strong> note.
</Trans>
```

```diff title="en.po"
- "Open <0>docs</0> and read the <1>important</1> note."
+ "Open <link>docs</link> and read the <bold>important</bold> note."
```

You can also set an explicit name directly in markup:

```jsx title="App.jsx"
<Trans>
  Read the{" "}
  <a _t="docsLink" href="/docs">
    documentation
  </a>
  .
</Trans>
```

```diff title="en.po"
- "Read the <0>documentation</0>."
+ "Read the <docsLink>documentation</docsLink>."
```

The result is more human-readable messages, better translator context, and fewer accidental translation breaks when UI markup changes.

The same capability is also available in [`@lingui/swc-plugin`](/ref/swc-plugin), so teams using either Babel or SWC can keep placeholder naming behavior consistent.

### Vue 3 Reactivity Transform in Vue Extractor

The Vue extractor now supports [Vue's Reactivity Transform](https://github.com/vuejs/rfcs/discussions/502) (reactive props destructure in `<script setup>`). In Vue 3, destructuring props from `defineProps()` is compiled in a way that can change how variables appear in the generated code. If the extractor runs on the raw source while your app runs on the compiled output, message IDs can diverge and translations may not resolve at runtime.

To align extraction with your build, use the new `createVueExtractor()` factory and enable the `reactivityTransform` option when your project uses the transform:

```js title="lingui.config.{js,ts}"
import { defineConfig } from "@lingui/cli";
import { createVueExtractor } from "@lingui/extractor-vue";

export default defineConfig({
  locales: ["en", "cs"],
  extractors: [createVueExtractor({ reactivityTransform: true })],
});
```

The option is opt-in (`reactivityTransform: false` by default) so existing setups keep working.

### Vite Plugin Improvements

`@lingui/vite-plugin` now supports Vite 8 and ships `linguiTransformerBabelPreset` - a shortcut for wiring Rolldown and Babel when you use Lingui macros in a Vite-based build:

```ts title="vite.config.ts"
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { lingui, linguiTransformerBabelPreset } from "@lingui/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    lingui(),
    babel({
      presets: [linguiTransformerBabelPreset()],
    }),
  ],
});
```

### Stronger Type Safety

This release tightens TypeScript types for better safety across core packages.

Several packages now use stricter nullability behavior, and optional values are handled consistently with TypeScript conventions (e.g. `undefined` instead of `null` where appropriate). We've also clarified the separation between extracted-message shapes and loaded-catalog message shapes for better type accuracy in custom extractors, formatters, or tooling.

Most apps are unaffected, but custom integrations may need small updates.

### New Example

We now have a [React Webpack Po-Gettext](https://github.com/lingui/js-lingui/tree/main/examples/react-webpack-gettext) example in the repo. It uses the [po-gettext](/ref/catalog-formats#po-gettext) formatter for plurals, a minimal webpack setup for React and TypeScript, and dynamic loading of compiled JSON catalogs. It is listed on our [Examples page](/examples) alongside the other starter projects.

## Conclusion

We're excited to continue improving Lingui and hope you enjoy using Lingui 6.0. We look forward to hearing your feedback!

A huge thank you to everyone who contributed to this release - it simply wouldn't have been possible without the amazing [community](/community)!

## Links

- [Migration guide](/releases/migration-6)
- [Release notes & changelog](https://github.com/lingui/js-lingui/releases/tag/v6.0.0)
