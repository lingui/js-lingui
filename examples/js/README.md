# Using LinguiJS in VanillaJS projects

This example uses the [Lingui Vite plugin](https://lingui.dev/ref/vite-plugin) with the native macro transform, so no Babel setup is needed. [Vitest](https://vitest.dev/) picks up the same configuration from `vite.config.js`.

Install dependencies:

```sh
yarn install
```

Extract messages from the source files:

```sh
yarn extract
```

Compile message catalogs and run the test suite:

```sh
yarn test
```
