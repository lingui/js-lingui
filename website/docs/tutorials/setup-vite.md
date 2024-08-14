---
title: Vite project Internationalization (i18n)
description: Learn how to set up internationalization with Lingui for your Vite project
---

# Setup with Vite

The Lingui Vite integration:

- Supports both [@vitejs/plugin-react](https://www.npmjs.com/package/@vitejs/plugin-react) and [@vitejs/plugin-react-swc](https://www.npmjs.com/package/@vitejs/plugin-react-swc)
- Compiles `.po` catalogs on the fly

## Setup with [@vitejs/plugin-react](https://www.npmjs.com/package/@vitejs/plugin-react) {#setup-with-vitejs-plugin-react}

`@vitejs/plugin-react` uses Babel to transform your code. LinguiJS relies on `babel-plugin-macros` to compile JSX to [ICU Message Format](/docs/guides/message-format.md) and for automatic ID generation.

1.  Install `@lingui/cli`, `@lingui/vite-plugin`, `babel-plugin-macros` as development dependencies and `@lingui/macro`, `@lingui/react` as a runtime dependency:

    ```bash npm2yarn
    npm install --save-dev @lingui/cli @lingui/vite-plugin babel-plugin-macros
    npm install --save @lingui/react @lingui/macro
    ```

2.  Setup Lingui in `vite.config.ts`:

    :::info
    `@vitejs/plugin-react` does not use babel config (e.g. `babel.rc`) from your project by default. You have to enable it manually or specify babel options directly in `vite.config.ts`
    :::

    ```ts title="vite.config.ts"
    import { defineConfig } from "vite";
    import react from "@vitejs/plugin-react";
    import { lingui } from "@lingui/vite-plugin";

    export default defineConfig({
      plugins: [
        react({
          babel: {
            plugins: ["macros"],
          },
        }),
        lingui(),
      ],
    });
    ```

## Setup with [@vitejs/plugin-react-swc](https://www.npmjs.com/package/@vitejs/plugin-react-swc) {#setup-with-vitejs-plugin-react-swc}

`@vitejs/plugin-react-swc` uses [SWC](https://swc.rs/) to transform your code, which is 20x faster than Babel. LinguiJS relies on [`@lingui/swc-plugin`](/docs/ref/swc-plugin.md) to compile JSX to [ICU Message Format](/docs/guides/message-format.md) and for automatic ID generation.

1.  Install `@lingui/cli`, `@lingui/swc-plugin` as development dependencies and `@lingui/macro`, `@lingui/react` as a runtime dependency:

    ```bash npm2yarn
    npm install --save-dev @lingui/cli @lingui/vite-plugin @lingui/swc-plugin
    npm install --save @lingui/react @lingui/macro
    ```

    :::note
    SWC Plugin support is still experimental. Semver backwards compatibility between different `@swc/core` versions [is not guaranteed](https://github.com/swc-project/swc/issues/5060).

    You need to select an appropriate version of the `@lingui/swc-plugin` to match compatible `@swc/core` version.

    The version of `@swc/core` is specified within the `@vitejs/plugin-react-swc` package.

    To ensure that the resolved version of `@swc/core` is one of the supported versions, you may utilize the `resolutions` field in the `package.json` file, which is supported by Yarn:

    ```json
    "resolutions": {
      "@swc/core": "1.3.56"
    },
    ```

    or `overrides` for >npm@8.3

    ```json
    "overrides": {
      "@swc/core": "1.3.56"
    },
    ```

    For more information on compatibility, please refer to the [Compatibility section](https://github.com/lingui/swc-plugin#compatibility).
    :::

2.  Setup Lingui in `vite.config.ts`:

    ```ts title="vite.config.ts"
    import { defineConfig } from "vite";
    import react from "@vitejs/plugin-react-swc";
    import { lingui } from "@lingui/vite-plugin";

    export default defineConfig({
      plugins: [
        react({
          plugins: [["@lingui/swc-plugin", {}]],
        }),
        lingui(),
      ],
    });
    ```

## Further Setup

1. Create a `lingui.config.ts` file with LinguiJS configuration in the root of your project (next to `package.json`). Replace `src` with the directory name where you have source files:

```ts title="lingui.config.ts"
import type { LinguiConfig } from "@lingui/conf";

const config: LinguiConfig = {
  locales: ["en", "cs", "fr"],
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}",
      include: ["src"],
    },
  ],
};

export default config;
```

PO format is recommended for message catalogs, and could be compiled on the fly thanks to `@lingui/vite-plugin`.

See [`format`](/docs/ref/catalog-formats.md) documentation for other available formats.

2. Add the following scripts to your `package.json`:

```json title="package.json"
{
  "scripts": {
    "messages:extract": "lingui extract"
  }
}
```

3. Check the installation by running:

   ```bash npm2yarn
   npm run messages:extract
   ```

   There should be no error and you should see output similar following:

   ```bash npm2yarn
   > npm run messages:extract

   Catalog statistics:
   ┌──────────┬─────────────┬─────────┐
   │ Language │ Total count │ Missing │
   ├──────────┼─────────────┼─────────┤
   │ cs       │     0       │   0     │
   │ en       │     0       │   0     │
   │ fr       │     0       │   0     │
   └──────────┴─────────────┴─────────┘

   (use "lingui extract" to update catalogs with new messages)
   (use "lingui compile" to compile catalogs for production)
   ```

   This command should create `.po` catalogs in the `src/locales/` folder:

   ```bash
   src
   └── locales
       ├── cs.po
       ├── en.po
       └── fr.po
   ```

4. Import `.po` those files directly in your Vite processed code:

   ```ts
   export async function dynamicActivate(locale: string) {
     const { messages } = await import(`./locales/${locale}.po`);

     i18n.load(locale, messages);
     i18n.activate(locale);
   }
   ```

:::tip
Don't miss the [Lingui ESLint Plugin](/docs/ref/eslint-plugin.md) which can help you find and prevent common l10n mistakes in your code.
:::

See the [guide about dynamic loading catalogs](/docs/guides/dynamic-loading-catalogs.md) for more info.

See [Vite's official documentation](https://vitejs.dev/guide/features.html#dynamic-import) for more info about Vite dynamic imports.

Congratulations! You've successfully set up a Vite project with LinguiJS. Now it's a good time to follow the [React tutorial](/docs/tutorials/react.md) or read about [ICU Message Format](/docs/guides/message-format.md) which is used in messages.
