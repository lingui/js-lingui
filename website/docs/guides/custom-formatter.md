---
title: Creating a Custom Message Formatter
description: Learn how to write a custom localization message formatter for your project.
keywords: [formatter, format, localization, internationalization, i18n, l10n, catalog, file format, custom]
---

# Custom Formatter

If your project requires some special format or handling logic, you can write your own format implementation.

Formatter is a simple object with 2 main functions `parse` and `serialize`, which should take Lingui catalog and serialize it to string and vice versa.

You don't need to create a separate package for formatter, you can write it directly in `lingui.config.{ts,js}`.

```ts title="lingui.config.{ts,js}"
import { extractor } from './my-custom-extractor.ts'
module.exports = {
  [...]
  format: {
    catalogExtension: "json",
    parse: (content: string): CatalogType => JSON.parse(content),
    serialize: (catalog: CatalogType): string => JSON.stringify(catalog),
  }
}
```

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
If you are using TypeScript to build your formatter, you should use the `ts` extension for your Lingui configuration file.
:::
