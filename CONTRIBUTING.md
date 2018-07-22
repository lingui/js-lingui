**Working on your first Pull Request?** You can learn how from this *free* series [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)

## Setup local development

1. Clone project

```bash
git clone https://github.com/lingui/js-lingui.git
cd js-lingui
```

2. Install development packages. This project uses [yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) instead of Lerna, so simply running `yarn` installs all development packages and also dependencies for all workspaces (inside `packages/*`).

```bash
yarn
```

3. Run tests

```bash
# Watch mode
yarn watch

# Single run
yarn test
```

## Finalize changes 

1. Check that all test pass

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

This command builds all packages, run unit tests and integration tests, so it
takes some time.

## Contributing to the docs

Documentation uses Sphinx and reStructuredText. It's inside the `docs` directory.

1. To setup python virtualenv, run `pipenv install` inside `docs`. If you encounter `ValueError('unknown locale: %s' % localename)`, run `export LC_ALL=en_US.UTF-8` and `export LANG=en_US.UTF-8` and repeat.

2. Run `pipenv run make html` to build the docs.

3. After every change, re-run the command to rebuild the docs. Incremental builds are much faster than the first one.

## Add yourself to contributors!

This project uses [all-contributors](https://github.com/kentcdodds/all-contributors) to recognize all contributors who improve `js-lingui` in any way.

```bash
yarn run add -- <yourGitHubName> <type>

# Examples:
# yarn run add -- tricoder42 code
# yarn run add -- tricoder42 code,doc  # type may be also comma separated value
```

See the [key](https://github.com/jfmengels/all-contributors-cli#addupdate-contributors) for all types of contribution.

If you need any help, just raise an issue. I'm happy to help with finalizing PR!

