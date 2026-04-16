import { CatalogFormatter, CatalogType } from "@lingui/conf"
import { readFile, writeFile } from "../utils.js"
import { RethrownError } from "../rethrownError.js"

export class FormatterWrapper {
  constructor(
    private f: CatalogFormatter,
    private sourceLocale: string,
  ) {}

  getCatalogExtension() {
    return this.f.catalogExtension
  }

  getTemplateExtension() {
    return this.f.templateExtension || this.f.catalogExtension
  }

  async serialize(
    filename: string,
    catalog: CatalogType,
    locale?: string,
    existing?: string,
  ): Promise<string> {
    return await this.f.serialize(catalog, {
      locale,
      sourceLocale: this.sourceLocale,
      existing: existing ?? (await readFile(filename)),
      filename,
    })
  }

  async write(
    filename: string,
    catalog: CatalogType,
    locale?: string,
  ): Promise<void> {
    const existing = await readFile(filename)
    const content = await this.serialize(filename, catalog, locale, existing)

    if (content !== existing) {
      await writeFile(filename, content)
    }
  }

  async read(
    filename: string,
    locale: string | undefined,
  ): Promise<CatalogType | undefined> {
    const content = await readFile(filename)

    if (!content) {
      return undefined
    }

    try {
      return this.f.parse(content, {
        locale,
        sourceLocale: this.sourceLocale,
        filename,
      })
    } catch (e) {
      throw new RethrownError(`Cannot read ${filename}`, e as Error)
    }
  }
}
