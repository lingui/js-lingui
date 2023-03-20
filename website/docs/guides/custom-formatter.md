# Custom Formatter

If your project requires some special format or handling logic you can write your own format implementation.

Formatter is simple object with 2 main functions `parse` and `serialize` which should take LinguiJS catalog and serialize it into string and vice-versa.

You don't need to create a separate package for formatter, you can write it directly in `lingui.config.{ts,js}`

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

The shape for formatter is following:

```ts
export type CatalogFormatter = {
  catalogExtension: string
  /**
   * Set extension used when extract to template
   * Omit if the extension is the same as catalogExtension
   */
  templateExtension?: string
  parse(
    content: string,
    ctx: { locale: string | null; filename: string }
  ): Promise<CatalogType> | CatalogType
  serialize(
    catalog: CatalogType,
    ctx: { locale: string | null; filename: string; existing: string | null }
  ): Promise<string> | string
}
```

Lingui Catalog is an object with following structure:

```ts
export type CatalogType = {
  [msgId: string]: MessageType
}

export type MessageType = {
  message?: string
  origin?: MessageOrigin[]
  comments?: string[]
  extractedComments?: string[]
  obsolete?: boolean
  flags?: string[]
  context?: string
  translation?: string
}
```

:::caution Important
If you use TypeScript to create your formatter, you should use the `ts` extension for your Lingui configuration file.
:::
