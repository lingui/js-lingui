# Setup with React project

:::info
If you use Create React App, even ejected, follow [LinguiJS and Create React App](/docs/tutorials/setup-cra.md) setup guide.
:::

This setup guide is for any project which uses React.

## Install

1.  Install `@lingui/cli`, `@lingui/macro`, `babel-plugin-macros` and Babel [^1] core packages as a development dependencies and `@lingui/react` as a runtime dependency.

    ```bash npm2yarn
    npm install --save-dev @lingui/cli @babel/core
    npm install --save-dev @lingui/macro babel-plugin-macros
    npm install --save @lingui/react
    ```

    :::tip
    For those who prefer not to use Babel, Lingui offers the [SWC Plugin](/docs/ref/swc-plugin.md) as an alternative.
    :::

    :::note
    It's recommended to install `@lingui/macro` package as a production dependency rather than development one to avoid `import/no-extraneous-dependencies` errors in ESLint.
    :::

2.  Add `macros` plugin to Babel config (e.g: `.babelrc`):

    ```json
    {
      "plugins": ["macros"]
    }
    ```

    :::info
    If you use any preset, check first if it contains `macros` plugin. These presets already includes `macros` plugin: `react-scripts`
    :::

3.  Create `lingui.config.js` file with LinguiJS configuration in root of your project (next to `package.json`). Replace `src` with a directory name where you have source files:

    ```js title="lingui.config.js"
    /** @type {import('@lingui/conf').LinguiConfig} */
    module.exports = {
      locales: ["en", "cs", "fr"],
      catalogs: [
        {
          path: "<rootDir>/src/locales/{locale}/messages",
          include: ["src"],
        },
      ],
      format: "po",
    };
    ```

    PO format is recommended for message catalogs. See [`format`](/docs/ref/catalog-formats.md) documentation for other available formats.

4.  Add following scripts to your `package.json`:

    ```json title="package.json"
    {
      "scripts": {
        "extract": "lingui extract",
        "compile": "lingui compile"
      }
    }
    ```

5.  Check the installation by running:

    ```bash npm2yarn
    npm run extract
    ```

    There should be no error and you should see output similar following:

    ```bash npm2yarn
    > npm run extract

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

Congratulations! You've successfully set up project with LinguiJS. Now it's good time to follow [React tutorial](/docs/tutorials/react.md) or read about [ICU Message Format](/docs/ref/message-format.md) which is used in messages.

## Further reading

Checkout these reference guides for full documentation:

- [Internationalization of React apps](/docs/tutorials/react.md)
- [Common i18n patterns in React](/docs/tutorials/react-patterns.md)
- [`@lingui/react` reference documentation](/docs/ref/react.md)
- [ICU Message Format](/docs/ref/message-format.md)
- [CLI reference](/docs/ref/cli.md)
- [Configuration reference](/docs/ref/conf.md)

[^1]: For those who prefer not to use Babel, Lingui offers the [SWC Plugin](/docs/ref/swc-plugin.md) as an alternative.
