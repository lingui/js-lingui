import { CatalogFormatter, CatalogType } from "@lingui/conf"
import { readFile, writeFileIfChanged } from "../utils"
import { RethrownError } from "../rethrownError"

export class FormatterWrapper {
  constructor(private f: CatalogFormatter, private sourceLocale: string) {}

  getCatalogExtension() {
    return this.f.catalogExtension
  }

  getTemplateExtension() {
    return this.f.templateExtension || this.f.catalogExtension
  }

  async write(
    filename: string,
    catalog: CatalogType,
    locale: string
  ): Promise<void> {
    const content = await this.f.serialize(catalog, {
      locale,
      sourceLocale: this.sourceLocale,
      existing: await readFile(filename),
      filename,
    })

    await writeFileIfChanged(filename, content)
  }

  async read(filename: string, locale: string): Promise<CatalogType | null> {
    const content = await readFile(filename)

    if (!content) {
      return null
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
