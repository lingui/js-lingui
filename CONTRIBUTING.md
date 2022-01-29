**Working on your first pull request?** You can learn how from this _free_ series
[How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)

## Contributing to the docs

The documentation uses Sphinx and reStructuredText. Source inside the
[docs](https://github.com/lingui/js-lingui/tree/main/docs) directory.

1. Go to the `docs` directory

2. Run `pipenv install` to setup Python environment (requires Python 3.6).
   If you encounter `ValueError('unknown locale: %s' % localename)`,
   run `export LC_ALL=en_US.UTF-8 && export LANG=en_US.UTF-8` and try again.

3. Run `pipenv run make livehtml` to build the docs, watch for changes and preview
   documentation locally at [http://127.0.0.1:8000](http://127.0.0.1:8000).

4. It's also possible to run `pipenv run make html` for a single build. Subsequent builds
   are much faster than the initial build because only modified files are built.

## Contributing the code

This project uses [yarn][yarninstall] package manager. Please follow the
[official][yarninstall] documentation to install it.

### Setup your local environment

1. Clone the project

   ```sh
   git clone https://github.com/lingui/js-lingui.git
   cd js-lingui
   ```

2. Install the development packages. This project uses
   [yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) instead of Lerna,
   so running `yarn` installs all development packages and also dependencies for all
   workspaces (inside `packages/*`).

   ```sh
   yarn
   ```

3. Run the test suite

   ```sh
   # Watch mode
   yarn watch

   # Single run
   yarn test
   ```

   NOTE: if you are using an IDE to run the test suite make sure to use the correct Jest config.
   For unit tests use `-c scripts/jest/config.unit.js`. For integration tests use the
   build packages (created using `yarn release:build`) and config `-c scripts/jest/config.integration.js`.
   See [package.json](./package.json) for more information.

   If you run the test suite manually instead of using `yarn watch` or `yarn test` commands and your tests
   fail due to missing locale data (typically you'll get wrong number and currency formating)
   make sure you have `NODE_ICU_DATA` variable set: `NODE_ICU_DATA=node_modules/full-icu`.

### Using the development version in your project

After you successfully fix a bug or add a new feature, you most probably want
to test it in your project as soon as possible.

`jsLingui` uses [verdaccio](https://verdaccio.org/), a lightweight local NPM registry, to install
the local build of packages in examples. You can do the same in your project:

1. Run `verdaccio` locally in Docker (follow [verdaccio guide](https://verdaccio.org/docs/en/what-is-verdaccio.html)
   if you don't want to run it in Docker):

   ```sh
   docker run -d -it --rm --name verdaccio -p 4873:4873 verdaccio/verdaccio
   ```

> Make sure that your verdaccio user is the same that appears in `verdacio-release.js`.

2. Publish the local build of packages to the registry. Run the local release script:

   ```sh
   node ./scripts/verdaccio-release.js
   ```

3. If you enter inside http://0.0.0.0:4873 (verdaccio instance), you will see your packages published, so you're ready to install them.

4. Inside your project, run:

```sh
   # Install a small package to update all lingui packages
   npm i -g update-by-scope
   # Point to your local registry
   npm config set registry http://0.0.0.0:4873/
   # Run update-by-scope will update all @lingui packages
   update-by-scope @lingui
```

5. After you make changes, you need to run the same process. (Releasing + yarn upgrade)

6. Once you finish testing, restore the default registry

```sh
   npm config set registry https://registry.npmjs.org/
```

### Finalize changes

Please make sure that all tests pass and the linter doesn't report any errors before
submitting a PR (Don't worry though! If you can't figure out the problem, create a PR
anyway and we'll help you).

- `yarn lint:all` - Linting & Type testing
- `yarn test` - Quick test suite (sufficient)
- `yarn release:test` - Full test suite (recommended)

`yarn release:test` builds all packages, simulates creating packages for NPM, runs unit
tests and finally runs integration tests using the production build.

**Note**: Don't commit `scripts/build/results.json` created by `yarn release:test`.

Now you can create a PR and let the CI service do its work!

If you need help, just raise an issue or submit a draft PR.

[yarninstall]: https://yarnpkg.com/en/docs/install
