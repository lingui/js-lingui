---
title: Creating a Custom Message Extractor
description: Learn how to write a custom message extractor for your project
---

# Custom Extractor

## Supported Syntax of the Default Extractor

The default extractor supports **TypeScript**, **Flow**, and **JavaScript** (Stage 3) out of the box. It does **not** intentionally use your project's Babel configuration.

### Why doesn't it use the project's Babel config?

Babel plugins from your configuration define transformations, and some of these may interfere with or slow down the extraction process. The extractor doesn't need to transform your code; it only analyzes it. Therefore, it's designed to understand different syntax without concern for how the code is transpiled or down-leveled.

We continually update the extractor to stay in line with the latest ECMAScript features. However, if you find that a recently added Stage 3 feature isn't working as expected, please [create an issue](https://github.com/lingui/js-lingui/issues/new/choose).

## Supporting Experimental ECMAScript Syntax (Stage 0 - Stage 2)

If you use experimental features (Stage 0 - Stage 2), you'll need to configure a custom list of parser plugins. This can be done by overriding the default extractor and using the `extractFromFileWithBabel()` function.

### Example: Configuring Parser Plugins

```ts title="lingui.config.ts"
import { extractFromFileWithBabel } from "@lingui/cli/api";
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

const config: LinguiConfig = {
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
};

export default config;
```

## Supporting Other Frameworks or Custom Syntax

If you're working with files that aren't valid JavaScript, you can create a custom extractor to handle them.

### Example: Custom Extractor Implementation

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

### Adding the Custom Extractor to Your Configuration

```ts title="lingui.config.ts"
import { extractor } from "./my-custom-extractor.ts";
import { LinguiConfig } from "@lingui/conf";

const config: LinguiConfig = {
  // [...]
  extractors: [extractor],
};

export default config;
```

:::caution Important
If you're using TypeScript to create your extractor, ensure that your Lingui configuration file has the `.ts` extension.
:::
