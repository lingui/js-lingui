**Working on your first Pull Request?** You can learn how from this *free* series [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)

## Contributing to the docs

Documentation uses Sphinx and reStructuredText. Source inside the
[docs](https://github.com/lingui/js-lingui/tree/master/docs) directory.

1. Go to the `docs` directory

2. Run `pipenv install` to setup Python environemnt (requires Python 3.6).
   If you encounter `ValueError('unknown locale: %s' % localename)`,
   run `export LC_ALL=en_US.UTF-8`, `export LANG=en_US.UTF-8` and try again.

3. Run `pipenv run make livehtml` to build the docs, watch for changes and preview
   documentation locally at [http://127.0.0.1:8000](http://127.0.0.1:8000).

4. It's also possible to run `pipenv run make html` for single build. Incremental builds
   are much faster than the first one as only changed files are built.

## Contributing the code

This project uses [yarn][YarnInstall] package manager. Please follow
[official][YarnInstall] docs to install it.

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

### Using development version in your project

After you successfully fix a bug or add a new feature, you most probably want
to test it in your project as soon as possible.

`jsLingui` uses [yalc](https://www.npmjs.com/package/yalc) to run integration tests
on production build. You can do the same in your project:

1. Build all packages:

   ```sh
   yarn release:build
   ```
  
2. Packages are inside `build/packages` directory. First, run `yalc publish` in each
   of them and then run `yalc link <package>` for each `@lingui/` dependency in your
   project. Now your project uses your local version of `jsLingui`.
  
3. After you make some changes, you need to run `yarn release:build` only.

### Finalize changes 

Please make sure that all tests pass and linter doesn't report any error before
submitting a PR (Don't worry though! If you can't figure out the problem, create a PR
anyway and we'll help you).

- `yarn lint` - Linting
- `yarn test` - Quick test suite (sufficient)
- `yarn release:test` - Full test suite (recommended)

`yarn release:test` builds all packages, simulates creating packages for NPM, runs unit
tests and finally runs integration tests using production build.

Now you can create PR and let CI service do their work!

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

[YarnInstall]: https://yarnpkg.com/en/docs/install#mac-stable
