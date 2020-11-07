[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/cli

> lingui command line library for manipulating message catalogues

`@lingui/cli` is part of [LinguiJS][linguijs]. See the [documentation][documentation] for all information, tutorials and examples.

## Installation

The library can be installed globally or locally using `yarn` or `np`. The recommended way is installing the package locally. This ensures that everyone who uses the project has the same version and does not need to install additional packages.

```
npm install --save-dev @lingui/cli
# or using yarn
yarn add --dev @lingui/cli
```

To run the library locally there are three options, with the first one been recommended one.

### 1) Add commands to scripts

Add these scripts to your `package.json`.

```json
{
  "scripts": {
    "extract": "lingui extract",
    "compile": "lingui compile"
  }
}
```

Then you can use:

```sh
npm run extract
npm run compile
```

### 2) Use NPX

You can run the scripts directly using a tool for executing Node packages `NPX`. `NPX` is included in `NPM` version 5.2 and higher.

```
npx lingui extract
npx lingui compile
```

### 3) Run commands directly

You can run commands directly from `node_modules` folder.

```
node_modules/.bin/lingui extract
node_modules/.bin/lingui compile
```

## Usage

See the [tutorial][tutorial] or [reference][reference] documentation.

## License

This package is licensed under [MIT][license] license.

[license]: https://github.com/lingui/js-lingui/blob/main/LICENSE
[linguijs]: https://github.com/lingui/js-lingui
[documentation]: https://lingui.js.org/
[tutorial]: https://lingui.js.org/tutorials/cli.html
[reference]: https://lingui.js.org/ref/cli.html
[package]: https://www.npmjs.com/package/@lingui/cli
[badge-downloads]: https://img.shields.io/npm/dw/@lingui/cli.svg
[badge-version]: https://img.shields.io/npm/v/@lingui/cli.svg
[badge-license]: https://img.shields.io/npm/l/@lingui/cli.svg
