# Lingui + RSpack Example

This project shows how to use the [Rspack JavaScript bundler](https://www.rspack.dev/guide/introduction.html) with [Lingui JS](https://lingui.dev/) to provide i18n for a React application (TypeScript).

![lingui-rspack-i18n-demo](demo.gif)

## Setup Instructions

1. `cd rspack-project && npm install`
2. `npm run dev` to run the development server.
3. `npm run build` to build the application.

## Update I18n

1. Wrap any messages requiring translation in `<Trans>` or a related macro.
2. `npm run extract` to generate message catalogs in `src/locales/{locale}/messages`.
3. Translate any new messages in the catalogs.
4. `npm run compile` to create runtime catalogs.

## Configuration File Notes

- [rspack.config.js](./rspack-project/rspack.config.js) specifies that that babel should transcompile all `.tsx` files using the `@babel/preset-typscript` and `@babel/preset-react` [presets](https://babeljs.io/docs/presets), as well as the `macros` [plugin](https://babeljs.io/docs/plugins). This step is necessary so that [Lingui Macros](https://lingui.dev/ref/macro) such as `<Trans>` are correctly transcompiled into their respective React components.
- [lingui.config.ts](./rspack-project/lingui.config.ts) specifies the available locales, defaults, and paths where the message catalogs are stored.
- As per the [Rspack documentation](https://www.rspack.dev/guide/loader.html#builtinswc-loader), `builtin:swc-loader` does not currently support plugins, which is why the trans-compilation work is still done in babel. Once SWC plugins are supported, transcompilation should be done with Rspack's `builtin:swc-loader` for improved performance.

## Helpful Resources

- This [blog post](https://betterprogramming.pub/react-app-internationalization-with-linguijs-9486ccd80e07) shows a step-by-step guide to set up LinguiJS with React.
- [Official documentation for React setup with LinguiJS](https://lingui.dev/tutorials/react). This repo closely follows the example from the official docs.