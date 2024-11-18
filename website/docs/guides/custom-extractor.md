---
title: Creating a Custom Message Extractor
description: Learn how to write a custom message extractor for your project
---

# Custom Extractor

Lingui's default extractor supports JavaScript (Stage 3), TypeScript, and Flow out of the box, covering most standard and modern syntax features. However, if your project relies on experimental ECMAScript syntax or custom file formats, a custom extractor gives you the flexibility to handle these scenarios.

### Why It Doesn't Use Your Babel Config?

Babel plugins from your configuration define transformations, and some of these may interfere with or slow down the extraction process. The extractor doesn't have to transform your code, it just analyzes it. Therefore, it's designed to understand different syntax without worrying about how the code is transpiled or down-levelled.

:::info
We are constantly updating the extractor to keep up with the latest ECMAScript features. However, if you find that a recently added Stage 3 feature doesn't work as expected, please [create an issue](https://github.com/lingui/js-lingui/issues/new/choose).
:::

## Experimental ECMAScript Syntax

If you are using experimental features (Stage 0 - Stage 2), you'll need to configure a custom list of parser plugins. This can be done by overriding the default extractor and using the `extractFromFileWithBabel()` function:

```ts title="lingui.config.ts"
import { extractFromFileWithBabel, defineConfig } from "@lingui/cli/api";
import type { ParserPlugin } from "@babel/parser";

export function getBabelParserOptions(filename: string) {
  // https://babeljs.io/docs/en/babel-parser#latest-ecmascript-features
  const parserPlugins: ParserPlugin[] = ["importAttributes", "explicitResourceManagement"];

  if ([/\.ts$/, /\.mts$/, /\.cts$/, /\.tsx$/].some((r) => filename.match(r))) {
    parserPlugins.push("typescript");
  }

  if ([/\.js$/, /\.jsx$/, /\.tsx$/].some((r) => filename.match(r))) {
    parserPlugins.push("jsx");
  }

  return parserPlugins;
}

export default defineConfig({
  // [...]
  extractors: [
    {
      match(filename: string) {
        return filename.match(/\.[cm][tj]sx?$/);
      },
      async extract(filename, code, onMessageExtracted, ctx) {
        return extractFromFileWithBabel(filename, code, onMessageExtracted, ctx, {
          // https://babeljs.io/docs/babel-parser#plugins
          plugins: getBabelParserOptions(filename),
        });
      },
    },
  ],
});
```

## Other Frameworks or Custom Syntax

If you're working with files that aren't valid JavaScript, you can create a custom extractor to handle them:

```ts title="./my-custom-extractor.ts"
import { extractor as defaultExtractor } from "@lingui/cli/api";

export const extractor: ExtractorType = {
  match(filename: string) {
    return filename.endsWith(".custom");
  },
  extract(filename: string, code: string, onMessageExtracted, ctx: ExtractorCtx) {
    // Transform the file to plain JS + Sourcemaps
    const { code: transformedCode, sourcemaps } = transformMyCustomFileToJs(filename, code);

    // Access Lingui config via `ctx.linguiConfig`
    // Reuse the default CLI extractor
    return defaultExtractor.extract(filename, transformedCode, onMessageExtracted, {
      sourcemaps,
      ...ctx,
    });
  },
};
```

### Adding the Custom Extractor to the Configuration

To use the custom extractor, you need to add it to your Lingui configuration file:

```ts title="lingui.config.ts" {1,6}
import { extractor } from "./my-custom-extractor.ts";
import { defineConfig } from "@lingui/cli";

export default defineConfig({
  // [...]
  extractors: [extractor],
});
```

:::caution Important
If you are using TypeScript to create your extractor, you should use the `.ts` extension for your Lingui configuration file.
:::
