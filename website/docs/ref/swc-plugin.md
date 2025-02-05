---
title: Lingui SWC Plugin
description: Use Lingui Macros in your SWC project
---

# SWC Plugin

[SWC](https://swc.rs/) is an extensible Rust-based platform for the next generation of fast developer tools.

If you're using SWC in your project, you can opt for the `@lingui/swc-plugin`. This plugin, designed for SWC, is a Rust version of [Lingui Macros](/ref/macro).

[![npm-version](https://img.shields.io/npm/v/@lingui/swc-plugin?logo=npm&cacheSeconds=1800)](https://www.npmjs.com/package/@lingui/swc-plugin)
[![npm-downloads](https://img.shields.io/npm/dt/@lingui/swc-plugin?cacheSeconds=500)](https://www.npmjs.com/package/@lingui/swc-plugin)

## SWC Compatibility

SWC Plugin support is still experimental. Semver backwards compatibility between different `@swc/core` versions [is not guaranteed](https://github.com/swc-project/swc/issues/5060). You need to choose an appropriate version of the `@lingui/swc-plugin` to match the compatible `@swc/core` version.

:::tip
It is recommended to check the [plugins.swc.rs](https://plugins.swc.rs/) site to find the compatible version.
:::

## Installation

Install `@lingui/swc-plugin` as a development dependency:

```bash npm2yarn
npm install --save-dev @lingui/swc-plugin
```

To ensure that the resolved version of `@swc/core` is one of the supported versions, you can use the `resolutions` field in the `package.json` file, which is supported by Yarn:

```json title="package.json"
"resolutions": {
  "@swc/core": "1.3.56"
}
```

or `overrides` for >npm@8.3

```json title="package.json"
"overrides": {
  "@swc/core": "1.3.56"
}
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
            // Additional Configuration
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
          // Additional Configuration
        },
      ],
    ],
  },
};

module.exports = nextConfig;
```

## Additional Configuration

### Runtime Modules Configuration

You can configure the plugin by passing the `runtimeModules` option. This option is an object that maps runtime module names to their corresponding module paths and export names. It is essential for macros, which rely on referencing the global `i18n` object.

```json
[
  "@lingui/swc-plugin",
  {
    "runtimeModules": {
      "i18n": ["@lingui/core", "i18n"],
      "trans": ["@lingui/react", "Trans"]
    }
  }
]
```

For more details, refer to the [Runtime Configuration](/ref/conf#runtimeconfigmodule) section of the documentation.

### Strip Non-Essential Fields

Lingui strips non-essential fields from builds  if `NODE_ENV` is set to `production`. You can override this behavior by using the `stripNonEssentialFields` option. For example, if you want to keep all fields regardless of the environment, you can set:

```json
[
  "@lingui/swc-plugin",
  {
    "stripNonEssentialFields": false
  }
]
```

## Examples

- [React with Vite and SWC](https://github.com/lingui/js-lingui/tree/main/examples/vite-project-react-swc)
- [Next.js with SWC](https://github.com/lingui/js-lingui/tree/main/examples/nextjs-swc)


:::info
If you would like to suggest a new feature or report a bug, please [open an issue](https://github.com/lingui/swc-plugin/issues) on the GitHub repository.
:::