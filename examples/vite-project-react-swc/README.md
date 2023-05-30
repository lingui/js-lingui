## Example project using Vite + SWC Compiler with LinguiJS Plugin

## SWC Compatibility
SWC Plugin support is still experimental. Semver backwards compatibility between different `@swc/core` versions is not guaranteed.

Therefore, you need to select an appropriate version of the Lingui plugin to match compatible `@swc/core` version.

For more information on compatibility, please refer to the [Compatibility section](https://github.com/lingui/swc-plugin#compatibility).

**❗️Note**

The version of `@swc/core` is specified within the `@vitejs/plugin-react-swc` package.

To ensure that the resolved version of `@swc/core` is one of the supported versions, this example utilizes the `resolutions` field in the `package.json` file, which is supported by Yarn:

```json
"resolutions": {
  "@swc/core": "1.3.56"
},
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

## LinguiJS Related Commands

Extract messages from sourcecode:
```bash
npm run lingui:extract
# or
yarn lingui:extract
# or
pnpm lingui:extract
```
