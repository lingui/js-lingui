# Using LinguiJS in VanillaJS projects

Prepare the example by installing dependencies and compiling message catalogs:

```sh
yarn install
yarn lingui compile
```

Now, either run full test suit:

```sh
yarn test
```

Or each file individually (you need to have `babel-cli` installed globally):

```sh
babel-node src/messages.js
```
