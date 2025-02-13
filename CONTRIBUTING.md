# Contributing

:tada: First off, thanks for taking the time to contribute! :tada:

The following is a set of guidelines for contributing to Lingui. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

This project and everyone participating in it are governed by the [Code of Conduct](/CODE_OF_CONDUCT.md). We expect that all community members adhere to the guidelines within.

**Working on your first Pull Request?** You can learn how from this _free_ series [How to Contribute to an Open Source Project on GitHub](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github).

## Contributing to the docs

The documentation is based on [Docusaurus](https://docusaurus.io/) framework. Source inside the [website](https://github.com/lingui/js-lingui/tree/main/website) directory.

- Go to the `website` directory:

  ```sh
  cd website
  ```

- Install dependencies:

  ```sh
  yarn install
  ```

- To build the docs, watch for changes and preview documentation locally at [http://localhost:3000/](http://localhost:3000/):

  ```sh
  yarn start
  ```

- It's also possible to run `yarn build` for single build. Incremental builds are much faster than the first one as only changed files are built.

- Please lint and validate the documentation before submitting any changes:

  ```sh
  yarn lint
  yarn checkFormat
  ```

## Contributing the code

This project uses [yarn][yarninstall] package manager. Please follow [official][yarninstall] docs to install it.

### Setup local environment

1. Clone project

   ```sh
   git clone https://github.com/lingui/js-lingui.git
   cd js-lingui
   ```

2. Install development packages. This project uses [yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/), so running `yarn` installs all development packages and also dependencies for all workspaces (inside `packages/*`).

   ```sh
   yarn
   ```

3. Run tests

   ```sh
   # Watch mode
   yarn watch

   # Single run
   yarn test
   ```

### Using development version in your project

After you successfully fix a bug or add a new feature, you most probably want to test it in a real-world project as soon as possible.

There are two documented ways to do this: first is a generic way described in the next paragraph, second uses the [React Native example](./examples/react-native).

#### Testing changes using Verdaccio

`jsLingui` uses [verdaccio](https://verdaccio.org/), a lightweight local NPM registry, to install local build of packages in examples. You can do the same in your project:

1. Run `verdaccio` locally in docker (follow [verdaccio guide](https://verdaccio.org/docs/en/what-is-verdaccio.html) if you don't want to run it in Docker):

   ```sh
   docker run -d -it --rm --name verdaccio -p 4873:4873 verdaccio/verdaccio
   ```

   > Make sure that your verdaccio user is the same that appears in verdacio-release.js script.

2. Publish local build of packages to registry. Run local release script:

   ```sh
   yarn verdaccio:release
   ```

3. If you enter inside http://0.0.0.0:4873 (verdaccio instance), you will see your packages published, so you're ready to install them.

4. Inside your project, run:

   with NPM:

   ```sh
   # Point to your local registry
   npm config set registry http://0.0.0.0:4873/
   # Run update-by-scope will update all @lingui packages
   npx update-by-scope @lingui
   ```

   with Yarn Classic (1.\*):

   ```sh
   yarn upgrade --scope @lingui --registry http://0.0.0.0:4873/ --latest
   ```

   with Yarn Berry:

   ```sh
   YARN_NPM_REGISTRY_SERVER=http://0.0.0.0:4873/ yarn up "@lingui/*"
   ```

5. After you make some changes, you need to run the same process. (Releasing + yarn upgrade)

6. When finished testing, restore default registry (only for NPM)

   ```sh
   npm config set registry https://registry.npmjs.org/
   ```

#### Testing changes using the React Native example

As an alternative to Verdaccio, you can use the example app for React Native included in the repo and test out the changes on iOS or Android.

The process is described in the [React Native example](./examples/react-native) readme.

### Finalize changes

Please make sure that all tests pass and linter doesn't report any error before submitting a PR (Don't worry though! If you can't figure out the problem, create a PR anyway, and we'll help you).

- `yarn lint:all` - Linting & Type testing
- `yarn test` - Quick test suite (sufficient)
- `yarn release:build` - Build all packages (recommended)
- `yarn test:all` - Full test suite (recommended)

This project uses [changesets](https://github.com/changesets/changesets) to manage versioning and changelogs. If you're adding a new feature or fixing a bug, be sure to add a changeset that will describe the changes to users. Documentation-only and non-package changes do not need changesets.

```sh
yarn changeset
```

The command above will guide you through the process of creating a new changeset. After you've created a changeset, you can commit it to your branch.

> **Note**
> This project uses the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for commit messages and PR titles.

If you need any help, just raise an issue or submit a working draft of PR.

[yarninstall]: https://yarnpkg.com/en/docs/install
