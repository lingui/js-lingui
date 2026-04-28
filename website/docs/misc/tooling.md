---
title: Third-Party Modules
description: Community-built addons, framework integrations, CLI tools, and translation services that extend Lingui - including support for Svelte, Astro, Bun, and more
---

# Third-Party Modules

A collection of community-built addons, tools, and services that extend Lingui.

## Framework Integrations

### lingui-for (Svelte & Astro)

[lingui-for](https://lingui-for.roundtrip.dev/) is a community-maintained project that brings Lingui macro support to frameworks with their own authoring syntax. It lets you write `t`, `msg`, `Trans`, `Plural`, and friends directly in Svelte and Astro files, while keeping behavior aligned with official Lingui Core and React semantics - including the same extraction and compile workflows you already know.

Svelte support takes advantage of the framework's reactivity model for reactive macro ergonomics. Astro support is tailored to Astro's request-scoped, mostly non-reactive nature, focusing on request-bound translation and server-safe rich text.

- [Get started with Svelte](https://lingui-for.roundtrip.dev/frameworks/svelte/getting-started)
- [Get started with Astro](https://lingui-for.roundtrip.dev/frameworks/astro/getting-started)

### svelte-i18n-lingui

[`svelte-i18n-lingui`](https://www.npmjs.com/package/svelte-i18n-lingui) adds i18n to Svelte/SvelteKit projects using a gettext-style approach, where the base-language text itself serves as the catalog ID. It ships with a custom extractor for both `.svelte` and `.ts`/`.js` files, Svelte store-based reactivity so the UI responds to locale changes in real time, and a shortened message hash for compiled catalogs to keep bundle sizes small. The syntax closely mirrors Lingui macros - tagged template literals for simple strings, `msg` for deferred extraction, and a `<T>` component for rich inline elements.

### GraphCommerce (Next.js)

[`@graphcommerce/lingui-next`](https://github.com/graphcommerce-org/graphcommerce/tree/main/packages/lingui-next) adds Lingui to [GraphCommerce](https://graphcommerce.org/) projects built on Next.js. It wires up Lingui's i18n instance with Next.js routing and locale detection so translations are loaded per-page with minimal configuration.

### Bun

[`bun-plugin-lingui-macro`](https://github.com/OfficialPesonen/bun-plugin-lingui-macro) is a Bun plugin that compiles Lingui macros at build time. It enables the same macro-based authoring experience (`t`, `msg`, `Trans`, etc.) in projects that use Bun as their runtime and bundler instead of Node.js and Babel.

## CLI Tools

### linguito

[linguito](https://github.com/Serchinastico/linguito) is a CLI tool that enhances Lingui with AI-powered capabilities for smoother i18n workflows. It provides advanced utilities for managing and validating translation catalogs, helping teams catch missing or inconsistent translations early in the development process.

## Translation Services

### Lingui String Exporter (Crowdin)

[Lingui String Exporter](https://store.crowdin.com/lingui-string-exporter) is a Crowdin Marketplace plugin that enables Over-the-Air (OTA) content delivery for Lingui applications. Normally, updating translations requires a code change and a full deployment. With this plugin, Crowdin compiles translations into optimized JSON bundles that your app can fetch at runtime via the [Crowdin OTA JS Client](https://crowdin.github.io/ota-client-js/), skipping the compile step entirely. This makes it ideal for multilingual apps that need frequent translation updates without redeployment.

### Auto Translation Tool

[Auto Translation Tool](https://auto-translation.now.sh/) is a web-based tool for machine-translating Lingui JSON catalog files. Paste your catalog, select target languages, and receive translated output ready to drop into your project.
