[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/cli

> lingui command line tools for manipulating message catalogues

`@lingui/cli` is part of [LinguiJS][linguijs]. See the [documentation][documentation] for all information, tutorials and examples.

## Installation

```sh
npm install --global @lingui/cli
# yarn global add @lingui/cli
```

**Note:** If you don't wist to install package globally, it works locally
as well. However, you need either run it from `node_modules/.bin/lingui` or
add it to your `package.json`:

```json
{
  "scripts": {
    "add-locale": "lingui add-locale",
    "extract": "lingui extract",
    "compile": "lingui compile"
  }
}
```

Then you can use:

```sh
npm run add-locale -- en cs
npm run extract
npm run compile
```

## Usage

See the [tutorial][tutorial] or [reference][reference] documenation.

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
