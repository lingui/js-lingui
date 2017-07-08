**Working on your first Pull Request?** You can learn how from this *free* series [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)

## Setup local development

1. Clone project

```bash
git clone https://github.com/lingui/js-lingui.git
cd js-lingui
```

2. Install development packages

```bash
yarn install
```

3. Bootstrap all packages

```bash
yarn run bootstrap
```

4. Run tests

```bash
# Watch mode
yarn run watch

# Single run
yarn run test
```

## Finalize changes 

After you make any changes, run `yarn run bootstrap` again and then:

1. Check that all test pass

```bash
yarn run test
```

2. Flow doesn't show any errors

```bash
yarn run lint:flow
```

**It's important to run `yarn run bootstrap` before runnning final tests.** Changes in one package *might* break another package. `yarn run bootstrap` ensures that all tests run agains latest package versions.

Package `example-usecase` contains integration tests.

## Add yourself to contributors!

This project uses [all-contributors](https://github.com/kentcdodds/all-contributors) to recognize all contributors who improve `js-lingui` in any way.

```bash
yarn run add -- <yourGitHubName> <type>

# Examples:
# yarn run add -- tricoder42 code
# yarn run add -- tricoder42 code,docs  # type may be also comma separated value
```

See the [key](https://github.com/jfmengels/all-contributors-cli#addupdate-contributors) for all types of contribution.

If you need any help, just raise an issue. I'm happy to help with finalizing PR!

