import { CatalogFormatter } from "@lingui/conf"
import { formatter } from "@lingui/format-po"
import { expect } from "tstyche"

expect(formatter()).type.toBeAssignableTo<CatalogFormatter>()
expect(
  formatter({
    lineNumbers: true,
    origins: true,
    printLinguiId: true,
  }),
).type.toBeAssignableTo<CatalogFormatter>()
