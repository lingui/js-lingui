[![License][Badge-License]][License]
[![Version][Badge-Version]][Package]
[![Downloads][Badge-Downloads]][Package]

# @lingui/cli

> lingui command line tools for manipulating message catalogues

`@lingui/cli` is part of [LinguiJS][LinguiJS]. See the [documentation][Documentation] for all information, tutorials and examples.

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

See the [tutorial][Tutorial] or [reference][Reference] documenation.

## License

This package is licensed under [MIT][License] license.

[License]: https://github.com/lingui/js-lingui/blob/master/LICENSE
[LinguiJS]: https://github.com/lingui/js-lingui
[Documentation]: https://lingui.js.org/
[Tutorial]: https://lingui.js.org/tutorials/cli.html
[Reference]: https://lingui.js.org/ref/cli.html
[Package]: https://www.npmjs.com/package/@lingui/cli
[Badge-Downloads]: https://img.shields.io/npm/dw/@lingui/cli.svg
[Badge-Version]: https://img.shields.io/npm/v/@lingui/cli.svg 
[Badge-License]: https://img.shields.io/npm/l/@lingui/cli.svg
