---
title: Creating a Custom Message Formatter
description: Learn how to write a custom localization message formatter for your project
---

# Custom Formatter

If your project requires a message catalog format that Lingui doesn't [natively support](/ref/catalog-formats), you can create a custom formatter to handle it. A custom formatter allows you to define how extracted strings are formatted into a custom catalog format, providing flexibility for specialized workflows and integration with unique file structures.

## Overview

A formatter is an object with two main functions, `parse` and `serialize`, which define how catalogs are read from and written to your custom format.

The formatter can be configured directly in your `lingui.config.{ts,js}` file - no separate package is needed:

```ts title="lingui.config.{ts,js}"
import { defineConfig } from "@lingui/cli";
import { extractor } from "./my-custom-extractor.ts";

export default defineConfig({
  // [...]
  format: {
    catalogExtension: "json",
    parse: (content: string): CatalogType => JSON.parse(content),
    serialize: (catalog: CatalogType): string => JSON.stringify(catalog),
  },
});
```

## Reference

The shape of formatter is the following:

```ts
export type CatalogFormatter = {
  catalogExtension: string;
  /**
   * Set extension used when extract to template
   * Omit if the extension is the same as catalogExtension
   */
  templateExtension?: string;
  parse(
    content: string,
    ctx: { locale: string | null; sourceLocale: string; filename: string }
  ): Promise<CatalogType> | CatalogType;
  serialize(
    catalog: CatalogType,
    ctx: { locale: string | null; sourceLocale: string; filename: string; existing: string | null }
  ): Promise<string> | string;
};
```

Lingui Catalog is an object with the following structure:

```ts
export type CatalogType = {
  [msgId: string]: MessageType;
};

type CatalogExtra = Record<string, unknown>;

export type MessageType<Extra = CatalogExtra> = {
  message?: string;
  origin?: MessageOrigin[];
  comments?: string[];
  obsolete?: boolean;
  context?: string;
  translation?: string;

  /**
   * the generic field where
   * formatters can store additional data
   */
  extra?: Extra;
};
```

:::caution Important
If you are using TypeScript to create your formatter, you should use the `.ts` extension for your Lingui configuration file.
:::
