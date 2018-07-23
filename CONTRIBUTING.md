**Working on your first Pull Request?** You can learn how from this *free* series [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)

## Contributing to the docs

Documentation uses Sphinx and reStructuredText. Source inside the
[docs](https://github.com/lingui/js-lingui/tree/stable-2.x/docs) directory.

1. Go to the `docs` directory

2. Run `pipenv install` to setup Python environemnt (requires Python 3.6).
   If you encounter `ValueError('unknown locale: %s' % localename)`,
   run `export LC_ALL=en_US.UTF-8`, `export LANG=en_US.UTF-8` and try again.

3. Run `pipenv run make livehtml` to build the docs, watch for changes and preview
   documentation locally at [http://127.0.0.1:8000](http://127.0.0.1:8000).

4. It's also possible to run `pipenv run make html` for single build. Incremental builds
   are much faster than the first one as only changed files are built.

## Contributing the code

### Setup local environment

1. Clone project

   ```sh
   git clone https://github.com/lingui/js-lingui.git
   cd js-lingui
   ```

2. Install development packages. This project uses
   [yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) instead of Lerna,
   so running `yarn` installs all development packages and also dependencies for all
   workspaces (inside `packages/*`).

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

### Finalize changes 

1. Check that all tests pass

```bash
yarn test
```

2. Linter doesn't show any errors

```bash
yarn lint
```

3. Now you can create PR and let CI service do their work, but if something
fails, you might want to run full test suit locally:

```bash
node ./scripts/test.js
```

This command builds all packages, simulates creating packages for NPM, run unit tests
and finally runs integration tests using production build.

## Add yourself to contributors

This project uses [all-contributors](https://github.com/kentcdodds/all-contributors) to
recognize all contributors who improve **jsLingui** in any way.

```bash
yarn run add -- <yourGitHubName> <type>

# Examples:
# yarn run add -- tricoder42 code
# yarn run add -- tricoder42 code,doc  # type may be also comma separated value
```

See the [key](https://github.com/jfmengels/all-contributors-cli#addupdate-contributors)
for all types of contribution.

If you need any help, just raise an issue or submit an working draft of PR.
