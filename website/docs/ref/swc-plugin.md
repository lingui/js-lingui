---
title: Lingui SWC Plugin
description: Use Lingui Macros in your SWC project
---

# SWC Plugin

[SWC](https://swc.rs/) is an extensible Rust-based platform for the next generation of fast developer tools.

If you're using SWC in your project, you can opt for the `@lingui/swc-plugin`. This plugin, designed for SWC, is a Rust version of [LinguiJS Macro](/docs/ref/macro.mdx).

[![npm-version](https://img.shields.io/npm/v/@lingui/swc-plugin?logo=npm&cacheSeconds=1800)](https://www.npmjs.com/package/@lingui/swc-plugin)
[![npm-downloads](https://img.shields.io/npm/dt/@lingui/swc-plugin?cacheSeconds=500)](https://www.npmjs.com/package/@lingui/swc-plugin)

## SWC Compatibility

SWC Plugin support is still experimental. Semver backwards compatibility between different `@swc/core` versions is not guaranteed.

Therefore, you need to select an appropriate version of `@lingui/swc-plugin` to match the compatible `@swc/core` version.

:::tip
It is recommended to check the [plugins.swc.rs](https://plugins.swc.rs/) site to find the compatible version.
:::

## Installation

Install `@lingui/swc-plugin` as a development dependency:

```bash npm2yarn
npm install --save-dev @lingui/swc-plugin
```

## Usage

Add the following configuration to your [`.swcrc`](https://swc.rs/docs/configuration/swcrc) file:

```json title=".swcrc"
{
  "$schema": "https://json.schemastore.org/swcrc",
  "jsc": {
    "experimental": {
      "plugins": [
        [
          "@lingui/swc-plugin",
          {
            // Optional
            // Unlike the JS version this option must be passed as object only.
            // Docs https://lingui.dev/ref/conf#runtimeconfigmodule
            // "runtimeModules": {
            //   "i18n": ["@lingui/core", "i18n"],
            //   "trans": ["@lingui/react", "Trans"]
            // }
          }
        ]
      ]
    }
  }
}
```

If you use Next.js, add the following to your `next.config.js`:

```javascript title="next.config.js"
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    swcPlugins: [
      [
        "@lingui/swc-plugin",
        {
          // the same options as in .swcrc
        },
      ],
    ],
  },
};

module.exports = nextConfig;
```

## Examples

- [React with Vite and SWC](https://github.com/lingui/js-lingui/tree/main/examples/vite-project-react-swc)
- [Next.js with SWC](https://github.com/lingui/js-lingui/tree/main/examples/nextjs-swc)

## Links

- [GitHub Repository](https://github.com/lingui/swc-plugin)
- [NPM Package](https://www.npmjs.com/package/@lingui/swc-plugin)
