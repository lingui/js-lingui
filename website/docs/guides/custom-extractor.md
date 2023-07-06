# Custom Extractor

If your project is not working well with Lingui's Extractor, you can write your custom extractor implementation.

That might be the case if you use some experimental features (stage0 - stage2) or frameworks with custom syntax such as Vue.js or Svelte.

```ts title="./my-custom-extractor.ts"
import { extractor as defaultExtractor } from "@lingui/cli/api";

export const extractor: ExtractorType = {
  match(filename: string) {
    return filename.endsWith(".custom");
  },
  extract(filename: string, code: string, onMessageExtracted, ctx: ExtractorCtx) {
    // transform to plain JS + Sourcemaps
    const { code, sourcemaps } = transformMyCustomFileToJs(filename, code);

    // you can acess lingui config from using `ctx.linguiConfig`
    // reuse extractor from cli
    return defaultExtractor.extract(filename, code, onMessageExtracted, { sourcemaps, ...ctx });
  },
};
```

Then in your `lingui.config.ts`:

```ts title="lingui.config.ts"
import { extractor } from './my-custom-extractor.ts'
module.exports = {
  [...]
  extractors: [extractor]
}
```

:::caution Important
If you use TypeScript to create your extractor, you should use the `ts` extension for your Lingui configuration file.
:::
