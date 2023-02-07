# SWC Plugin

[SWC](https://swc.rs/) is an extensible Rust-based platform for the next generation of fast developer tools.

If you're using SWC in your project, you can opt for the `@lingui/swc-plugin`. This plugin, designed for SWC, is a Rust version of [LinguiJS Macro](/docs/ref/macro.md).

## Installation

Install `@lingui/swc-plugin` as a development dependency:

```bash npm2yarn
npm install --save-dev @lingui/swc-plugin
```

## Usage

Add the following configuration to your [`.swcrc`](https://swc.rs/docs/configuration/swcrc) file:

``` json title=".swcrc"
{
  "$schema": "https://json.schemastore.org/swcrc",
  "jsc": {
    "experimental": {
      "plugins": ["@lingui/swc-plugin", {

        // Optional
        // Unlike the JS version this option must be passed as object only.
        // Docs https://lingui.js.org/ref/conf.html#std-config-runtimeConfigModule
        // "runtimeModules": {
        //   "i18n": ["@lingui/core", "i18n"],
        //   "trans": ["@lingui/react", "Trans"]
        // }
      }]
    }
  }
}
```

If you use NextJS, add the following to your `next.config.js`:

```javascript title="next.config.js"
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    swcPlugins: [
      ['@lingui/swc-plugin', {
       // the same options as in .swcrc
      }],
    ],
  },
};

module.exports = nextConfig;
```

## Further reading

- [NextJS 13 Example](https://github.com/lingui/swc-plugin/tree/main/examples/nextjs-13)
- [GitHub Repository](https://github.com/lingui/swc-plugin)
- [NPM Package](https://www.npmjs.com/package/@lingui/swc-plugin)
