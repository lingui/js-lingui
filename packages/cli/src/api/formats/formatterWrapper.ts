import { CatalogFormatter, CatalogType } from "@lingui/conf"
import { readFile, writeFileIfChanged } from "../utils.js"
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

  async write(
    filename: string,
    catalog: CatalogType,
    locale?: string,
  ): Promise<void> {
    const content = await this.f.serialize(catalog, {
      locale,
      sourceLocale: this.sourceLocale,
      existing: await readFile(filename),
      filename,
    })

    await writeFileIfChanged(filename, content)
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
