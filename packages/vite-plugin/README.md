[![License][badge-license]][license]
[![Version][badge-version]][package]
[![Downloads][badge-downloads]][package]

# @lingui/vite-plugin

> Vite plugin that compiles Lingui catalogs on the fly. In summary, the `lingui compile` command isn't needed when using this plugin.

`@lingui/vite-plugin` is part of [LinguiJS][linguijs]. See the [documentation][documentation] for all information, tutorials and examples.

## Installation

```sh
npm install --save-dev @lingui/vite-plugin
# yarn add --dev @lingui/vite-plugin
```

## Usage

### Via `vite.config.ts`

```ts
import { UserConfig } from 'vite';
import { lingui } from '@lingui/vite-plugin'

const config: UserConfig = {
  plugins: [lingui()]
}
```

### Then in Vite-processed code: 

```ts
// *.po files assigned to this loader by default
const { messages } = await import(`./locales/${language}.po`);

// for other extension you have to use `?lingui` suffix
const { messages } = await import(`./locales/${language}.json?lingui`);
```
> See Vite's official documentation for more info about Vite dynamic imports 
> https://vitejs.dev/guide/features.html#dynamic-import


## License

[MIT][license]

[license]: https://github.com/lingui/js-lingui/blob/main/LICENSE
[linguijs]: https://github.com/lingui/js-lingui
[documentation]: https://lingui.dev/
[package]: https://www.npmjs.com/package/@lingui/vite-plugin
[badge-downloads]: https://img.shields.io/npm/dw/@lingui/vite-plugin.svg
[badge-version]: https://img.shields.io/npm/v/@lingui/vite-plugin.svg
[badge-license]: https://img.shields.io/npm/l/@lingui/vite-plugin.svg
