# Setup with Create React App

[Create React App](https://github.com/facebook/create-react-app) is a framework for writing React apps with no build configuration. This guide assumes you use Create React App 2.0 (the default version).

## Install

1.  Follow [Create React App](https://github.com/facebook/create-react-app) documentation for more info. Bootstrap your project with following commands:

    ```bash
    npx create-react-app my-app
    cd my-app
    ```

2.  Install `@lingui/cli`, `@lingui/macro` and Babel core packages as a development dependencies and `@lingui/react` as a runtime dependency.

    ```bash npm2yarn
    npm install --save-dev @lingui/cli @lingui/macro
    npm install --save @lingui/react
    ```

    In case you get errors with `import/no-extraneous-dependencies` eslint rule feel free to add the dependencies as non-dev

    ```bash npm2yarn
    npm install --save-dev @lingui/cli
    npm install --save @lingui/macro @lingui/react
    ```

3.  Create `lingui.config.js` file with LinguiJS configuration in root of your project (next to `package.json`):

    ```js title="lingui.config.js"
    /** @type {import('@lingui/conf').LinguiConfig} */
    module.exports = {
      locales: ["en", "cs", "fr"],
      sourceLocale: "en",
      catalogs: [
        {
          path: "<rootDir>/src/locales/{locale}/messages",
          include: ["src"],
        },
      ],
      format: "po",
    };
    ```

    This configuration will extract messages from source files inside `src` directory and write them into message catalogs in `src/locales` (English catalog would be in e.g: `src/locales/en/messages.po`). Finally, PO format is recommended.
    See [`format`](/docs/ref/catalog-formats.md) documentation for other available formats.

4.  Optionally, add following scripts to your `package.json` for convenience:

    ```json title="package.json"
    {
      "scripts": {
        "extract": "lingui extract",
        "compile": "lingui compile"
      }
    }
    ```

5.  Check the installation by running extract command:

    ```bash npm2yarn
    npm run extract
    ```

    There should be no error and you can find extracted messages in `src/locales`.

:::tip
Don't miss the [Lingui ESLint Plugin](/docs/ref/eslint-plugin.md) which can help you find and prevent common l10n mistakes in your code.
:::

Congratulations! You've successfully set up project with LinguiJS. Now it's good time to follow [React tutorial](/docs/tutorials/react.md) or read about [ICU Message Format](/docs/ref/message-format.md) which is used in messages.

## Further reading

Checkout these reference guides for full documentation:

- [Internationalization of React apps](/docs/tutorials/react.md)
- [Common i18n patterns in React](/docs/tutorials/react-patterns.md)
- [`@lingui/react` reference documentation](/docs/ref/react.md)
- [ICU Message Format](/docs/ref/message-format.md)
- [CLI reference](/docs/ref/cli.md)
- [Configuration reference](/docs/ref/conf.md)
